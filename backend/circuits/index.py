import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event, context):
    """Сохранение и загрузка проектов электрических схем"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    headers = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        if method == 'GET' and params.get('id'):
            cur.execute("SELECT id, name, description, components, created_at, updated_at FROM circuits WHERE id = '%s'" % params['id'].replace("'", "''"))
            row = cur.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Схема не найдена'})}
            row['created_at'] = row['created_at'].isoformat()
            row['updated_at'] = row['updated_at'].isoformat()
            row['id'] = str(row['id'])
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(row)}

        if method == 'GET':
            cur.execute("SELECT id, name, description, created_at, updated_at FROM circuits ORDER BY updated_at DESC LIMIT 50")
            rows = cur.fetchall()
            for r in rows:
                r['created_at'] = r['created_at'].isoformat()
                r['updated_at'] = r['updated_at'].isoformat()
                r['id'] = str(r['id'])
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(rows)}

        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            name = body.get('name', '').strip()
            if not name:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Название обязательно'})}
            description = body.get('description', '')
            components = json.dumps(body.get('components', []))
            safe_name = name.replace("'", "''")
            safe_desc = description.replace("'", "''")
            cur.execute(
                "INSERT INTO circuits (name, description, components) VALUES ('%s', '%s', '%s'::jsonb) RETURNING id, name, created_at"
                % (safe_name, safe_desc, components.replace("'", "''"))
            )
            conn.commit()
            row = cur.fetchone()
            row['created_at'] = row['created_at'].isoformat()
            row['id'] = str(row['id'])
            return {'statusCode': 201, 'headers': headers, 'body': json.dumps(row)}

        if method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            circuit_id = body.get('id', '').replace("'", "''")
            name = body.get('name', '').strip().replace("'", "''")
            description = body.get('description', '').replace("'", "''")
            components = json.dumps(body.get('components', [])).replace("'", "''")
            if not circuit_id or not name:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'id и name обязательны'})}
            cur.execute(
                "UPDATE circuits SET name='%s', description='%s', components='%s'::jsonb, updated_at=NOW() WHERE id='%s' RETURNING id, name, updated_at"
                % (name, description, components, circuit_id)
            )
            conn.commit()
            row = cur.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': headers, 'body': json.dumps({'error': 'Схема не найдена'})}
            row['updated_at'] = row['updated_at'].isoformat()
            row['id'] = str(row['id'])
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps(row)}

        if method == 'DELETE':
            circuit_id = params.get('id', '').replace("'", "''")
            if not circuit_id:
                return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'id обязателен'})}
            cur.execute("DELETE FROM circuits WHERE id='%s'" % circuit_id)
            conn.commit()
            return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True})}

        return {'statusCode': 405, 'headers': headers, 'body': json.dumps({'error': 'Метод не поддерживается'})}
    finally:
        cur.close()
        conn.close()
