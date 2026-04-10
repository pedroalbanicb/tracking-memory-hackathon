---
tags: [tracking, pipeline, etapa, produzido, produzido-site, admin, conteudo]
etapa: 6
titulo: Produzido Site
status: mapeado-parcialmente
origem: Admin
escopo: 1P apenas
updated: 2026-04-09
fonte: Juliana Dos Santos
---

# E06 — Produzido Site

> Etapa que valida se o conteúdo do produto (fotos, descrição, especificações) está pronto para publicação no **site**. Etapa correspondente para loja física: [[E07-produzido-loja]].

> ⚠️ Esta etapa foi desmembrada em duas: E06 (Produzido Site) e E07 (Produzido Loja Física). Anteriormente era uma única etapa com duas flags.

## Visão Geral

| Atributo | Valor |
|----------|-------|
| Etapa | 6 de 9 |
| Sistema de Origem | **Admin** |
| Status do Mapeamento | Sistema identificado — integração a mapear |
| Etapa anterior | [[E05-estoque]] |
| Próxima etapa | [[E07-produzido-loja]] |

---

## Como Obter os Dados

| Método | Detalhe |
|--------|---------|
| Sistema | **Admin** |
| Interface | ⚠️ A definir — API REST, banco, ou evento? |
| Frequência de atualização | Por evento — quando flag de produção é atualizada |
| Chave de rastreamento | `id_sku` |

> ℹ️ **Fonte: Juliana Dos Santos (2026-04-09).** Sistema confirmado como **Admin** (anteriormente documentado como Catálogo — corrigido). Método de acesso ainda não definido.

---

## Campos / Schema

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `id_sku` | string | Identificador do SKU | Sim |
| `produzido_site` | enum (`S`/`N`) | Conteúdo produzido para o canal digital | Sim |
| `data_producao_site` | datetime | Data em que o conteúdo do site foi finalizado | Não |

### O que significa "Produzido"

| Componente | Descrição |
|------------|-----------|
| Fotos | Imagens do produto em qualidade adequada |
| Descrição | Texto descritivo do produto |
| Especificações técnicas | Dimensões, peso, material, etc. |
| Ficha técnica | Informações regulatórias/fiscais |

> A definição exata de "produzido" (quais componentes são obrigatórios) deve ser confirmada com o time de Catálogo.

---

## Para Que Esses Dados São Usados

- **Filtro do painel de tracking** — `Produzido Site: S/N` é um dos filtros configuráveis
- **Bloquear exibição no site** se `produzido_site = 'N'` — SKU sem conteúdo não deve aparecer para o cliente
- **Lead-time de produção de conteúdo (site)**: `data_producao_site - data_cadastro ([[E01-cadastro-inicial]])`
- **Análise de gargalo**: quantos SKUs ficam parados nesta etapa por falta de conteúdo
- **Canal independente de loja física**: ver [[E07-produzido-loja]] para o estado de loja

---

## Regras de Negócio

- `produzido_site = 'S'` é condição de negócio para exibição no canal digital — o tracking verifica este estado independentemente ([[E09-exibicao-site-loja]])
- Para loja física, ver [[E07-produzido-loja]]
- SKUs do tipo `Digital/Download` precisam de `produzido_site` mas podem não precisar de `produzido_loja_fisica`

---

## Gaps / Perguntas em Aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | Qual API/tabela do Admin expõe as flags de produção? | Time Admin | Aberto |
| 2 | Existe evento publicado quando `produzido_site` muda para `S`? | Time Plataforma | Aberto |
| 3 | Quais componentes são obrigatórios para considerar um SKU "produzido"? | Time Conteúdo | Aberto |
| 4 | A flag pode voltar para `N` após ter sido `S`? (revisão de conteúdo) | Time Catálogo | Aberto |

---

## Referências

- [[sku-lifecycle]] — Pipeline completo
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [[E05-estoque]] — Etapa anterior
- [[E07-produzido-loja]] — Próxima etapa (Produzido Loja Física)
- [[E08-ativacao-pricing]] — Etapa 8 (Ativação Pricing)
