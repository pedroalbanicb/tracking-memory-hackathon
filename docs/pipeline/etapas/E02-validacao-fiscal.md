---
tags: [tracking, pipeline, etapa, fiscal, taxweb, catalogo]
etapa: 2
titulo: Validação Fiscal
status: integrado
origem: Tax Web (via API Catálogo)
escopo: 1P apenas
updated: 2026-04-09
fonte: Juliana Dos Santos
---

# E02 — Validação Fiscal

> Etapa que libera ou bloqueia o SKU para o fluxo de compra. Sem validação fiscal, o produto não avança no pipeline.

## Visão Geral

| Atributo | Valor |
|----------|-------|
| Etapa | 2 de 9 |
| Sistema de Origem | **Tax Web** (escreve as flags) |
| Interface de Leitura | ✅ **API Catálogo** — mesmo endpoint da E01 |
| Escopo | **1P apenas** |
| Status do Mapeamento | **Integrado — campos confirmados via API Catálogo** |
| Etapa anterior | [[E01-cadastro-inicial]] |
| Próxima etapa | [[E03-proposta-comercial]] |

---

## Como Obter os Dados

| Método | Detalhe |
|--------|---------|
| Sistema de Origem | **Tax Web** — responsável por gravar as flags de bloqueio |
| Interface de Leitura | ✅ **API CATÁLOGO** — mesmo endpoint da [[E01-cadastro-inicial]] |
| Endpoint | `GET https://gestaoproduto-catalogo-hlg.viavarejo.com.br/api/v1/produto-sku/selecionar` |
| Autenticação | Header `apikey: [API_KEY_ENV]` |
| Parâmetro chave | `IdSkuSite={id_sku}` |
| Seleção de campos | `composicao=...;Mercadorias.DadosBasicos.FlagCompraBloqueada;Mercadorias.DadosBasicos.FlagVendaBloqueada` |
| Frequência de atualização | Por evento (quando a flag muda no Tax Web) |
| Chave de rastreamento | `IdSkuSite` |

> ℹ️ **Fonte: Juliana Dos Santos (2026-04-09).** Sistema de origem confirmado como **Tax Web**. Interface de leitura confirmada como **API Catálogo** via curl testado em 2026-04-09.
> ℹ️ Tax Web **escreve** as flags; API Catálogo é a **interface de leitura** — ambas as informações estão corretas.

---

## Campos / Schema

| Campo API | Campo Interno | Tipo | Descrição | Obrigatório |
|-----------|---------------|------|-----------|-------------|
| `Mercadorias[].DadosBasicos.FlagCompraBloqueada` | `compra_bloqueada` | int (0/1) | `0` = liberado para compra, `1` = bloqueado | Sim |
| `Mercadorias[].DadosBasicos.FlagVendaBloqueada` | `venda_bloqueada` | int (0/1) | `0` = venda liberada, `1` = bloqueada | Sim |

> ℹ️ Os campos `FlagCompraBloqueada` e `FlagVendaBloqueada` são os mesmos retornados na E01 — a mesma chamada à API Catálogo serve as etapas 1 e 2 simultaneamente.

### Lógica das Flags

| Campo | Valor | Significado |
|-------|-------|-------------|
| `FlagCompraBloqueada` | `0` | Compra **liberada** — SKU pode avançar |
| `FlagCompraBloqueada` | `1` | Compra **bloqueada** — pendente validação fiscal (Tax Web) |
| `FlagVendaBloqueada` | `0` | Venda **liberada** |
| `FlagVendaBloqueada` | `1` | Venda **bloqueada** |

> ℹ️ **Mapeamento com modelo anterior (legado):** a documentação anterior referia `ok_fiscal = 'S'/'N'` — isso era nomenclatura conceitual. Os campos reais na API são `FlagCompraBloqueada` e `FlagVendaBloqueada` com valores inteiros 0/1.

---

## Para Que Esses Dados São Usados

- **Determinar se o SKU pode avançar** para a Proposta Comercial ([[E03-proposta-comercial]])
- **Identificar SKUs travados nessa etapa** — relatório de bloqueio fiscal
- **Calcular lead-time fiscal**: `data_liberacao_fiscal - data_cadastro` da [[E01-cadastro-inicial]]
- **Filtro de elegibilidade** do painel de tracking: somente SKUs com `ok_fiscal = 'N'` são elegíveis

---

## Regras de Negócio

- SKU com `ok_fiscal = 'S'` ou nulo → **não avança** no pipeline
- SKU com `ok_fiscal = 'N'` → `liberado_para_compra = 'S'` e pode seguir para [[E03-proposta-comercial]]
- A liberação fiscal é pré-requisito obrigatório — não há exceções documentadas
- Revalidação pode ocorrer se atributos fiscais do produto forem alterados (a confirmar)

---

## Gaps / Perguntas em Aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | ~~Qual tabela/API do Catálogo expõe as flags de bloqueio?~~ | Time Catálogo | ✅ Resolvido — `FlagCompraBloqueada` e `FlagVendaBloqueada` via `GET /api/v1/produto-sku/selecionar` |
| 2 | Existe evento publicado quando as flags mudam (Tax Web → Catálogo)? | Time Plataforma | Aberto |
| 3 | Uma rejeição fiscal pode ser revertida? Qual o fluxo? | Fiscal / GO | Aberto |
| 4 | Existe campo `data_liberacao_fiscal` disponível na API? (não testado) | Time Catálogo | Aberto |

---

## Referências

- [[sku-lifecycle]] — Pipeline completo
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [[E01-cadastro-inicial]] — Etapa anterior
- [[E03-proposta-comercial]] — Próxima etapa
