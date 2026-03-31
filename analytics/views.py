from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count, Sum, Q, Avg
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta, datetime

from leads.models import Lead, Appointment
from whatsapp_integration.models import Conversation, Message, SentimentRecord


def get_date_range(request):
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    period = request.query_params.get('period', 'last_3_months')

    today = timezone.now().date()
    if period == 'last_month':
        d_from = today - timedelta(days=30)
        d_to = today
    elif period == 'last_3_months':
        d_from = today - timedelta(days=90)
        d_to = today
    elif period == 'last_6_months':
        d_from = today - timedelta(days=180)
        d_to = today
    elif period == 'this_year':
        d_from = today.replace(month=1, day=1)
        d_to = today
    else:
        d_from = datetime.strptime(date_from, '%Y-%m-%d').date() if date_from else today - timedelta(days=90)
        d_to = datetime.strptime(date_to, '%Y-%m-%d').date() if date_to else today

    return d_from, d_to


@api_view(['GET'])
def dashboard_metrics(request):
    tenant = request.user.tenant
    d_from, d_to = get_date_range(request)

    leads_qs = Lead.objects.filter(tenant=tenant, created_at__date__gte=d_from, created_at__date__lte=d_to)
    conversations_qs = Conversation.objects.filter(tenant=tenant, created_at__date__gte=d_from, created_at__date__lte=d_to)

    # KPI metrics
    total_leads = Lead.objects.filter(tenant=tenant).count()
    total_deal_value = Lead.objects.filter(tenant=tenant, stage='won').aggregate(total=Sum('deal_value'))['total'] or 0
    ai_conversations = conversations_qs.count()
    total_conversations = Conversation.objects.filter(tenant=tenant).count()

    # Interaction % (conversations that had AI response / total leads)
    interaction_pct = round((ai_conversations / max(total_leads, 1)) * 100, 1)

    # Appointments this period
    appointments_count = Appointment.objects.filter(tenant=tenant, created_at__date__gte=d_from, created_at__date__lte=d_to).count()
    total_appointments = Appointment.objects.filter(tenant=tenant).count()
    appointment_pct = round((appointments_count / max(total_leads, 1)) * 100, 1)

    # Month-over-month change
    prev_from = d_from - timedelta(days=(d_to - d_from).days)
    prev_leads = Lead.objects.filter(tenant=tenant, created_at__date__gte=prev_from, created_at__date__lt=d_from).count()
    leads_change = round(((total_leads - prev_leads) / max(prev_leads, 1)) * 100, 1)

    return Response({
        'total_leads': total_leads,
        'total_deal_value': float(total_deal_value),
        'ai_conversations': ai_conversations,
        'interaction_pct': interaction_pct,
        'appointment_pct': appointment_pct,
        'leads_change': leads_change,
        'queries_left': tenant.queries_left if tenant else 0,
    })


@api_view(['GET'])
def dashboard_appointments(request):
    tenant = request.user.tenant
    appointments = Appointment.objects.filter(tenant=tenant).select_related('lead').order_by('-scheduled_at')[:10]
    data = [{
        'id': a.id,
        'mobile': a.lead.mobile,
        'status': a.status,
        'product': a.product,
        'location': a.location,
        'date': a.scheduled_at.strftime('%d %b %Y %H:%M'),
        'lead_name': f"{a.lead.first_name} {a.lead.last_name}",
    } for a in appointments]
    return Response(data)


@api_view(['GET'])
def pipeline_report(request):
    tenant = request.user.tenant
    d_from, d_to = get_date_range(request)

    stages = ['new', 'mql', 'sql', 'proposal', 'negotiation', 'won', 'lost']
    data = []
    for stage in stages:
        count = Lead.objects.filter(tenant=tenant, stage=stage).count()
        value = Lead.objects.filter(tenant=tenant, stage=stage).aggregate(v=Sum('deal_value'))['v'] or 0
        data.append({'stage': stage, 'count': count, 'value': float(value)})

    # Deal status breakdown
    statuses = Lead.objects.filter(tenant=tenant).values('status').annotate(count=Count('id'))

    return Response({'pipeline': data, 'statuses': list(statuses)})


@api_view(['GET'])
def sentiment_report(request):
    tenant = request.user.tenant
    d_from, d_to = get_date_range(request)

    sentiments = SentimentRecord.objects.filter(
        tenant=tenant,
        analyzed_at__date__gte=d_from,
        analyzed_at__date__lte=d_to
    ).values('sentiment').annotate(count=Count('id'))

    total = sum(s['count'] for s in sentiments)
    result = {s['sentiment']: s['count'] for s in sentiments}

    # Monthly trend
    trend = SentimentRecord.objects.filter(tenant=tenant).annotate(
        month=TruncMonth('analyzed_at')
    ).values('month', 'sentiment').annotate(count=Count('id')).order_by('month')

    return Response({
        'summary': {
            'positive': result.get('positive', 0),
            'neutral': result.get('neutral', 0),
            'negative': result.get('negative', 0),
            'total': total,
        },
        'trend': list(trend),
    })


@api_view(['GET'])
def sales_performance(request):
    tenant = request.user.tenant
    d_from, d_to = get_date_range(request)

    from accounts.models import User
    employees = User.objects.filter(tenant=tenant, role__in=['employee', 'manager'])
    data = []
    for emp in employees:
        leads = Lead.objects.filter(tenant=tenant, owner=emp, created_at__date__gte=d_from, created_at__date__lte=d_to)
        won = leads.filter(stage='won')
        data.append({
            'employee_id': emp.id,
            'name': emp.get_full_name(),
            'total_leads': leads.count(),
            'won_leads': won.count(),
            'total_value': float(won.aggregate(v=Sum('deal_value'))['v'] or 0),
            'conversion_rate': round((won.count() / max(leads.count(), 1)) * 100, 1),
        })

    return Response({'employees': data})


@api_view(['GET'])
def lead_source_breakdown(request):
    tenant = request.user.tenant
    sources = Lead.objects.filter(tenant=tenant).values('lead_source').annotate(
        count=Count('id'),
        value=Sum('deal_value')
    )
    return Response(list(sources))
