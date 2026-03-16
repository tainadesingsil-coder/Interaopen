# ENIGMA Native (Expo)

Assistente de voz nativo com fluxo:

1. Captura de áudio no celular
2. Transcrição (Gemini)
3. Interpretação de intenção (hora, saudação, clima)
4. Resposta por voz em pt-BR

## Configuração

Crie um arquivo `.env` em `enigma-native/`:

```env
EXPO_PUBLIC_GEMINI_API_KEY=sua_chave_google_ai_studio
```

## Rodar

```bash
cd enigma-native
npm install
npm run android
```

Ou:

```bash
npm run ios
```

## Observação

- No primeiro uso, permita o microfone.
- Se o app entrar em estado offline, toque em **Reativar ENIGMA**.
