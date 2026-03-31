"""
Verify all tables now exist in Supabase.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    cursor.execute("""
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
    """)
    tables = [row[0] for row in cursor.fetchall()]

print(f"\nTotal tables in database: {len(tables)}")
print("\nAll tables:")
for t in tables:
    print(f"  ✅ {t}")
