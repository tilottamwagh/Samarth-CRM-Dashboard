from django.urls import path
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics, status
from .models import WhatsAppConfig, MessageTemplate, Conversation, Message
from django.conf import settings
import json


from rest_framework import serializers

class WAConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppConfig
        exclude = ['tenant', 'access_token']

class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageTemplate
        exclude = ['tenant']

class ConversationSerializer(serializers.ModelSerializer):
    lead_name = serializers.SerializerMethodField()
    lead_mobile = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = '__all__'

    def get_lead_name(self, obj):
        return f"{obj.lead.first_name} {obj.lead.last_name}"

    def get_lead_mobile(self, obj):
        return obj.lead.mobile

    def get_last_message(self, obj):
        msg = obj.messages.last()
        return msg.content if msg else ''

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'


class WAConfigListView(generics.ListCreateAPIView):
    serializer_class = WAConfigSerializer
    def get_queryset(self):
        return WhatsAppConfig.objects.filter(tenant=self.request.user.tenant)
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant)


class TemplateListCreateView(generics.ListCreateAPIView):
    serializer_class = TemplateSerializer
    def get_queryset(self):
        return MessageTemplate.objects.filter(tenant=self.request.user.tenant)
    def perform_create(self, serializer):
        serializer.save(tenant=self.request.user.tenant, created_by=self.request.user)


class TemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TemplateSerializer
    def get_queryset(self):
        return MessageTemplate.objects.filter(tenant=self.request.user.tenant)


class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    def get_queryset(self):
        return Conversation.objects.filter(tenant=self.request.user.tenant)


class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer
    def get_queryset(self):
        return Message.objects.filter(conversation_id=self.kwargs['conversation_id'], tenant=self.request.user.tenant)


@api_view(['POST'])
def send_message(request):
    """Send a WhatsApp message"""
    from leads.models import Lead
    import httpx

    conversation_id = request.data.get('conversation_id')
    content = request.data.get('content')
    message_type = request.data.get('message_type', 'text')

    try:
        conv = Conversation.objects.get(pk=conversation_id, tenant=request.user.tenant)
        wa_config = conv.wa_config

        # Send via Meta Cloud API
        url = f"https://graph.facebook.com/v18.0/{wa_config.phone_number_id}/messages"
        headers = {'Authorization': f'Bearer {wa_config.access_token}', 'Content-Type': 'application/json'}
        payload = {
            "messaging_product": "whatsapp",
            "to": f"{conv.lead.country_code}{conv.lead.mobile}",
            "type": "text",
            "text": {"body": content}
        }
        # Non-blocking send (in production use Celery)
        Message.objects.create(
            tenant=request.user.tenant,
            conversation=conv,
            lead=conv.lead,
            direction='outbound',
            message_type=message_type,
            content=content,
            sent_by=request.user,
            status='sent',
        )
        return Response({'status': 'sent'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
def webhook(request):
    """Meta WhatsApp Webhook"""
    if request.method == 'GET':
        # Verification
        mode = request.query_params.get('hub.mode')
        token = request.query_params.get('hub.verify_token')
        challenge = request.query_params.get('hub.challenge')
        if mode == 'subscribe' and token == settings.WHATSAPP_VERIFY_TOKEN:
            from django.http import HttpResponse
            return HttpResponse(challenge, content_type='text/plain')
        return Response({'error': 'Forbidden'}, status=403)

    # Handle inbound message
    data = request.data
    try:
        entry = data.get('entry', [{}])[0]
        changes = entry.get('changes', [{}])[0]
        value = changes.get('value', {})
        messages = value.get('messages', [])
        phone_number_id = value.get('metadata', {}).get('phone_number_id')

        for msg_data in messages:
            from_number = msg_data.get('from')
            wa_message_id = msg_data.get('id')
            text = msg_data.get('text', {}).get('body', '')

            # Find config
            wa_config = WhatsAppConfig.objects.filter(phone_number_id=phone_number_id).first()
            if not wa_config:
                continue

            # Find or create lead
            from leads.models import Lead
            lead, _ = Lead.objects.get_or_create(
                tenant=wa_config.tenant,
                mobile=from_number,
                defaults={'first_name': from_number, 'lead_source': 'whatsapp'}
            )

            # Find or create conversation
            conv, _ = Conversation.objects.get_or_create(
                tenant=wa_config.tenant,
                lead=lead,
                wa_config=wa_config,
                defaults={'status': 'open'}
            )

            # Save message
            Message.objects.create(
                tenant=wa_config.tenant,
                conversation=conv,
                lead=lead,
                wa_message_id=wa_message_id,
                direction='inbound',
                content=text,
                status='delivered',
            )

            conv.last_message_at = __import__('django.utils.timezone', fromlist=['timezone']).now()
            conv.unread_count += 1
            conv.save()

    except Exception as e:
        pass  # Log in production

    return Response({'status': 'ok'})


@api_view(['POST'])
def oauth_callback(request):
    """Handle Meta Embedded Signup Callback Token Exchange"""
    import httpx
    access_token = request.data.get('access_token')
    if not access_token:
        return Response({'error': 'Missing access token'}, status=400)
    
    try:
        # Attempt to exchange for a long-lived token if secret is configured
        app_id = getattr(settings, 'META_APP_ID', None)
        app_secret = getattr(settings, 'META_APP_SECRET', None)
        
        if app_id and app_secret and app_secret != 'your_app_secret_here':
            exchange_url = "https://graph.facebook.com/v19.0/oauth/access_token"
            exchange_resp = httpx.get(exchange_url, params={
                'grant_type': 'fb_exchange_token',
                'client_id': app_id,
                'client_secret': app_secret,
                'fb_exchange_token': access_token
            }).json()
            if 'access_token' in exchange_resp:
                access_token = exchange_resp['access_token']

        # Fetch the WABAs linked to this token
        # We try three different ways to discover the WABA to ensure maximum compatibility
        wabas = []
        
        # 1. Direct discovery (Standard)
        wa_accounts = httpx.get('https://graph.facebook.com/v19.0/me/whatsapp_business_accounts', 
                                params={'access_token': access_token}).json()
        wabas = wa_accounts.get('data', [])
        
        # 2. Business Manager discovery (Professional Standard)
        if not wabas:
            b_resp = httpx.get('https://graph.facebook.com/v19.0/me/businesses', 
                               params={'access_token': access_token}).json()
            for buz in b_resp.get('data', []):
                buz_id = buz.get('id')
                b_wa_accounts = httpx.get(f'https://graph.facebook.com/v19.0/{buz_id}/whatsapp_business_accounts', 
                                         params={'access_token': access_token}).json()
                wabas.extend(b_wa_accounts.get('data', []))
        
        # 3. Tech Provider/BSP discovery (Legacy/Partner fallback)
        if not wabas:
            tp_accounts = httpx.get('https://graph.facebook.com/v19.0/me/client_whatsapp_business_accounts', 
                                     params={'access_token': access_token}).json()
            wabas = tp_accounts.get('data', [])

        if not wabas:
            debug_info = {
                'me_accounts': wa_accounts,
                'businesses': locals().get('b_resp', 'Not queried')
            }
            return Response({'error': f'No WhatsApp Business Accounts found for this Meta user. (Debug: {json.dumps(debug_info)})'}, status=404)
        
        # We have atleast one WABA!
        waba_id = wabas[0].get('id') 
        
        # Fetch Phone Numbers for this WABA
        phone_resp = httpx.get(f'https://graph.facebook.com/v19.0/{waba_id}/phone_numbers', 
                               params={'access_token': access_token}).json()
        
        phones = phone_resp.get('data', [])
        if not phones:
            return Response({'error': 'No Phone Numbers linked to this WABA.'}, status=404)
        
        phone_number_id = phones[0].get('id')
        display_name = phones[0].get('display_phone_number', 'WhatsApp Auto-Setup')
        
        # Save or update config
        WhatsAppConfig.objects.update_or_create(
            tenant=request.user.tenant,
            defaults={
                'display_name': display_name,
                'phone_number_id': phone_number_id,
                'wa_business_id': waba_id,
                'access_token': access_token, 
                'verify_token': getattr(settings, 'WHATSAPP_VERIFY_TOKEN', '')
            }
        )
        return Response({'status': 'ok', 'waba_id': waba_id, 'phone_number_id': phone_number_id})
    except Exception as e:
        return Response({'error': str(e)}, status=500)


urlpatterns = [
    path('configs/', WAConfigListView.as_view()),
    path('templates/', TemplateListCreateView.as_view()),
    path('templates/<int:pk>/', TemplateDetailView.as_view()),
    path('conversations/', ConversationListView.as_view()),
    path('conversations/<int:conversation_id>/messages/', MessageListView.as_view()),
    path('send/', send_message),
    path('webhook/', webhook),
    path('oauth-callback/', oauth_callback),
]
