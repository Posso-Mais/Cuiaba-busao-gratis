import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from datetime import datetime

app = Flask(__name__)
CORS(app, origins=["https://posso-mais.github.io"])

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    raise RuntimeError('A variável de ambiente DATABASE_URL não está definida.')

@app.route("/")
def hello_world():
    name = os.environ.get("NAME", "World")
    return f"Hello {name}!"

@app.route('/api/registrar_apoio', methods=['POST'])
def registrar_apoio():
    data = request.json
    required_fields = ['nome', 'email']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'success': False, 'error': f'Campo obrigatório ausente: {field}'}), 400

    # Montar payload para o banco
    payload = {
        'nome': data.get('nome'),
        'email': data.get('email').lower(),
        'telefone': data.get('telefone'),
        'cidade': data.get('cidade', 'Cuiabá'),
        'estado': data.get('estado', 'MT'),
        'como_conheceu': data.get('comoConheceu'),
        'quer_voluntario': bool(data.get('querVoluntario', False)),
        'aceita_comunicacao': bool(data.get('aceitaComunicacao', True)),
        'data_cadastro': datetime.utcnow(),
        'ip_address': data.get('ipAddress'),
        'user_agent': data.get('userAgent')
    }

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        insert_query = '''
            INSERT INTO apoiadores
            (nome, email, telefone, cidade, estado, como_conheceu, quer_voluntario, aceita_comunicacao, data_cadastro, ip_address, user_agent)
            VALUES (%(nome)s, %(email)s, %(telefone)s, %(cidade)s, %(estado)s, %(como_conheceu)s, %(quer_voluntario)s, %(aceita_comunicacao)s, %(data_cadastro)s, %(ip_address)s, %(user_agent)s)
            RETURNING id;
        '''
        cur.execute(insert_query, payload)
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({'success': True, 'id': new_id}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 3000)))