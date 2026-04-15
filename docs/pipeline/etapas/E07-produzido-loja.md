---
tags: [tracking, pipeline, etapa, produzido, produzido-loja, admin, conteudo, catalogo]
etapa: 7
titulo: Produzido Loja Física
status: integrado
origem: API Catálogo (campo FlagSkuProduzidoLojaFisica)
escopo: 1P apenas
updated: 2026-04-15
fonte: API Catálogo, composição Mercadorias.Geral.FlagSkuProduzidoLojaFisica
---

# E07 — Produzido Loja Física

> Etapa que valida se o conteúdo do produto (fotos, descrição, especificações) está pronto para publicação em **loja física**. Etapa correspondente para o site: [[E06-produzido]].

> ℹ️ Esta etapa foi criada a partir do desmembramento da antiga E06 (Produzido), que continha os dois canais em uma única etapa. Agora site e loja física são acompanhados de forma independente.

## Visão Geral

| Atributo | Valor |
|----------|-------|
| Etapa | 7 de 9 |
| Sistema de Origem | **Admin** (escreve) / **API Catálogo** (leitura) |
| Interface de Leitura | ✅ `GET /api/v1/produto-sku/selecionar` — campo `Mercadorias[].Geral.FlagSkuProduzidoLojaFisica` |
| Escopo | **1P apenas** |
| Status do Mapeamento | **Integrado — campo confirmado via API Catálogo** |
| Etapa anterior | [[E06-produzido]] |
| Próxima etapa | [[E08-ativacao-pricing]] |

> ℹ️ **Fonte: ADR-003 (2026-04-15).** Interface de leitura confirmada como **API Catálogo** via campo `Mercadorias[].Geral.FlagSkuProduzidoLojaFisica`.

---

## Como Obter os Dados

| Método | Detalhe |
|--------|---------|
| Sistema de Origem | **Admin** — responsável por gravar a flag de produção |
| Interface de Leitura | ✅ **API CATÁLOGO** — mesmo endpoint das etapas E01, E02, E03 e E06 |
| Endpoint | `GET https://gestaoproduto-catalogo-hlg.viavarejo.com.br/api/v1/produto-sku/selecionar` |
| Autenticação | Header `apikey: [API_KEY_ENV]` |
| Parâmetro chave | `idSkuSite={id_sku}` ou `idSkuLoja={id_sku}` |
| Campo na composição | `Mercadorias.Geral.FlagSkuProduzidoLojaFisica` |
| Frequência de atualização | Por evento — quando flag de produção de loja é atualizada |
| Chave de rastreamento | `idSkuSite` ou `idSkuLoja` |

> ℹ️ **Fonte: ADR-003 (2026-04-15).** Interface de leitura confirmada como **API Catálogo** via campo `Mercadorias[].Geral.FlagSkuProduzidoLojaFisica`. O Admin continua sendo o sistema de origem; a API Catálogo é a interface de leitura. Ver [[ADR-003-complementacao-dados-api-catalogo]].

---

## Campos / Schema

| Campo | Tipo | Descrição | Obrigatório |
|-------|------|-----------|-------------|
| `idSkuSite` ou `idSkuLoja` | string | Identificador do SKU | Sim |
| `Mercadorias[].Geral.FlagSkuProduzidoLojaFisica` | int (0/1) | `0` = não produzido, `1` = produzido para loja física | Sim |
| `data_producao_loja` | datetime | Data em que o conteúdo da loja foi finalizado | Não |

> ℹ️ **Mapeamento para o Tracking (ADR-003):** `FlagSkuProduzidoLojaFisica = 1` → `produzidoLf: true`; `= 0` → `produzidoLf: false`.

### O que significa "Produzido" para Loja Física

| Componente | Descrição |
|------------|-----------|
| Fotos | Imagens do produto em qualidade adequada para material de loja |
| Descrição | Texto descritivo do produto |
| Especificações técnicas | Dimensões, peso, material, etc. |
| Ficha técnica | Informações regulatórias/fiscais para etiquetas de loja |

> A definição exata de "produzido" (quais componentes são obrigatórios para loja física) deve ser confirmada com o time de Catálogo.

---

## Para Que Esses Dados São Usados

- **Filtro do painel de tracking** — `Produzido Loja: S/N` é um dos filtros configuráveis
- **Bloquear exibição em loja física** se `produzido_loja_fisica = 'N'` — SKU sem conteúdo não deve ser exibido em ponto de venda físico
- **Lead-time de produção de conteúdo (loja)**: `data_producao_loja - data_cadastro ([[E01-cadastro-inicial]])`
- **Análise de gargalo**: quantos SKUs ficam parados por falta de conteúdo para loja
- **Canal independente do site**: ver [[E06-produzido]] para o estado do site

---

## Regras de Negócio

- `produzido_loja_fisica = 'S'` é condição de negócio para exibição em loja física — o tracking verifica este estado independentemente ([[E09-exibicao-site-loja]])
- O estado de loja física é **independente** do estado do site ([[E06-produzido]])
- Um SKU pode estar produzido para o site mas não para loja, e vice-versa
- SKUs do tipo `Digital/Download` geralmente não precisam de `produzido_loja_fisica`
- A flag pode ter uma timeline diferente da flag de site — equipes distintas podem ser responsáveis

---

## Gaps / Perguntas em Aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | Qual API/tabela do Admin expõe a flag `produzido_loja_fisica`? | Time Catálogo | Aberto |
| 2 | Existe evento publicado quando `produzido_loja_fisica` muda para `S`? | Time Plataforma | Aberto |
| 3 | Quais componentes são obrigatórios para considerar um SKU "produzido" para loja? | Time Conteúdo | Aberto |
| 4 | A flag pode voltar para `N` após ter sido `S`? (revisão de conteúdo) | Time Catálogo | Aberto |
| 5 | O time responsável pela produção de loja é o mesmo do site ou diferente? | Juliana Dos Santos | Aberto |

---

## Referências

- [[sku-lifecycle]] — Pipeline completo
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [[E06-produzido]] — Etapa anterior (Produzido Site)
- [[E08-ativacao-pricing]] — Próxima etapa (Ativação Pricing)
