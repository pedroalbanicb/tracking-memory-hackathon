---
tags: [tracking, indice, vault, go]
tipo: home
updated: 2026-04-09
---

# Tracking de Produtos — Repositório de Arquitetura

Documentação versionada do domínio de **Tracking de Produtos** do GO (Gestão de Operações) — Casas Bahia Tech.

> Este repositório é um **vault Obsidian**. Abra com o app Obsidian para navegação com wikilinks, graph view e busca semântica.
> Qualquer proposta de mudança passa por Pull Request — este repo substitui o Confluence como fonte de verdade.

## Estrutura

```
tracking-memory-hackathon/       ← vault Obsidian
├── PRD/          — Product Requirements Documents (o quê e por quê)
├── RFC/          — Request for Comments (proposta técnica antes de implementar)
├── ADR/          — Architecture Decision Records (decisões tomadas e contexto)
└── docs/         — Diagramas, pipelines e referências de domínio
    └── pipeline/
        ├── sku-lifecycle.md     ← índice do pipeline (visão geral)
        └── etapas/              ← detalhamento por etapa
            ├── E01-cadastro-inicial.md
            ├── E02-validacao-fiscal.md
            ├── E03-proposta-comercial.md
            ├── E04-agendamento.md
            ├── E05-estoque.md
            ├── E06-produzido.md
            ├── E07-produzido-loja.md
            ├── E08-ativacao-pricing.md
            └── E09-exibicao-site-loja.md
```

## Domínio

O **Tracking de Produtos GO** cobre o ciclo completo de um SKU desde o cadastramento inicial até o momento em que ele fica disponível para compra no site/loja física.

## Pipeline — Ciclo de Vida do SKU

[[sku-lifecycle|Ver pipeline completo →]]

| Etapa | Nome | Origem | Status |
|-------|------|--------|--------|
| 1 | [[E01-cadastro-inicial\|Cadastro Inicial]] | GO / Catálogo | ✅ Mapeado |
| 2 | [[E02-validacao-fiscal\|Validação Fiscal]] | Tax Web (via API Catálogo) | ✅ Mapeado |
| 3 | [[E03-proposta-comercial\|Proposta Comercial]] | LN (Infor) | 🟡 Parcial |
| 4 | [[E04-agendamento\|Agendamento]] | LN / Neogrid | ⚠️ Parcial |
| 5 | [[E05-estoque\|Estoque]] | Banco Inventario (SQL) | ⚠️ Regras mapeadas |
| 6 | [[E06-produzido\|Produzido Site]] | Admin | ⚠️ Parcial |
| 7 | [[E07-produzido-loja\|Produzido Loja Física]] | Admin | ⚠️ Parcial |
| 8 | [[E08-ativacao-pricing\|Ativação Pricing]] | GO / Admin (SQL) | ⚠️ Flags confirmadas |
| 9 | [[E09-exibicao-site-loja\|Exibição Site/Loja]] | Corp / MONGOS | ⚠️ Regras mapeadas |

## Como contribuir

| Ação | Template |
|------|----------|
| Propor nova feature/comportamento | `PRD/template.md` |
| Propor mudança técnica antes de implementar | `RFC/template.md` |
| Registrar decisão já tomada | `ADR/template.md` |

1. Crie um branch `docs/{tipo}/{titulo-kebab-case}`
2. Preencha o template
3. Abra PR — mínimo 1 review do tech lead ou arquiteto de domínio
4. Merge gera a decisão como oficial

## Referências Externas (Confluence)

[[referencias-confluence|Ver índice de páginas Confluence por tema →]]

Páginas mapeadas: Tax Web, LN/Infor, Neogrid, SkuLojista, MONGOS (queries), flags de exibição, estoque fingido, runbooks SRE e mais.

## Filtros do Painel GO

O painel de tracking aplica os seguintes filtros padrão para exibição:
- **Produzido**: S/N
- **Com estoque**: sim
- **Ativos**: sim
- **Categorias**: configurável
