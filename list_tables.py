import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
django.setup()
from django.db import connection
with connection.cursor() as c:
    c.execute("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")
    tables = [r[0] for r in c.fetchall()]
print('Total tables:', len(tables))
for t in tables:
    print(' -', t)
