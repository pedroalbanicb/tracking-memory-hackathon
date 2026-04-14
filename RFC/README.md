# RFCs — Request for Comments

Propostas técnicas que requerem discussão do time **antes** da implementação.

## Índice

| # | Título | Status | Data |
|---|--------|--------|------|
| RFC-002 | [[RFC-002-agendamento\|Agendamento — Integração LN/Neogrid]] | Draft | — |

## Arquivadas

| # | Título | Status | Motivo |
|---|--------|--------|--------|
| RFC-003 | Integração de Dados de Estoque | Accepted | Implementado — SQL direto Banco Inventário |
| RFC-004 | Integração de Pricing e Exibição (E08/E09) | Accepted | Implementado — SQL Corp direto |

## Quando abrir uma RFC?

- Mudança que afeta mais de um sistema/squad
- Nova integração entre domínios (ex: Catálogo ↔ Oferta)
- Mudança em contrato de API ou evento Kafka
- Decisão técnica com múltiplas alternativas viáveis

## Fluxo

```
PRD Aprovado → RFC Draft → RFC In Review → RFC Accepted → ADR (se necessário)
```

## Status possíveis

- **Draft** — em elaboração
- **In Review** — em discussão (prazo sugerido: 5 dias úteis para comentários)
- **Accepted** — aprovada, pode ser implementada
- **Rejected** — rejeitada com justificativa registrada
- **Withdrawn** — retirada pelo autor

## Nomenclatura

`RFC-{NNN}-{titulo-kebab-case}.md`
