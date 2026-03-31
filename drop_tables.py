"""
Script to drop all existing tables in Supabase and run fresh migrations.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

# Drop all tables in public schema
with connection.cursor() as cursor:
    # Get all table names
    cursor.execute("""
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
    """)
    tables = [row[0] for row in cursor.fetchall()]
    print(f"Found {len(tables)} tables: {tables}")
    
    if tables:
        # Disable FK checks and drop all
        cursor.execute("SET session_replication_role = replica;")
        for table in tables:
            cursor.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE;')
            print(f"Dropped: {table}")
        cursor.execute("SET session_replication_role = DEFAULT;")
        print("All tables dropped successfully!")
    else:
        print("No tables found.")

print("Done! Now run: python manage.py migrate")
