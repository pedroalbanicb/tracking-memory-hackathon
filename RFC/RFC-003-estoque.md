---
tags: [rfc, tracking, estoque, inventario, integracao]
status: draft
autor: Pedro Martins
data: 2026-04-10
prd-relacionado: [[PRD-001-tracking-sku-lifecycle]]
revisores: []
updated: 2026-04-10
---

# RFC-003 — Integração de Dados de Estoque

**Status:** Draft  
**Autor:** Pedro Martins  
**Data:** 2026-04-10  
**PRD relacionado:** [[PRD-001-tracking-sku-lifecycle]]  
**Revisores:** A definir

---

## Resumo

Proposta de estratégia de integração para obter dados de estoque (Etapa 5 do pipeline) a partir do Banco Inventário (SQL, schema `Inventario`).

## Motivação

A [[E05-estoque]] tem regras de negócio mapeadas e query SQL confirmada, mas o **método de integração** (API, banco direto ou evento) ainda não foi definido. Esta RFC deve resolver essa decisão.

## Contexto

- **Fonte confirmada:** Banco Inventário — schema `Inventario`
- **14 campos mapeados** (reunião 09/04/2026 com Ricardo Tadeu Lima e Douglas Souza Wolff)
- **Tipos de estoque:** Físico, Fingido, Crossdocking, Em Trânsito, Pré-Lançamento, Digital/Download
- **Decisão relacionada:** [[decisao-fonte-dados-tracking]] (API vs SQL direto)

## Proposta Detalhada

> A definir após alinhamento com Time Plataforma e Time Abastecimento.

### Opções em Avaliação

| Opção | Prós | Contras | Status |
|-------|------|---------|--------|
| API existente | Desacoplado, seguro | Pode não existir endpoint adequado | 🟡 A confirmar |
| SQL direto (Banco Inventário) | Dados completos, query pronta | Acoplamento, acesso direto ao banco | 🟡 A confirmar |
| Evento (Kafka/mensageria) | Reativo, desacoplado | Pode não estar disponível | 🟡 A confirmar |

## Perguntas em Aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | Existe API que expõe dados do Banco Inventário? | Time Plataforma | Aberto |
| 2 | Manhattan WMS tem relação direta com Banco Inventário? | Time Abastecimento | Aberto |
| 3 | Qual a latência aceitável para dados de estoque no tracking? | PO / Time GO | Aberto |

## Referências

- [[E05-estoque]] — Detalhamento da etapa
- [[decisao-fonte-dados-tracking]] — Decisão arquitetural API vs SQL
- [[sku-lifecycle]] — Pipeline completo
