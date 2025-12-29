# Evolution API - Notas de Integração (Instância local)

ATENÇÃO: Ajustar conforme a documentação exposta pela instância (Swagger/Redoc). Use:
- http://localhost:8080/docs (ou /redoc, /swagger-ui, /openapi.json)

Endpoints (v2.2.x – referência comum):
- POST /instance/create
  Body (exemplo): { "instanceName": "tenant-<id>-<ts>" }
- DELETE /instance/delete/{instance}
- GET /instance/connectionState/{instance}
- POST /message/sendText/{instance}
  Body: { "number": "+5511999999999", "text": "Hello" }
- GET /chat/findContacts/{instance} (pode variar)

Eventos de webhook (nomes usuais):
- messages.upsert (mensagem recebida)
- messages.update (ack/edição)
- qrcode.updated (QR em base64)
- connection.update (estados: open, close, qr, connecting)

Observações:
- Autenticação: Authorization: Bearer ${EVOLUTION_API_KEY}
- Banco dedicado para Evolution: ${EVOLUTION_DATABASE_URL}
- Webhook configurado para backend: /api/webhook/evolution

Checklist pós-subida:
- Validar /health da Evolution API
- Abrir /docs ou /openapi.json e comparar os endpoints reais. Ajustar Provider e Controller conforme necessário.
