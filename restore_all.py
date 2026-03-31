import os, django
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'
django.setup()
from django.db import connection

# These original tables were dropped but not yet recreated
original_tables = [
    ('n8n_chat_histories', """
        CREATE TABLE IF NOT EXISTS n8n_chat_histories (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR(255) NOT NULL,
            message JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """),
    ('n8n_chat_histories_agentic_rag', """
        CREATE TABLE IF NOT EXISTS n8n_chat_histories_agentic_rag (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR(255) NOT NULL,
            message JSONB NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """),
    ('chat_history', """
        CREATE TABLE IF NOT EXISTS chat_history (
            id SERIAL PRIMARY KEY,
            session_id VARCHAR(255),
            user_message TEXT,
            bot_message TEXT,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """),
    ('documents', """
        CREATE TABLE IF NOT EXISTS documents (
            id SERIAL PRIMARY KEY,
            content TEXT,
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """),
    ('tbl_customers', """
        CREATE TABLE IF NOT EXISTS tbl_customers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255),
            mobile VARCHAR(20),
            city VARCHAR(100),
            address TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """),
    ('tbl_transactions', """
        CREATE TABLE IF NOT EXISTS tbl_transactions (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER,
            amount NUMERIC(12, 2),
            currency VARCHAR(10) DEFAULT 'INR',
            status VARCHAR(50),
            transaction_id VARCHAR(255),
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """),
    ('paytech_payments', """
        CREATE TABLE IF NOT EXISTS paytech_payments (
            id SERIAL PRIMARY KEY,
            payment_id VARCHAR(255) UNIQUE,
            order_id VARCHAR(255),
            amount NUMERIC(12, 2),
            currency VARCHAR(10) DEFAULT 'INR',
            status VARCHAR(50),
            customer_email VARCHAR(255),
            customer_mobile VARCHAR(20),
            method VARCHAR(100),
            metadata JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """),
    ('FITNESS CRAZE', """
        CREATE TABLE IF NOT EXISTS "FITNESS CRAZE" (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            category VARCHAR(100),
            description TEXT,
            price NUMERIC(10, 2),
            stock INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """),
]

with connection.cursor() as cursor:
    for name, sql in original_tables:
        try:
            cursor.execute(sql)
            print('Created:', name)
        except Exception as e:
            print('Error on', name, ':', e)

    # Verify final count
    cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")
    all_tables = [r[0] for r in cursor.fetchall()]

print('\nTotal tables now:', len(all_tables))
print('All tables:')
for t in all_tables:
    print(' -', t)
