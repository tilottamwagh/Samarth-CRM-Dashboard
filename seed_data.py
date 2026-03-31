import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import Tenant, Plan

User = get_user_model()

# Create starter plan
plan, _ = Plan.objects.get_or_create(
    slug='starter',
    defaults={'name': 'Starter', 'price_monthly': 499, 'max_users': 3, 'ai_queries_limit': 100}
)
Plan.objects.get_or_create(slug='pro', defaults={'name': 'Pro', 'price_monthly': 999, 'max_users': 10, 'ai_queries_limit': 500})
Plan.objects.get_or_create(slug='enterprise', defaults={'name': 'Enterprise', 'price_monthly': 2499, 'max_users': 999, 'ai_queries_limit': 9999})

# Create demo tenant
tenant, _ = Tenant.objects.get_or_create(
    slug='samarth-demo',
    defaults={'name': 'Samarth Demo', 'email': 'admin@samarth.com', 'plan': plan}
)

# Create admin user
if not User.objects.filter(email='admin@samarth.com').exists():
    User.objects.create_user(
        email='admin@samarth.com',
        password='admin123',
        first_name='Samarth',
        last_name='Admin',
        role='admin',
        tenant=tenant,
        is_staff=True,
        is_superuser=True,
    )
    print('Admin user created: admin@samarth.com / admin123')
else:
    print('Admin user already exists')

print('Plans created:', Plan.objects.count())
print('Tenants created:', Tenant.objects.count())
print('Users created:', User.objects.count())
print('Done! Login: admin@samarth.com / admin123')
