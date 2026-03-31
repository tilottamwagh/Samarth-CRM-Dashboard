"""
Restore original table structures that were accidentally dropped.
This recreates the schema — data cannot be recovered on free Supabase tier.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

restore_sql = """
-- n8n chat histories (standard n8n schema)
CREATE TABLE IF NOT EXISTS n8n_chat_histories (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    message JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- n8n agentic RAG chat histories
CREATE TABLE IF NOT EXISTS n8n_chat_histories_agentic_rag (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    message JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- chat_history (general chat log)
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255),
    user_message TEXT,
    bot_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- documents (RAG/vector store documents)
CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    content TEXT,
    metadata JSONB DEFAULT '{}',
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_customers
CREATE TABLE IF NOT EXISTS tbl_customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    mobile VARCHAR(20),
    city VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- tbl_transactions
CREATE TABLE IF NOT EXISTS tbl_transactions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES tbl_customers(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50),
    transaction_id VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- paytech_payments
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
);

-- FITNESS CRAZE (custom business table)
CREATE TABLE IF NOT EXISTS "FITNESS CRAZE" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(100),
    description TEXT,
    price NUMERIC(10, 2),
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
"""

with connection.cursor() as cursor:
    # Try to enable vector extension (needed for documents table)
    try:
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        print("vector extension enabled")
    except Exception as e:
        print(f"Note: vector extension: {e}")

    # Run each statement separately
    statements = [s.strip() for s in restore_sql.split(';') if s.strip() and not s.strip().startswith('--')]
    for stmt in statements:
        if not stmt:
            continue
        # Get table name for logging
        name = stmt.split('EXISTS')[-1].split('(')[0].strip().replace('"', '') if 'EXISTS' in stmt else 'unknown'
        try:
            cursor.execute(stmt)
            print(f"✅ Restored: {name}")
        except Exception as e:
            print(f"⚠️  {name}: {e}")

print("\nDone. Table structures restored (empty - data cannot be recovered).")
