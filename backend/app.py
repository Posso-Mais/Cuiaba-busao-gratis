import os
from flask import Flask, request, jsonify
import requests
from datetime import datetime

app = Flask(__name__)

SUPABASE_URL = os.environ.get('SUPABASE_URL')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY')
SUPABASE_TABLE = 'apoiadores'

@app.route('/api/registrar_apoio', methods=['POST'])
def registrar_apoio():
    data = request.json
    required_fields = ['nome', 'email']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'success': False, 'error': f'Campo obrigatório ausente: {field}'}), 400

    # Montar payload para Supabase
    payload = {
        'nome': data.get('nome'),
        'email': data.get('email').lower(),
        'telefone': data.get('telefone'),
        'cidade': data.get('cidade', 'Cuiabá'),
        'estado': data.get('estado', 'MT'),
        'como_conheceu': data.get('comoConheceu'),
        'quer_voluntario': bool(data.get('querVoluntario', False)),
        'aceita_comunicacao': bool(data.get('aceitaComunicacao', True)),
        'data_cadastro': datetime.utcnow().isoformat(),
        'ip_address': data.get('ipAddress'),
        'user_agent': data.get('userAgent')
    }

    headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json'
    }
    supabase_url = f"{SUPABASE_URL}/rest/v1/{SUPABASE_TABLE}"

    response = requests.post(supabase_url, json=[payload], headers=headers)
    if response.status_code in (200, 201):
        return jsonify({'success': True, 'data': response.json()}), 201
    else:
        return jsonify({'success': False, 'error': response.text}), 500

if __name__ == '__main__':
    app.run(debug=True) 