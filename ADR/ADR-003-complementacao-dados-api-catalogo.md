---
tags: [tracking, adr, api, catalogo, complementacao, hackathon]
status: proposed
data: 2026-04-15
autores: [Guilherme Maesta Domke de Thomaz]
rfc-relacionada:
updated: 2026-04-15
---

# ADR-003 — Complementação de Dados via API Catálogo para Etapas E01–E07

**Status:** Proposed  
**Data:** 2026-04-15  
**Autores:** Guilherme Maesta Domke de Thomaz  
**RFC relacionada:** N/A  
**ADR anterior:** [[ADR-002-contrato-api-tracking-skus-fase-1-graphql]]

---

## Contexto

A [[ADR-002-contrato-api-tracking-skus-fase-1-graphql]] definiu o contrato da API de Tracking com fonte inicial GraphQL de mercadorias. Naquela fase, apenas o campo `cadastro` (E01) era preenchido — as demais etapas retornavam `null`.

Após análise da API Catálogo (`GET /api/v1/produto-sku/selecionar`), identificou-se que uma **única chamada** com a composição adequada retorna os dados necessários para **5 das 9 etapas** do tracking:

| Etapa | Campo API Catálogo | Regra de preenchimento |
|---|---|---|
| E01 — Cadastro | Existência do SKU na resposta | Sempre `true` (se retornou, existe) |
| E02 — Validação Fiscal | `Mercadorias[].DadosBasicos.FlagCompraBloqueada` | `true` quando `FlagCompraBloqueada = 0` (liberado) |
| E03 — Proposta Comercial | `Mercadorias[].DadosBasicos.FlagContratoLiberado` | `true` quando `FlagContratoLiberado = true`; `null` quando ausente/null |
| E06 — Produzido Site | `Mercadorias[].Geral.FlagSkuProduzido` | `true` quando `FlagSkuProduzido = 1` |
| E07 — Produzido Loja Física | `Mercadorias[].Geral.FlagSkuProduzidoLojaFisica` | `true` quando `FlagSkuProduzidoLojaFisica = 1` |

Adicionalmente, o campo `agendamento` (E04) foi identificado como coluna necessária no contrato de saída para manter o alinhamento com o pipeline de 9 etapas, mesmo que sua fonte de dados (LN / Neogrid) ainda não esteja integrada.

### Composição atualizada

```
composicao=Geral.Nome;Mercadorias.DadosBasicos.NomeTipoSku;Mercadorias.DadosBasicos.FlagCrossDocking;Mercadorias.DadosBasicos.FlagCompraBloqueada;Mercadorias.Controle.DataCadastro;Mercadorias.DadosBasicos.FlagContratoLiberado;Mercadorias.Geral.FlagSkuProduzido;Mercadorias.Geral.FlagSkuProduzidoLojaFisica
```

### Parâmetro chave

O endpoint aceita tanto `idSkuSite` quanto `idSkuLoja` como parâmetro de busca, dependendo do identificador disponível no contexto da chamada.

Fonte: Guilherme Maesta Domke de Thomaz, 2026-04-15.

---

## Decisão

**Decidimos:** complementar os dados da listagem de tracking com uma chamada à API Catálogo para cada item retornado pelo GraphQL, preenchendo as etapas E01, E02, E03, E06 e E07 na fase 1.

### 1. Fluxo de composição no BFF

```
1. Frontend envia POST /api/v1/tracking/skus/listar
2. BFF executa query GraphQL de mercadorias (listagem base)
3. Para cada item retornado:
   a. BFF chama GET /api/v1/produto-sku/selecionar
      com idSkuSite={skuOn} ou idSkuLoja={skuOff}
      e composição completa (ver acima)
   b. BFF mapeia os campos retornados para as colunas E01–E07
4. BFF retorna payload consolidado com todas as colunas
```

### 2. Contrato de saída atualizado (fase 1 + complementação)

```json
{
  "data": {
    "items": [
      {
        "id": "293448",
        "skuOff": "5368715",
        "skuOn": "55072185",
        "mercadoria": "MOEDOR DE CAFE MONDIAL MCF-01-BI PT/INOX 220V",
        "tipoNegociacao": "NORMAL",
        "cadastro": true,
        "validacaoFiscal": true,
        "propostaComercial": null,
        "agendamento": null,
        "estoque": true,
        "produzidoSite": false,
        "produzidoLf": false,
        "ativacaoPricing": true,
        "exibicaoSite": null
      }
    ],
    "total": 1
  }
}
```

### 3. Mapeamento de campos API Catálogo → colunas de tracking

| Coluna Tracking | Campo API Catálogo | Tipo retorno | Regra de mapeamento |
|---|---|---|---|
| `cadastro` (E01) | Existência do SKU | boolean | Sempre `true` — se o SKU retornou no GraphQL, ele existe no catálogo |
| `validacaoFiscal` (E02) | `Mercadorias[].DadosBasicos.FlagCompraBloqueada` | boolean | `true` se `FlagCompraBloqueada = 0`; `false` se `= 1` |
| `propostaComercial` (E03) | `Mercadorias[].DadosBasicos.FlagContratoLiberado` | boolean/null | `true` se `FlagContratoLiberado = true`; `false` se `= false`; `null` se campo ausente/null |
| `agendamento` (E04) | — (fonte não integrada) | null | `null` — LN/Neogrid pendente |
| `estoque` (E05) | **API Oferta**: `PrecoSkus[*].PrecoVenda.DisponibilidadeEstoque` | boolean | `true` quando `DisponibilidadeEstoque = true`. Ver [[ADR-004-integracao-api-oferta-e05-e08]] |
| `produzidoSite` (E06) | `Mercadorias[].Geral.FlagSkuProduzido` | boolean | `true` se `FlagSkuProduzido = 1`; `false` se `= 0` |
| `produzidoLf` (E07) | `Mercadorias[].Geral.FlagSkuProduzidoLojaFisica` | boolean | `true` se `FlagSkuProduzidoLojaFisica = 1`; `false` se `= 0` |
| `ativacaoPricing` (E08) | **API Oferta**: `Valido` (raiz) | boolean | `true` quando `Valido = true`. Ver [[ADR-004-integracao-api-oferta-e05-e08]] |
| `exibicaoSite` (E09) | — (fonte não integrada) | null | `null` — SQL Corp / MONGOS pendente |

### 4. Campo `agendamento` (E04) no contrato

O campo `agendamento` foi adicionado ao contrato de saída para que a tabela frontend reflita todas as 9 etapas do pipeline:

| Campo | Tipo | Valor fase 1 | Fonte futura |
|---|---|---|---|
| `agendamento` | boolean/null | `null` | LN / Neogrid (integração a definir) |

A inclusão garante que o frontend não precise ser alterado quando a fonte de agendamento for integrada — apenas o backend passará a preencher o campo.

### 5. Escopo explícito desta ADR

Inclui:
- Complementação de E01, E02, E03, E06 e E07 via API Catálogo
- Atualização da composição de campos na chamada à API Catálogo
- Aceitação de `idSkuSite` ou `idSkuLoja` como parâmetro chave
- Inclusão do campo `agendamento` (E04) no contrato de saída
- Regras de mapeamento dos flags para booleanos do contrato

Não inclui:
- Integração com LN/Neogrid para agendamento (E04)
- Integração com SQL Corp / MONGOS para exibição (E09)

> **Nota:** E05 (estoque) e E08 (ativacaoPricing) agora cobertos pela [[ADR-004-integracao-api-oferta-e05-e08]].

---

## Consequências

### Positivas

- **5 de 9 etapas preenchidas** na fase 1, aumentando significativamente a utilidade do painel
- **Chamada única** à API Catálogo por item — composição eficiente
- **E06 e E07 deixam de depender** de discovery do Admin — dados disponíveis na API Catálogo via `FlagSkuProduzido` e `FlagSkuProduzidoLojaFisica`
- **Campo `agendamento` no contrato** desde a fase 1 — frontend preparado para quando a fonte for integrada
- **FlagVendaBloqueada removida** da composição por não ser necessária no tracking (apenas FlagCompraBloqueada é usada para E02)

### Negativas / Trade-offs

- **N+1 chamadas** à API Catálogo (1 por item retornado pelo GraphQL) — pode impactar latência em lotes grandes
- Dependência de **dois sistemas** (GraphQL + API Catálogo) para compor a listagem completa
- E04 retorna `null` até a integração LN/Neogrid ser implementada

### Neutras

- O contrato de saída agora tem 9 colunas de etapa (antes tinha 8) — `agendamento` foi adicionado
- A remoção de `FlagVendaBloqueada` da composição não afeta o tracking (campo não era usado)

---

## Alternativas Rejeitadas

| Alternativa | Motivo de rejeição |
|---|---|
| Manter `null` para E02/E03/E06/E07 e implementar services separados | Dados já disponíveis na API Catálogo — desnecessário criar services adicionais |
| Consultar Admin diretamente para E06/E07 | `FlagSkuProduzido` e `FlagSkuProduzidoLojaFisica` já estão expostos na API Catálogo |
| Omitir E04 (agendamento) do contrato | Pipeline tem 9 etapas — omitir causaria inconsistência e retrabalho no frontend quando E04 for integrado |
| Usar `FlagVendaBloqueada` para E02 | `FlagCompraBloqueada` é o indicador correto de validação fiscal. `FlagVendaBloqueada` é flag distinta (venda, não compra) |

---

## Referências

- [[ADR-002-contrato-api-tracking-skus-fase-1-graphql]] — ADR da fase 1 (GraphQL)
- [[PRD-002-frontend-tracking]] — Requisitos de interface
- [[E01-cadastro-inicial]] — Etapa 1
- [[E02-validacao-fiscal]] — Etapa 2
- [[E03-proposta-comercial]] — Etapa 3
- [[E04-agendamento]] — Etapa 4
- [[E06-produzido]] — Etapa 6
- [[E07-produzido-loja]] — Etapa 7
- [[ADR-004-integracao-api-oferta-e05-e08]] — E05 e E08 via API Oferta
- [[sku-lifecycle]] — Pipeline completo
