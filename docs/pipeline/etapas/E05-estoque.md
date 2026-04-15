---
tags: [tracking, pipeline, etapa, estoque, manhattan, wms, inventario, sql, api-oferta]
etapa: 5
titulo: Estoque
status: integrado
origem: API Oferta — GET /v1/Preco/Sku/PrecoVenda (campo PrecoVenda.DisponibilidadeEstoque)
escopo: 1P apenas
updated: 2026-04-15
fonte: Juliana Dos Santos; Query SQL — reunião 09/04/2026
---

# E05 — Estoque

> Etapa que verifica a existência de estoque para o SKU. **Integração definida:** campo `DisponibilidadeEstoque` dentro de `PrecoSkus[*].PrecoVenda` da **API Oferta** — `GET /v1/Preco/Sku/PrecoVenda?IdsSku={idSku}`. Regras internas escritas no Banco Inventario (Manhattan WMS).

## Visão Geral

| Atributo | Valor |
|----------|-------|
| Etapa | 5 de 9 |
| Sistema de Escrita | **Banco Inventario (SQL)** — Manhattan WMS |
| Sistema de Leitura | **API Oferta** — `GET /v1/Preco/Sku/PrecoVenda` |
| Campo de integração | `PrecoSkus[*].PrecoVenda.DisponibilidadeEstoque` — `true` = com estoque |
| Status do Mapeamento | ✅ Integrado — endpoint e campo confirmados |
| Etapa anterior | [[E04-agendamento]] |
| Próxima etapa | [[E06-produzido]] |

> ✅ Integração definida via **API Oferta**, campo `DisponibilidadeEstoque` — 2026-04-15. Regras internas do banco Inventario documentadas em [[regras-estoque-inventario]].

---

## Como Obter os Dados

| Método | Detalhe |
|--------|---------|
| Endpoint | `GET /v1/Preco/Sku/PrecoVenda?IdsSku={idSku}` |
| Base URL (CB hlg) | `https://api-oferta-casasbahia-hlg.viavarejo.com.br` |
| Header | `accept: text/plain` |
| Campo de decisão | `PrecoSkus[*].PrecoVenda.DisponibilidadeEstoque` — `true` = tem estoque |
| Chave de rastreamento | `idSku` (query param) |
| Frequência de atualização | Por evento (movimentação de estoque) ou batch no Inventario |

```bash
curl -X 'GET' \
  'https://api-oferta-casasbahia-hlg.viavarejo.com.br/v1/Preco/Sku/PrecoVenda?IdsSku={idSku}' \
  -H 'accept: text/plain'
```

> ℹ️ A leitura da disponibilidade de estoque é feita via API Oferta (campo `DisponibilidadeEstoque`). O sistema interno que escreve esse dado é o **Manhattan WMS** via **Banco Inventario**. Detalhamento das tabelas SQL em [[regras-estoque-inventario]].

---

## Campos / Schema

### Campo de Integração — API Oferta

| Caminho no JSON | Tipo | Valor esperado | Descrição | Status |
|----------------|------|---------------|-----------|--------|
| `PrecoSkus[*].PrecoVenda.DisponibilidadeEstoque` | boolean | `true` | Indica disponibilidade de estoque para o SKU | ✅ Confirmado |

#### Exemplo de Resposta

```json
{
  "PrecoSkus": [
    {
      "PrecoVenda": {
        "IdSku": 4132,
        "DisponibilidadeVenda": true,
        "DisponibilidadeEstoque": true,
        ...
      }
    }
  ],
  "Valido": true,
  "Mensagens": [],
  "Protocolo": "947b6f26-f62f-48e7-a0e3-263b0774fffa"
}
```

> ℹ️ `DisponibilidadeEstoque` fica dentro de `PrecoSkus[*].PrecoVenda` — **não** na raiz da resposta (o campo raiz `Valido` é usado pelo step E08).

### Background — Campos SQL (Sistema de Escrita Interno)

> O que o Banco Inventario armazena internamente. A API Oferta agrega essas regras no campo `DisponibilidadeEstoque`.

| Campo SQL | Tabela | Descrição | Status |
|-----------|--------|-----------|--------|
| `QuantidadeDisponivel` | `SaldoEstoqueRestricao` | **Volume disponível** — regra principal (`> 0`) | ✅ Confirmado |
| `QuantidadeReservada` | `SaldoEstoqueRestricao` | Estoque reservado para pedidos em aberto | ✅ Confirmado |
| `m.DataPrevisaoChegada` | `Modalidade` | Data prevista de chegada (estoque em trânsito) | ✅ Confirmado |
| `f.Ativa` | `Filial` | Filial precisa estar ativa | ✅ Confirmado |
| `c.IdCompanhiaOrigem` | `Companhia` | Escopo por bandeira (CB / EX / PF) | ✅ Confirmado |

> Ver detalhamento completo em [[regras-estoque-inventario]].

### Campos de Domínio (mapeamento conceitual)

| Campo Conceitual | Descrição | Status |
|-----------------|-----------|--------|
| `tem_estoque_fisico` | Estoque real disponível em CD ou loja | 🟡 Tipo a confirmar via `TipoEstoque` |
| `tem_estoque_fingido` | Estoque virtual/fictício para produtos especiais | 🟡 Tipo a confirmar via `TipoEstoque` |
| `tem_crossdocking` | Estoque via crossdocking com fornecedor | 🟡 Tipo a confirmar via `TipoEstoque` |
| `pre_lancamento` | Produto em pré-lançamento | 🟡 Tipo a confirmar via `TipoEstoque` |

### Tipos de Estoque

| Tipo | Descrição | Tracking | Status |
|------|-----------|----------|--------|
| **Físico** | Estoque real em CD ou loja | Sim/Não | 🟡 Valor do `TipoEstoque` a mapear |
| **Fingido** | Estoque virtual para garantir disponibilidade | Sim/Não | 🟡 Valor do `TipoEstoque` a mapear |
| **Crossdocking** | Vem direto do fornecedor, sem passar pelo CD | Sim/Não | 🟡 Valor do `TipoEstoque` a mapear |
| **Em Trânsito** | Agendado / em chegada — `DataPrevisaoChegada` | Data prevista | ✅ Confirmado via `Modalidade` |
| **Pré-Lançamento** | Produto anunciado antes de ter estoque | Especial | 🟡 Valor do `TipoEstoque` a mapear |
| **Digital/Download** | Sem estoque físico | N/A | ℹ️ Não se aplica — sem estoque físico |

> ⚠️ Os valores específicos do campo `TipoEstoque.Tipo` para cada categoria (físico, fingido, crossdocking) ainda precisam ser mapeados.

---

## Para Que Esses Dados São Usados

- **Filtro de elegibilidade principal** do painel: `Com Estoque = Sim` é obrigatório para exibição
- **Classificar o tipo de disponibilidade** — físico x fingido x crossdocking impactam SLA de entrega
- **Identificar SKUs travados por falta de estoque** — bloqueio antes da exibição
- **Lead-time**: medir quantos SKUs passam dias sem estoque após agendamento ([[E04-agendamento]])
- Dado relevante para [[E09-exibicao-site-loja]] — sem estoque, não exibe para compra

---

## Regras de Negócio

- **Regra principal:** `SaldoEstoqueRestricao.QuantidadeDisponivel > 0` → SKU tem estoque
- A filial precisa estar **ativa** (`Filial.Ativa = true`) para seu saldo ser considerado
- Estoque é filtrado por **companhia** (`Companhia.IdCompanhiaOrigem`) — escopo por bandeira (CB / EX / PF)
- `DataPrevisaoChegada` permite identificar estoque **em trânsito** — relevante para [[E04-agendamento]]
- `GerarReserva` e `SeguirComReserva` controlam o comportamento de reserva por filial
- `QuantidadeTotal = QuantidadeDisponivel + QuantidadeReservada`
- `PrazoDias` no tipo de estoque define o prazo de entrega associado ao saldo
- SKU sem nenhum saldo disponível → tracking mostra estado "sem estoque" neste step
  - Exceção: `Digital/Download` — não exige estoque físico
  - Exceção: `Pre-lancamento` — pode ser configurado para exibir sem estoque
- O filtro do painel aplica `Com Estoque = Sim` como critério obrigatório de elegibilidade

---

## Gaps / Perguntas em Aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | Quais são os base URLs da API Oferta para EX e PF (hlg e prd)? | Time Oferta | 🟡 CB confirmado — EX/PF a confirmar |
| 2 | O que significa `er.Tipo = 'BT'`? Backorder Transfer? Quais outros tipos existem? | Time Abastecimento | Aberto |
| 3 | Quais são os valores de `TipoEstoque.Tipo` para físico, fingido e crossdocking? | Time GO | Aberto |
| 4 | O linked server CORP_PRD estará disponível para integração? (contexto SQL — opcional para V2) | Time Infra | Aberto |
| 5 | Quando `DisponibilidadeEstoque = false` na API mas há saldo no Inventario SQL, qual o motivo típico? | Time Oferta | Aberto |

---

## Próximos Passos

- [ ] Confirmar base URLs da API Oferta para EX e PF
- [ ] Mapear valores de `TipoEstoque.Tipo` (físico, fingido, crossdocking) — para enriquecimento V2
- [x] **Interface de leitura definida** — API Oferta, campo `DisponibilidadeEstoque` — 2026-04-15
- [x] Regras de negócio documentadas via query SQL — reunião 09/04/2026

---

## Referências

- [[sku-lifecycle]] — Pipeline completo
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [[regras-estoque-inventario]] — Glossário completo de tabelas e campos SQL
- [[E04-agendamento]] — Etapa anterior
- [[E06-produzido]] — Próxima etapa
