import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model

U = get_user_model()

admin = U.objects.filter(is_superuser=True).first()
tenant = getattr(admin, 'tenant', None)

email = 'sales@samarth.com'

if U.objects.filter(email=email).exists():
    u = U.objects.get(email=email)
    u.set_password('Sales@1234')
    u.first_name = 'Rahul'
    u.last_name = 'Sharma'
    u.is_staff = False
    u.is_superuser = False
    u.role = 'sales'
    u.save()
    print(f'Updated: {u.email} | role={u.role} | staff={u.is_staff}')
else:
    kwargs = dict(
        email=email,
        first_name='Rahul',
        last_name='Sharma',
        is_staff=False,
        is_superuser=False,
    )
    if tenant:
        kwargs['tenant'] = tenant
    try:
        kwargs['role'] = 'sales'
    except Exception:
        pass
    u = U.objects.create_user(**kwargs)
    u.set_password('Sales@1234')
    u.save()
    print(f'Created: {u.email} | role={getattr(u, "role", "N/A")} | staff={u.is_staff} | tenant={tenant}')
