---
tags: [tracking, pipeline, etapa, estoque, manhattan, wms, inventario, sql]
etapa: 5
titulo: Estoque
status: regras-mapeadas
origem: Banco Inventario (SQL)
escopo: 1P apenas
updated: 2026-04-09
fonte: Juliana Dos Santos; Query SQL — reunião 09/04/2026
---

# E05 — Estoque

> Etapa que verifica a existência de estoque para o SKU. Regras mapeadas via banco de inventário (SQL). Método de integração (API vs. acesso direto ao banco) ainda a definir.

## Visão Geral

| Atributo | Valor |
|----------|-------|
| Etapa | 5 de 9 |
| Sistema de Origem | **Banco Inventario (SQL)** — acesso via query relacional |
| Status do Mapeamento | **Regras mapeadas — método de integração a definir** |
| Etapa anterior | [[E04-agendamento]] |
| Próxima etapa | [[E06-produzido]] |

> 🟡 Regras de negócio confirmadas. Integração técnica (API / banco / evento) ainda pendente. Ver [[RFC-003-estoque]] quando criada.

---

## Como Obter os Dados

| Método | Detalhe |
|--------|---------|
| Sistema | **Banco Inventario** (schema `Inventario`) |
| Interface | ⚠️ A definir — acesso direto ao banco ou API intermediária? |
| Chave de busca | `Modalidade.IdSkuOrigem` (ID do SKU) |
| Frequência de atualização | Por evento (movimentação de estoque) ou batch |
| Linked Server | `[CORP_PRD.dc.nova,1310]` — tabela `Filial` corporativa |

> ℹ️ As tabelas ficam no schema `Inventario`. Ver detalhamento completo das tabelas e relacionamentos em [[regras-estoque-inventario]].

> ℹ️ **Fonte: Juliana Dos Santos (2026-04-09)** — sistema confirmado como Manhattan WMS. **Query SQL (09/04/2026)** — confirma tabelas relacionais do schema `Inventario` como fonte de dados consultável.

---

## Campos / Schema

### Campos Confirmados (via SQL)

| Campo SQL | Tabela | Descrição | Status |
|-----------|--------|-----------|--------|
| `QuantidadeDisponivel` | `SaldoEstoqueRestricao` | **Volume disponível** — regra principal (`> 0`) | ✅ Confirmado |
| `QuantidadeReservada` | `SaldoEstoqueRestricao` | Estoque reservado para pedidos em aberto | ✅ Confirmado |
| `QuantidadeTotal` | `SaldoEstoqueRestricao` | Total = Disponível + Reservado | ✅ Confirmado |
| `er.Tipo` | `EstoqueRestricao` | Tipo de restrição (ex: `'BT'` — significado a confirmar) | ✅ Confirmado |
| `te.Tipo` / `te.Nome` | `TipoEstoque` | Código e descrição do tipo de estoque | ✅ Confirmado |
| `ste.PrazoDias` | `SaldoTipoEstoque` | Prazo em dias do tipo de estoque | ✅ Confirmado |
| `m.DataPrevisaoChegada` | `Modalidade` | Data prevista de chegada (estoque em trânsito) | ✅ Confirmado |
| `f.Ativa` | `Filial` | Filial precisa estar ativa | ✅ Confirmado |
| `f.RetiraEmLoja` | `Filial` | Habilita modalidade retirada em loja | ✅ Confirmado |
| `f.CentroDistribuicao` | `Filial` | Indica se a filial é um CD | ✅ Confirmado |
| `f.GerarReserva` | `Filial` | Filial gera reserva de estoque | ✅ Confirmado |
| `f.SeguirComReserva` | `Filial` | Filial mantém reserva no fluxo | ✅ Confirmado |
| `FCORP.EntregaNacional` | `FCORP (linked server)` | Habilita entrega nacional | ✅ Confirmado |
| `c.IdCompanhiaOrigem` | `Companhia` | Escopo por bandeira (CB / EX / PF) | ✅ Confirmado |

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
- SKU sem nenhum saldo disponível **não avança** para [[E06-produzido]]
  - Exceção: `Digital/Download` — não exige estoque físico
  - Exceção: `Pre-lancamento` — pode ser configurado para exibir sem estoque
- O filtro do painel aplica `Com Estoque = Sim` como critério obrigatório de elegibilidade

---

## Gaps / Perguntas em Aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | Qual o método de integração? API ou acesso direto ao banco `Inventario`? | Time Plataforma | 🔴 Crítico |
| 2 | O que significa `er.Tipo = 'BT'`? Backorder Transfer? Quais outros tipos existem? | Time Abastecimento | Aberto |
| 3 | Quais são os valores de `TipoEstoque.Tipo` para físico, fingido e crossdocking? | Time GO | Aberto |
| 4 | O linked server CORP_PRD estará disponível para integração? Ou precisa de outra rota? | Time Infra | Aberto |
| 5 | `DataPrevisaoChegada` vem da Modalidade — é sincronizado com o agendamento do LN/Neogrid? | Time Integração | Aberto |
| 6 | Como o OMS é consultado para ver estoque regional? Existe API ou é banco? | Time OMS / Plataforma | Aberto |
| 7 | Quando o saldo nacional = 0 mas OMS mostra estoque regional, o tracking deve sinalizar isso separadamente? | Produto / GO | Aberto |

---

## Próximos Passos

- [ ] Confirmar método de integração com o banco `Inventario` (API vs. acesso direto) com time de Plataforma
- [ ] Mapear valores de `TipoEstoque.Tipo` (físico, fingido, crossdocking)
- [ ] Confirmar significado de `er.Tipo = 'BT'` com time de Abastecimento
- [ ] Criar RFC-003 para propor estratégia de integração
- [x] Regras de negócio documentadas via query SQL — reunião 09/04/2026

---

## Referências

- [[sku-lifecycle]] — Pipeline completo
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [[regras-estoque-inventario]] — Glossário completo de tabelas e campos SQL
- [[E04-agendamento]] — Etapa anterior
- [[E06-produzido]] — Próxima etapa
