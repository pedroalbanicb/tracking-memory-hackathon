---
tags: [adr, tracking, mcp, ia, chat, gemini, hackathon]
status: accepted
data: 2026-04-16
autores: [Pedro Albani Martins]
rfc-relacionada:
updated: 2026-04-16
---

# ADR-009 — Tracking Agent: MCP Resources com Contexto de Domínio e Endpoint de Chat

**Status:** Accepted  
**Data:** 2026-04-16  
**Autores:** Pedro Albani Martins  
**ADRs relacionadas:** [[ADR-005-analise-ia-gemini-vertex-tracking-sku]], [[ADR-006-componente-frontend-analise-ia-tracking-sku]]

---

## Contexto

O servidor MCP disponível em `https://gestaoproduto-plataforma-sit.viavarejo.com.br/mcp` expunha apenas dois tools: `buscar_tracking_skus` e `analisar_sku_ia`. O LLM cliente (Copilot, Claude Desktop, etc.) não tinha acesso ao contexto de domínio do pipeline — regras de negócio, flags de exibição, responsáveis por etapa, APIs de integração — e por isso produzia respostas genéricas e imprecisas.

Além disso, identificou-se a necessidade de um endpoint conversacional (`chat`) para que o front-end possa expor uma interface de assistente em linguagem natural ao operador, sem que o cliente de IA precise chamar o MCP diretamente.

---

## Decisões

### 1. MCP Resources — Contexto de Domínio ✅ Implementado

**Decidimos:** centralizar o conhecimento de domínio do pipeline em `TrackingAgentContext.cs` e expô-lo via uma classe dedicada de tools `TrackingMcpResources`, registrada no servidor MCP junto com `TrackingMcpTools`. O servidor passa a se identificar com `Name = "Tracking Agent"`.

**Tools de contexto adicionadas:**

| Tool | Conteúdo |
|------|----------|
| `get_tracking_agent_system_prompt` | Persona, regras de conduta e escopo do agente |
| `get_tracking_pipeline_overview` | 9 etapas: sistema, campo-chave, regra, responsável |
| `get_tracking_regras_negocio` | Flags de exibição (E09), propagação Rundeck, regras de pricing |
| `get_tracking_apis_integracao` | Endpoints, campos e armadilhas críticas (ex: `DisponibilidadeEstoque` aninhado em `PrecoSkus[0]`) |
| `get_tracking_guia_diagnostico` | Causa → time responsável → ação recomendada por etapa + cenários comuns |

**Alternativa descartada:** MCP Resources nativos (URI-based) — o SDK .NET 1.2.0 não expõe `McpServerResource` como atributo de método; apenas tools estão disponíveis. Optou-se por tools de leitura como substituto funcional equivalente.

**Consequências:** qualquer cliente MCP passa a ter acesso ao domínio completo antes de agir, produzindo diagnósticos mais ricos e precisos sem depender de conhecimento prévio do operador.

---

### 2. Endpoint de Chat — Interface Conversacional 🔴 A Implementar

**Decidimos:** criar um novo endpoint REST dedicado à interação conversacional em linguagem natural, separado do `analise-ia` existente.

**Por que não reaproveitar `analise-ia`:**

| Aspecto | `GET analise-ia` | `POST chat` |
|---------|-----------------|-------------|
| Input | `idSkuSite` (int) | Mensagem livre em texto + histórico |
| Output | JSON estruturado (campos fixos) | Texto em linguagem natural |
| Histórico | Stateless | Multi-turno via `historico[]` |
| LLM | Opcional (diagnóstico determinístico como fallback) | Obrigatório |

**Contrato proposto:**

```
POST /api/v1/tracking/chat
Authorization: Bearer {token}
Content-Type: application/json

{
  "idSkuSite": 55072185,
  "mensagem": "por que esse SKU não está aparecendo no site?",
  "historico": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response:**

```json
{
  "isOk": true,
  "data": {
    "resposta": "O SKU está bloqueado na etapa de Proposta Comercial — FlagContratoLiberado = null. Acione o Time Comercial para emitir a proposta no LN/Infor.",
    "etapasComProblema": ["Proposta Comercial"],
    "analisadoEm": "2026-04-16T14:00:00Z"
  }
}
```

**Fluxo interno:**

```
POST /api/v1/tracking/chat
  → TrackingChatController.Chat()
    → TrackingChatService.Chat(idSkuSite, mensagem, historico)
      → TrackingAnaliseIAService.AnalisarSku(idSkuSite)   ← dados reais das etapas
      → Monta prompt:
          [SYSTEM]  TrackingAgentContext.SYSTEM_PROMPT
          [CONTEXT] dados das 9 etapas + etapasComProblema
          [HISTORY] historico[]
          [USER]    mensagem
      → TrackingAnaliseIARepositorio.GerarRespostaChat(prompt)  ← Gemini 2.5 Flash
  → Response<TrackingChatResponse>
```

O `analise-ia` existente continua funcionando e é reutilizado internamente pelo `chat` como fonte de dados das etapas.

**Componente front-end:** ver [[ADR-006-componente-frontend-analise-ia-tracking-sku]] — o `AnaliseIAPanel` deverá ser estendido ou um novo `TrackingChatPanel` criado para consumir este endpoint.

---

### 3. Rename de Etapas ✅ Implementado

**Decidimos:** remover os prefixos técnicos (`E01 - `, `E03 - `, etc.) dos valores de `etapasComProblema` e do texto de `diagnostico`.

**Antes:** `["E03 - Proposta Comercial", "E05 - Estoque"]`  
**Depois:** `["Proposta Comercial", "Estoque"]`

**Motivação:** o front-end renderiza esses valores diretamente ao operador. Nomes sem prefixo são mais legíveis e não pressupõem conhecimento da numeração interna das etapas.

**Impacto:** breaking change nos valores de string — não na estrutura do JSON (campos, tipos e status codes inalterados). Consumidores que fazem match por string com os valores antigos precisam atualizar.

---

## Status de Implementação

| Item | Status |
|------|--------|
| `TrackingAgentContext.cs` | ✅ Implementado |
| `TrackingMcpResources.cs` (5 tools de contexto) | ✅ Implementado |
| Servidor MCP renomeado para "Tracking Agent" | ✅ Implementado |
| Rename de etapas (`etapasComProblema`) | ✅ Implementado |
| `POST /api/v1/tracking/chat` | 🔴 A implementar |
| `TrackingChatService` | 🔴 A implementar |
| `TrackingChatPanel` (front-end) | 🔴 A implementar |
