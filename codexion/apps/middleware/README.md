# Middleware Seguranca Condominio Vvfit (SaaS/HaaS)

Middleware local-first para integrar smartwatch BLE (Vvfit-compatible) com infraestrutura de condominio:
- fechaduras eletricas,
- interfonia com aprovacao no pulso,
- check-in automatico de ronda por beacon BLE,
- alerta silencioso de coacao por telemetria cardiaca.

## Estrutura de pastas

```text
middleware-seguranca-condominio-vvfit/
  main.py
  requirements.txt
  .env.example
  src/
    config.py
    ble/
      vvfit_bridge.py
    security/
      crypto.py
    services/
      access_control.py
      coercion.py
      round_checkin.py
    storage/
      edge_outbox.py
  database/
    schema.sql
  docs/
    vvfit-integration.md
  github/
    README.md
  cloudfire/
    README.md
```

## Funcionalidades implementadas

1. **Modulo de Acesso (NFC/BLE)**  
   Endpoint `/api/access/unlock` recebe envelope AES-256 com UUID criptografado, valida permissao e aciona abertura local da fechadura.

2. **Interfonia no Pulso**  
   Endpoint `/api/webhooks/intercom/visitor` recebe visitante da portaria e envia alerta por **write characteristic** para o relogio.  
   Endpoint `/api/watch/intercom/decision` processa `approve/deny`.

3. **Seguranca Patrimonial (Vigilantes)**  
   Endpoint `/api/security/beacon/proximity` registra check-in de ronda por RSSI.  
   Loop BLE opcional tambem varre beacons e gera check-ins automaticamente.

4. **Protocolo de Coacao (Senha Emocional)**  
   Endpoints `/api/watch/telemetry` e `/api/watch/telemetry/encrypted` processam HR/SpO2/passos e disparam alerta silencioso quando:
   - `HR >= COERCION_HR_THRESHOLD`,
   - sem atividade fisica,
   - passos no minuto abaixo do limite.

5. **Local-First**  
   Todos os eventos criticos sao enfileirados em `runtime/edge_outbox.db` (SQLite) antes de qualquer sincronizacao cloud.

## Segurança (AES-256)

O middleware usa AES-256-GCM (classe `AES256Cipher`) para trafego protegido entre relogio e edge server.

Formato esperado do envelope:

```json
{
  "watch_id": "watch-01",
  "nonce_b64": "base64_nonce_12_bytes",
  "ciphertext_b64": "base64_ciphertext"
}
```

## Rodar localmente

```bash
cd middleware-seguranca-condominio-vvfit
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python main.py
```

API default: `http://0.0.0.0:8081`

## Banco de dados

Script de schema PostgreSQL em:

```text
database/schema.sql
```

Esse schema cobre:
- moradores,
- niveis de acesso,
- wearables,
- fechaduras e regras,
- chamadas de visitante,
- checkpoints e rondas,
- telemetria e alertas de coacao,
- outbox para sincronizacao.
