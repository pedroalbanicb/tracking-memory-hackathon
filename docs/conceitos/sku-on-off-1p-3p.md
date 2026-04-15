---
tags: [conceito, sku, 1p, 3p, backoffice, site, tracking]
tipo: conceito
updated: 2026-04-09
---

# Conceito — SKU ON vs SKU OFF / 1P vs 3P

> Conceitos fundamentais do domínio de Tracking GO.

> ⚠️ **O Tracking de Produtos é exclusivo para produtos 1P.** Produtos 3P estão fora do escopo do sistema.

---

## SKU OFF vs SKU ON

| Conceito | Descrição | Audiência |
|----------|-----------|-----------|
| **SKU OFF** | SKU do **backoffice** — visão operacional interna | Analistas GO, TI, Compras |
| **SKU ON** | SKU que **aparece no site para o cliente** — visão de vitrine | Cliente final, Time de Conteúdo |

- O tracking de produtos no painel GO opera sobre os **SKUs OFF** (backoffice)
- A tela inicial é carregada com os **mesmos SKUs que já existem no portal GO**
- Um SKU pode existir no backoffice (OFF) mas não estar visível no site (ON)

---

## 1P vs 3P

| Tipo | Descrição | Comportamento SKU ON/OFF | No Tracking |
|------|-----------|--------------------------|-------------|
| **1P** (First Party) | Produto vendido e entregue pela própria Casas Bahia | SKU ON ≠ SKU OFF — dados **diferentes** | ✅ No escopo |
| **3P** (Third Party) | Produto de marketplace — vendedor parceiro | SKU ON = SKU OFF — dados **iguais** | ❌ Fora do escopo |

### 1P — Dados Distintos

Para produtos **1P**, o SKU ON e o SKU OFF podem ter dados divergentes:
- Preço pode estar diferente (promoção aplicada só no site)
- Status de disponibilidade pode divergir entre canais
- O tracking de produtos foca no **SKU OFF** (origem dos dados)

### 3P — Dados Unificados

Para produtos **3P** (marketplace):
- ON e OFF compartilham os **mesmos dados**
- Não há distinção de canal para fins de tracking neste contexto
- Fontes de dados são as mesmas independente do canal

---

## Impacto no Tracking de Produtos

| Etapa | Impacto 1P | Impacto 3P |
|-------|------------|------------|
| [[E01-cadastro-inicial\|E01]] | SKU nasce como OFF; ON é criado separadamente | ON e OFF criados juntos |
| [[E06-produzido\|E06]] | Flag `produzido_site` refere ao SKU ON | Mesma flag para ambos |
| [[E08-ativacao-pricing\|E08]] | Preço do site (ON) pode diferir do backoffice | Mesmo preço para ambos |
| [[E09-exibicao-site-loja\|E09]] | URL do site representa o SKU ON | URL única representa ambos |

---

## Carga Inicial do Painel

> A tela inicial do tracking é carregada com os SKUs que **já existem no portal GO**.

- Fonte: Portal GO (sistema interno de Gestão de Operações)
- Escopo: SKUs ativos no backoffice (**SKU OFF**)
- Filtros aplicáveis na carga: Produzido (S/N), Com Estoque, Ativos, Categorias
- Ver filtros de elegibilidade: [[sku-lifecycle#Filtros de Elegibilidade]]

---

## Referências

- [[sku-lifecycle]] — Tracking completo
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [[E01-cadastro-inicial]] — Etapa de cadastro (origem do SKU)
