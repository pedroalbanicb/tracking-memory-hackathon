---
tags: [rfc, tracking, agendamento, ln, neogrid]
status: draft
autor: Pedro Martins
data: 2026-04-09
prd-relacionado: PRD-001
revisores: []
updated: 2026-04-09
---

# RFC-002 — Agendamento — Integração LN/Neogrid

**Status:** Draft  
**Autor:** Pedro Martins  
**Data:** 2026-04-09  
**PRD relacionado:** [[PRD-001-tracking-sku-lifecycle]]  
**Revisores:** —

---

## Resumo

Proposta para definir a estratégia de integração do tracking com os dados de agendamento de recebimento de produtos, originados no LN (Infor) e/ou Neogrid.

## Motivação

A etapa de Agendamento ([[E04-agendamento]]) é a única etapa do pipeline com origem de dados **não mapeada**. Sem essa integração, não é possível calcular o lead-time entre contrato comercial ([[E03-proposta-comercial]]) e disponibilidade de estoque ([[E05-estoque]]).

> Sistemas confirmados por **Juliana Dos Santos** (2026-04-09): LN (Infor) e/ou Neogrid.

## Proposta Detalhada

> ⚠️ **Pendente discovery.** As seções abaixo devem ser preenchidas após reunião com o time de Operações/GO.

### Hipóteses de Interface

| Opção | Sistema | Método | Viabilidade |
|-------|---------|--------|-------------|
| A | LN (Infor) | API REST ou tabelas BAAN | A investigar |
| B | Neogrid | Integração EDI / API Neogrid | A investigar |
| C | Ambos | LN para contratos, Neogrid para comunicação EDI com fornecedor | A investigar |

### Contrato / Interface

```json
// A definir após discovery
```

### Fluxo

```
Contrato Liberado (E03) → Agendamento (LN/Neogrid) → Recebimento → Estoque (E05)
```

## Alternativas Consideradas

| Alternativa | Motivo de descarte |
|-------------|-------------------|
| Ignorar esta etapa no MVP | Prejudica cálculo de lead-time e visibilidade de gargalos logísticos |
| Marcar como N/A para todos os SKUs | Perde-se informação para SKUs que realmente possuem agendamento |

## Impacto e Riscos

| Área | Impacto | Mitigação |
|------|---------|-----------|
| Performance | Depende do método de integração | Considerar cache |
| Disponibilidade | LN/Neogrid podem ter janelas de manutenção | Fallback para "status desconhecido" |
| Complexidade | Dois sistemas diferentes (LN + Neogrid) | Definir qual é a fonte primária |

## Plano de Rollout

- [ ] Agendar discovery com time de Operações / GO
- [ ] Identificar API ou tabela disponível no LN
- [ ] Confirmar papel do Neogrid no fluxo
- [ ] Definir schema de dados e contrato
- [ ] Implementar integração
- [ ] Atualizar [[E04-agendamento]] com dados confirmados

## Perguntas em Aberto

| # | Pergunta | Responsável |
|---|----------|-------------|
| 1 | Qual sistema gerencia o agendamento: LN, Neogrid ou ambos? | GO / Operações |
| 2 | Existe API REST disponível ou é necessário acesso via BAAN/EDI? | Time Integração |
| 3 | O agendamento é obrigatório para todos os tipos de produto? | GO |
| 4 | Para quais tipos de produto esta etapa é N/A (ex: Digital/Download)? | GO / Produto |

## Referências

- [[E04-agendamento]] — Etapa do pipeline
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [[E03-proposta-comercial]] — Etapa anterior (Proposta Comercial)
- [[E05-estoque]] — Etapa seguinte (Estoque)
- [Neogrid SCM](https://casasbahiatech.atlassian.net/wiki/spaces/SCM/pages/636158358/Neogrid) — Referência Confluence
- [Discovery Crossdocking](https://casasbahiatech.atlassian.net/wiki/spaces/TLE/pages/967610744/Discovery+-+Crossdocking+e+Full+Cross) — Referência Confluence