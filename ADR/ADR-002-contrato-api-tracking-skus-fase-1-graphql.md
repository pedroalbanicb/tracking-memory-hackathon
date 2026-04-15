---
tags: [tracking, adr, api, graphql, bff, hackathon]
status: draft
data: 2026-04-14
autores: [Lucas Rocha, Guilherme Maesta Domke de Thomaz]
rfc-relacionada:
updated: 2026-04-14
---

# ADR-002 — Contrato de API de Tracking (Lista de SKUs) com Fonte Inicial GraphQL

**Status:** Proposed  
**Data:** 2026-04-14  
**Autores:** Lucas Rocha, Guilherme Maesta Domke de Thomaz  
**RFC relacionada:** N/A (fase inicial)

---

## Contexto

O [[PRD-002-frontend-tracking]] define a tela de listagem de tracking com 13 colunas e um contrato sugerido de leitura para suportar o frontend GO.

Nesta fase, a API precisa:

- receber uma lista de SKUs para consulta em lote **ou** um nome/descricao de produto para busca textual;
- retornar os dados no formato da listagem do PRD;
- usar apenas uma fonte inicial de dados: GraphQL de mercadorias.

O [[PRD-002-frontend-tracking]] (§ 5.2.1) define que a toolbar contera um campo de busca com seletor de modo: o usuario escolhe se quer consultar por **SKU** (N valores numericos) ou por **nome/descricao** (1 valor textual).

A query GraphQL disponível retorna dados de cadastro e categorização, mas nao cobre todas as etapas do tracking (E02, E03, E05, E06, E07, E08, E09).

Fonte: Lucas Rocha, 2026-04-14 (PRD-002).  
Fonte: payload/query GraphQL compartilhado na discussao tecnica, 2026-04-14.

## Decisao

**Decidimos:** implementar um endpoint de agregacao de tracking com cobertura faseada, iniciando por GraphQL de mercadorias.

### 1. Contrato do endpoint (fase 1)

- Endpoint de leitura: `POST /api/v1/tracking/skus/listar`
- O campo `tipoBusca` atua como discriminador: define se a busca sera por SKU ou por nome/descricao.
- Os campos `skus` e `nome` sao mutuamente exclusivos — o backend valida conforme o `tipoBusca` informado.

#### 1.1 Entrada — busca por SKU (N valores)

```json
{
  "tipoBusca": "sku",
  "skus": [55072185, 55052266],
  "pagina": 1,
  "take": 50
}
```

#### 1.2 Entrada — busca por nome/descricao (1 valor)

```json
{
  "tipoBusca": "nome",
  "nome": "MOEDOR DE CAFE",
  "pagina": 1,
  "take": 50
}
```

#### 1.3 Regras de validacao da entrada

| Campo | Tipo | Obrigatorio | Regra |
|---|---|---|---|
| `tipoBusca` | string | Sim | Valores aceitos: `"sku"` ou `"nome"` |
| `skus` | long[] | Condicional | Obrigatorio quando `tipoBusca = "sku"`. Minimo 1, maximo 50 valores. Aceita tanto SKU ON quanto SKU OFF. |
| `nome` | string | Condicional | Obrigatorio quando `tipoBusca = "nome"`. Minimo 3 caracteres. Unico valor (busca textual por `contains`). |
| `pagina` | int | Nao | Default: 1 |
| `take` | int | Nao | Default: 50, maximo: 100 |

- Saida com colunas do PRD para a tabela:

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
        "validacaoFiscal": null,
        "propostaComercial": null,
        "estoque": null,
        "produzidoSite": null,
        "produzidoLf": null,
        "ativacaoPricing": null,
        "exibicaoSite": null
      }
    ],
    "total": 1
  }
}
```

### 2. Estrategia de query GraphQL por tipo de busca

A BFF monta a query GraphQL de forma dinamica conforme o `tipoBusca` recebido.

#### 2.1 Busca por SKU

- Para cada SKU informado, o filtro `where` usa `or` entre `dePara.idSkuLoja` e `dePara.idSkuOn` com operador `eq`.
- O BFF faz **uma chamada por SKU** ao GraphQL e agrega os resultados (o schema atual nao suporta `in` para `Long`).
- A paginacao (`skip`/`take`) e aplicada por chamada individual.

```graphql
where: {
  and: [
    { or: [
      { dePara: { idSkuLoja: { eq: $sku } } }
      { dePara: { idSkuOn: { eq: $sku } } }
    ]}
    { tipoMercadoria: { nome: { neq: "Conjunto" } } }
  ]
}
```

#### 2.2 Busca por nome/descricao

- O filtro `where` usa `nome: { contains: $search }` para busca textual parcial (case-insensitive no GraphQL HotChocolate).
- Uma unica chamada ao GraphQL — a paginacao e aplicada diretamente.
- O campo `$search` ja existe como variavel no schema GraphQL de mercadorias (confirmado via `test-graphql.js`).

```graphql
where: {
  and: [
    { nome: { contains: $search } }
    { tipoMercadoria: { nome: { neq: "Conjunto" } } }
  ]
}
```

### 3. Regra de preenchimento fase 1 (somente GraphQL)

| Coluna PRD | Origem GraphQL | Regra fase 1 |
|---|---|---|
| `id` | `items.id` | map direto |
| `skuOff` | `items.dePara.idSkuLoja` | map direto |
| `skuOn` | `items.dePara.idSkuOn` | map direto |
| `mercadoria` | `items.nome` | map direto |
| `tipoNegociacao` | `items.tipoMercadoria.nome` | uppercase na API |
| `cadastro` (E01) | existencia do item + `situacaoCadastral.tipoSituacaoCadastral.nome` | `true` quando item encontrado |
| `validacaoFiscal` (E02) | nao disponivel no GraphQL atual | `null` |
| `propostaComercial` (E03) | nao disponivel no GraphQL atual | `null` |
| `estoque` (E05) | nao disponivel no GraphQL atual | `null` |
| `produzidoSite` (E06) | nao disponivel no GraphQL atual | `null` |
| `produzidoLf` (E07) | nao disponivel no GraphQL atual | `null` |
| `ativacaoPricing` (E08) | nao disponivel no GraphQL atual | `null` |
| `exibicaoSite` (E09) | nao disponivel no GraphQL atual | `null` |

Observacao: nesta ADR, os campos de etapa sem fonte nao serao inferidos como `false`, para evitar falso bloqueio no frontend. O preenchimento definitivo dessas etapas sera definido na proxima ADR de composicao de services.

### 4. Escopo explicito desta ADR

Inclui:
- uso da fonte GraphQL como base de listagem;
- definicao do contrato de entrada/saida da API na fase 1 com suporte a busca por SKU e por nome;
- mapeamento de cobertura parcial para colunas do PRD;
- estrategia de query GraphQL por tipo de busca (`tipoBusca`).

Nao inclui:
- composicao com novas services por etapa do tracking;
- regras finais de consolidacao para E02-E09;
- contrato final da tela de detalhe do SKU.

## Simplificacao da query GraphQL (o que nao usar nesta fase)

Para o objetivo da fase 1 (listagem), os itens abaixo nao sao necessarios e podem ser removidos da query para reduzir payload e complexidade.

### Variaveis/filtros nao utilizados

| Item atual | Situacao |
|---|---|
| `search` | **agora utilizado** na busca por nome (`tipoBusca = "nome"`) — ver § 2.2 |
| `operation` | nao utilizado |
| filtro por `dePara.idKitLoja` | nao utilizado na listagem 1P inicial |

### Campos de response nao utilizados na fase 1

| Campo GraphQL | Motivo |
|---|---|
| `pageInfo.hasNextPage` | nao utilizado no contrato de retorno atual |
| `pageInfo.hasPreviousPage` | nao utilizado no contrato de retorno atual |
| `tipoMercadoria.id` | somente `nome` e necessario |
| `situacaoCompra.id` | nao mapeado para coluna do PRD na fase 1 |
| `situacaoCompra.nome` | nao mapeado para coluna do PRD na fase 1 |
| `situacaoCompra.ativo` | nao mapeado para coluna do PRD na fase 1 |
| `estruturaGerencial.categoria.id` | nao necessario para o payload minimo da tabela |
| `situacaoCadastral.flagCompraSuspensa` | nao usado na fase 1 |
| `situacaoCadastral.flagCompraProibida` | nao usado na fase 1 |
| `preVenda.data` | nao usado na fase 1 |

### Query enxuta recomendada — busca por SKU (fase 1)

```graphql
query GetMercadoriasPorSku($skip: Int!, $take: Int!, $sku: Long) {
  mercadorias(
    skip: $skip
    take: $take
    order: { id: ASC }
    where: {
      and: [
        {
          or: [
            { dePara: { idSkuLoja: { eq: $sku } } }
            { dePara: { idSkuOn: { eq: $sku } } }
          ]
        }
        { tipoMercadoria: { nome: { neq: "Conjunto" } } }
      ]
    }
  ) {
    items {
      id
      nome
      dePara { idSkuLoja idSkuOn }
      tipoMercadoria { nome }
      situacaoCadastral { tipoSituacaoCadastral { nome } }
      estruturaGerencial { categoria { nome } }
    }
  }
}
```

### Query enxuta recomendada — busca por nome (fase 1)

```graphql
query GetMercadoriasPorNome($skip: Int!, $take: Int!, $search: String!) {
  mercadorias(
    skip: $skip
    take: $take
    order: { id: ASC }
    where: {
      and: [
        { nome: { contains: $search } }
        { tipoMercadoria: { nome: { neq: "Conjunto" } } }
      ]
    }
  ) {
    items {
      id
      nome
      dePara { idSkuLoja idSkuOn }
      tipoMercadoria { nome }
      situacaoCadastral { tipoSituacaoCadastral { nome } }
      estruturaGerencial { categoria { nome } }
    }
  }
}
```

## Consequencias

### Positivas

- Entrega rapida da API de listagem com base no PRD-002.
- Menor risco tecnico na fase inicial por depender de uma fonte unica.
- Query GraphQL reduzida melhora custo de rede e manutencao.

### Negativas / Trade-offs

- Cobertura parcial do pipeline na fase 1 (E02-E09 sem valor definitivo).
- Frontend precisa tratar estados `null` para etapas ainda nao integradas.

### Neutras

- O endpoint ja nasce pronto para evolucao por composicao de services sem quebrar rota.

## Alternativas Rejeitadas

| Alternativa | Motivo de rejeicao |
|---|---|
| Retornar `false` para todas as etapas sem fonte | gera falso negativo e percepcao incorreta de bloqueio |
| Aguardar todas as fontes (E02-E09) antes de publicar endpoint | aumenta lead time e bloqueia validacao de UX da listagem |
| Expor diretamente o payload bruto GraphQL ao frontend | acopla frontend ao schema da fonte e quebra contrato do PRD |
| Dois endpoints separados (um por SKU, outro por nome) | aumenta superficie de API sem necessidade; o discriminador `tipoBusca` resolve com uma unica rota |
| Campo unico `busca` com deteccao automatica (numerico = SKU, texto = nome) | ambiguo e fragil; o seletor explicito no frontend elimina heuristicas |

## Perguntas em aberto

| # | Pergunta | Responsavel | Status |
|---|---|---|---|
| 1 | O contrato publico da API mantera `null` temporario para etapas ou adotara campo auxiliar de cobertura? | Lucas Rocha / Guilherme Thomaz | 🟡 A confirmar |
| 2 | Quais services complementares entrarao primeiro para cobrir E02-E09? | Squad TCD | 🔴 Nao mapeado |
| 3 | ~~A busca em lote aceitara somente SKU ON ou tambem SKU OFF na mesma entrada?~~ | Lucas Rocha | ✅ Resolvido — aceita ambos (SKU ON e SKU OFF). O filtro GraphQL usa `or` entre `dePara.idSkuLoja` e `dePara.idSkuOn`. |
| 4 | O filtro `nome: { contains }` do GraphQL HotChocolate e case-insensitive por default? Confirmar com o time do Hub Catalogo. | Squad TCD | 🟡 A confirmar |
| 5 | Limite minimo de caracteres para busca por nome (proposto: 3). Confirmar com UX. | Lucas Rocha | 🟡 A confirmar |

## Referencias

- [[PRD-002-frontend-tracking]]
- [[PRD-001-tracking-sku-lifecycle]]
- [[sku-lifecycle]]
- [Figma IC-Table](https://www.figma.com/design/QNFpM0akFGXYC2gfcjkHba/Tracking?node-id=122-5896)
