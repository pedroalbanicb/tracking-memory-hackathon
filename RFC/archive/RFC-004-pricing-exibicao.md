---
tags: [rfc, tracking, pricing, exibicao, integracao, skulojista, mongos, archive]
status: accepted
autor: Pedro Martins
data: 2026-04-10
prd-relacionado: [[PRD-001-tracking-sku-lifecycle]]
revisores: []
updated: 2026-04-14
implementado: true
nota: Arquivado — SQL Corp direto implementado em TrackingPricingRepositorio e TrackingExibicaoRepositorio
---

# RFC-004 — Integração de Pricing e Exibição (E08/E09)

**Status:** Draft  
**Autor:** Pedro Martins  
**Data:** 2026-04-10  
**PRD relacionado:** [[PRD-001-tracking-sku-lifecycle]]  
**Revisores:** A definir

---

## Resumo

Proposta de estratégia de integração para obter dados de ativação de pricing (E08) e flags de exibição (E09) a partir das tabelas SQL (`SkuLojista`, `SkuLojistaPreço`, `Sku`, `Produto`, `Marca`, `Categoria`) e/ou MongoDB (MONGOS).

## Motivação

As etapas [[E08-ativacao-pricing]] e [[E09-exibicao-site-loja]] têm flags SQL confirmadas, mas a **interface de leitura** (query SQL Corp direto ou via MongoDB/MONGOS) ainda não foi decidida. Esta RFC deve resolver essa decisão, que é a mesma documentada em [[decisao-fonte-dados-tracking]].

## Contexto

- **E08:** `SkuLojista.FlagAtiva` + `SkuLojistaPreço.FlagAtiva` — confirmados por Douglas Souza Wolff (09/04/2026)
- **E09:** 14+ flags em 5 grupos (SkuLojista, Sku, Produto, Marca, Categoria) — mapeados por Ricardo Tadeu Lima e Douglas Souza Wolff (09/04/2026)
- **Propagação:** Rundeck job → MongoDB (MONGOS) — confirmado
- **Sistemas envolvidos:** SQL Corp (banco corporativo compartilhado), MONGOS (MongoDB de Pricing)

## Proposta Detalhada

> A definir após alinhamento com Time Oferta, Time Plataforma e decisão [[decisao-fonte-dados-tracking]].

### Opções em Avaliação

| Opção | Prós | Contras | Status |
|-------|------|---------|--------|
| SQL Corp direto (múltiplas tabelas) | Dados completos, query pronta, mesmo banco do checkout | Acoplamento a 6+ tabelas | 🟡 A confirmar |
| MongoDB (MONGOS) | Dados já consolidados para site | Qual collection/endpoint? | 🟡 A confirmar |

## Perguntas em Aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | ~~MONGOS é cluster, componente ou ambiente?~~ | Ricardo Tadeu Lima | ✅ Confirmado — MongoDB de Pricing (Mongo Pricing) |
| 2 | ~~Corp é API, time ou linked server?~~ | Pedro Martins | ✅ Confirmado — SQL Server corporativo (banco compartilhado). Linked server `CORP_PRD` referencia esse banco. |
| 3 | Qual collection MongoDB serve os dados de exibição? | Time Plataforma | Aberto |
| 4 | Existe API unificada que expõe as flags de E08+E09? | Time Oferta | Aberto |

## Referências

- [[E08-ativacao-pricing]] — Detalhamento da etapa 8
- [[E09-exibicao-site-loja]] — Detalhamento da etapa 9
- [[decisao-fonte-dados-tracking]] — Decisão arquitetural API vs SQL
- [[regras-exibicao-sku]] — Regras completas de exibição
- [[sku-lifecycle]] — Pipeline completo
