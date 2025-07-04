import requests

API_URL = 'http://localhost:3000/api/registrar_apoio'

test_user = {
    'nome': 'Usuário Teste',
    'email': 'teste@example.com',
    'telefone': '(65) 99999-8888',
    'cidade': 'Cuiabá',
    'estado': 'MT',
    'comoConheceu': 'internet',
    'querVoluntario': True,
    'aceitaComunicacao': True,
    'ipAddress': '127.0.0.1',
    'userAgent': 'Mozilla/5.0 (Test Script)'
}

response = requests.post(API_URL, json=test_user)
print('Status code:', response.status_code)
print('Response:', response.json()) 