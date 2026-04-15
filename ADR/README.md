# ADRs — Architecture Decision Records

Registro permanente de decisões técnicas e arquiteturais tomadas pelo time.

## Índice

| #   | Título                                                                                              | Status   | Data       |
| --- | --------------------------------------------------------------------------------------------------- | -------- | ---------- |
| 002 | [[ADR-002-contrato-api-tracking-skus-fase-1-graphql\|Contrato de API de Tracking (Lista de SKUs) com Fonte Inicial GraphQL]] | Accepted | 2026-04-14 |
| 003 | [[ADR-003-complementacao-dados-api-catalogo\|Complementação de Dados do Tracking via API Catálogo]] | Accepted | 2026-04-15 |
| 004 | [[ADR-004-integracao-api-oferta-e05-e08\|Integração da API Oferta para E05 (Estoque) e E08 (Pricing)]] | Accepted | 2026-04-15 |
| 005 | [[ADR-005-analise-ia-gemini-vertex-tracking-sku\|Análise IA do Tracking SKU com Gemini no Vertex AI]] | Proposed | 2026-04-15 |
| 006 | [[ADR-006-componente-frontend-analise-ia-tracking-sku\|Componente Front-end de Análise IA no Detalhe do SKU]] | Proposed | 2026-04-15 |
| 007 | [[ADR-007-agendamento-espelha-estoque\|E04 (Agendamento) Espelha Status de E05 (Estoque)]] | Accepted | 2026-04-15 |
| 008 | [[ADR-008-estrategia-mocks-largescala-feature-flag-tracking\|Estratégia de Mocks em Larga Escala com Feature Flag para Tracking]] | Proposed | 2026-04-15 |

## Sobre ADRs

ADRs documentam **decisões já tomadas** com o contexto de por que foram tomadas.  
São imutáveis — se a decisão mudar, cria-se uma nova ADR que supersede a anterior.

## Quando criar uma ADR?

- Após aceite de uma RFC com impacto arquitetural
- Decisão de tecnologia (banco de dados, framework, linguagem)
- Definição de contrato entre sistemas
- Qualquer decisão que o time futuro vai querer entender o "por quê"

## Status possíveis

- **Proposed** — em votação
- **Accepted** — decisão oficial
- **Deprecated** — ainda válida mas não recomendada
- **Superseded by ADR-NNN** — substituída por outra decisão

## Nomenclatura

`ADR-{NNN}-{titulo-kebab-case}.md`
