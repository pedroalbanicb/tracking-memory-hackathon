---
tags: [adr, tracking, ia, gemini, vertex-ai, chat, hackathon]
status: accepted
data: 2026-04-16
autores: [Pedro Albani Martins]
rfc-relacionada:
updated: 2026-04-16
---

# ADR-010 — Implementação do GerarRespostaChat com Vertex AI (Gemini) no TrackingAnaliseIARepositorio

**Status:** Accepted  
**Data:** 2026-04-16  
**Autores:** Pedro Albani Martins  
**ADRs relacionadas:** [[ADR-005-analise-ia-gemini-vertex-tracking-sku]], [[ADR-009-tracking-agent-mcp-context-chat-endpoint]]

---

## Contexto

O método `GerarRespostaChat(string prompt)` em `TrackingAnaliseIARepositorio` estava retornando `string.Empty` (stub). Isso fazia o `TrackingChatService` sempre cair no fallback determinístico — que ignora a `mensagem` do operador e o `historico` da conversa, retornando sempre o mesmo texto independente da pergunta.

O resultado era um chat que não respondia à pergunta — apenas repetia o diagnóstico fixo.

A integração com Vertex AI (Gemini 2.5 Flash) já estava configurada em `appsettings.json` (`GeminiOptions`) e o padrão de autenticação OAuth2 via service account estava documentado em ADR-005. Faltava apenas implementar o método.

---

## Decisão

**Decidimos:** implementar `GerarRespostaChat` no `TrackingAnaliseIARepositorio` usando o mesmo padrão de chamada HTTP ao Vertex AI já definido no ADR-005.

O método recebe o prompt completo (já montado pelo `TrackingChatService` com system prompt + contexto das etapas + histórico + mensagem do operador) e retorna o texto gerado pelo Gemini.

**Sem impacto no front-end:** o contrato do `POST /api/v1/tracking/chat` não muda — mesmos campos de request e response. Apenas a qualidade da resposta melhora (resposta contextual vs. fallback fixo).

---

## Configuração necessária

As credenciais ficam em `appsettings.Development.json` (não commitado) ou K8s Secret em produção:

```json
"GeminiOptions": {
  "ProjectId": "via-gcb-categorizador-prdt-hlg",
  "Location": "us-central1",
  "ModelId": "gemini-2.5-flash",
  "ServiceAccountEmail": "...",
  "PrivateKeyId": "...",
  "PrivateKey": "..."
}
```

**Endpoint Vertex AI:**
```
POST https://{Location}-aiplatform.googleapis.com/v1/projects/{ProjectId}/locations/{Location}/publishers/google/models/{ModelId}:generateContent
Authorization: Bearer {oauth2_token}
```

**Auth:** `ServiceAccountCredential` via `Google.Apis.Auth` — fluxo JWT → OAuth2 token.  
**Fallback:** se Gemini retornar vazio ou falhar, `TrackingChatService` já usa `MontarRespostaFallback` — sem breaking change.

---

## Alternativas descartadas

- *Keyword matching no fallback*: resolve parcialmente (respostas diferentes por palavra-chave), mas não é conversacional nem usa contexto real.
- *OpenAI/Azure OpenAI*: fora do padrão GCP já adotado no projeto (ADR-005).

---

## Consequências

- Chat passa a responder à pergunta do operador com linguagem natural contextual
- Histórico da conversa é considerado — multi-turno funciona de verdade
- Latência adicional: ~3–8s por chamada (autenticação OAuth2 + inferência Gemini)
- Cache de token OAuth2 é recomendado para evitar autenticação a cada request (débito técnico documentado no STATE.md)
- Sem impacto no front-end ou no MCP

---

## Status de Implementação

| Item | Status |
|------|--------|
| `GerarRespostaChat` com Vertex AI real | ✅ Implementado |
| `GerarDiagnosticoAsync` com Vertex AI real | ✅ Implementado (mesmo fluxo) |
| Cache de token OAuth2 | 🔴 Débito técnico |
| Credenciais em K8s Secret (PRD) | 🔴 Pendente antes de produção |
