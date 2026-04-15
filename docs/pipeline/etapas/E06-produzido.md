---
tags: [tracking, pipeline, etapa, produzido, produzido-site, admin, conteudo, catalogo]
etapa: 6
titulo: Produzido Site
status: integrado
origem: API Catálogo (campo FlagSkuProduzido)
escopo: 1P apenas
updated: 2026-04-15
fonte: API Catálogo, composição Mercadorias.Geral.FlagSkuProduzido
---

# E06 — Produzido Site

> Etapa que valida se o conteúdo do produto (fotos, descrição, especificações) está pronto para publicação no **site**. Etapa correspondente para loja física: [[E07-produzido-loja]].

> ⚠️ Esta etapa foi desmembrada em duas: E06 (Produzido Site) e E07 (Produzido Loja Física). Anteriormente era uma única etapa com duas flags.

## Visão Geral

| Atributo | Valor |
|----------|-------|
| Etapa | 6 de 9 |
| Sistema de Origem | **Admin** (escreve) / **API Catálogo** (leitura) |
| Interface de Leitura | ✅ `GET /api/v1/produto-sku/selecionar` — campo `Mercadorias[].Geral.FlagSkuProduzido` |
| Escopo | **1P apenas** |
| Status do Mapeamento | **Integrado — campo confirmado via API Catálogo** |
| Etapa anterior | [[E05-estoque]] |
| Próxima etapa | [[E07-produzido-loja]] |

---

## Como Obter os Dados

| Método | Detalhe |
|--------|---------|
| Sistema de Origem | **Admin** — responsável por gravar a flag de produção |
| Interface de Leitura | ✅ **API CATÁLOGO** — mesmo endpoint das etapas E01, E02, E03 e E07 |
| Endpoint | `GET https://gestaoproduto-catalogo-hlg.viavarejo.com.br/api/v1/produto-sku/selecionar` |
| Autenticação | Header `apikey: [API_KEY_ENV]` |
| Parâmetro chave | `idSkuSite={id_sku}` ou `idSkuLoja={id_sku}` |
| Campo na composição | `Mercadorias.Geral.FlagSkuProduzido` |
| Frequência de atualização | Por evento — quando flag de produção é atualizada |
| Chave de rastreamento | `idSkuSite` ou `idSkuLoja` |

> ℹ️ **Fonte: ADR-003 (2026-04-15).** Interface de leitura confirmada como **API Catálogo** via campo `Mercadorias[].Geral.FlagSkuProduzido` na composição. O Admin continua sendo o sistema de origem que escreve a flag; a API Catálogo é a interface de leitura usada pelo tracking. Ver [[ADR-003-complementacao-dados-api-catalogo]].

---

## Campos / Schema

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `idSkuSite` ou `idSkuLoja` | string | Identificador do SKU | Sim |
| `Mercadorias[].Geral.FlagSkuProduzido` | int (0/1) | `0` = não produzido, `1` = produzido para o site | Sim |
| `data_producao_site` | datetime | Data em que o conteúdo do site foi finalizado | Não |

> ℹ️ **Mapeamento para o Tracking (ADR-003):** `FlagSkuProduzido = 1` → `produzidoSite: true`; `= 0` → `produzidoSite: false`.

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
