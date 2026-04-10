---
tags: [conceito, estoque, inventario, sql, saldo, filial, companhia, modalidade, oms, regional]
tipo: conceito
status: confirmado
updated: 2026-04-09
fonte: Query SQL; Ricardo Tadeu Lima — reunião 09/04/2026
---

# Conceito — Regras de Estoque via Banco de Inventário

> Regras e estrutura de dados para determinar se um SKU tem estoque disponível.
> Extraídas da query SQL e da transcrição de Ricardo Tadeu Lima em reunião com Douglas Souza Wolff e Pedro Albani Martins em 09/04/2026.

---

## Regra Principal

```sql
ser.QuantidadeDisponivel > 0
```

Um SKU tem estoque quando a quantidade disponível na tabela `Inventario.SaldoEstoqueRestricao` é maior que zero.

---

## Estrutura de Tabelas (Schema Inventario)

### Tabelas Envolvidas

| Tabela | Alias | Papel |
|--------|-------|-------|
| `Inventario.SaldoEstoqueRestricao` | `ser` | **Tabela principal** — saldo por restrição |
| `Inventario.EstoqueRestricao` | `er` | Tipo de restrição de estoque |
| `Inventario.SaldoTipoEstoque` | `ste` | Saldo por tipo de estoque + prazo |
| `Inventario.TipoEstoque` | `te` | Define o tipo de estoque (nome, código) |
| `Inventario.SaldoSkuFilial` | `sf` | Saldo de SKU por filial |
| `Inventario.Modalidade` | `m` | Modalidade do SKU — inclui data de chegada prevista |
| `Inventario.SaldoSkuCompanhia` | `sc` | Saldo de SKU por companhia |
| `Inventario.Filial` | `f` | Dados da filial (CNPJ, tipo, flags operacionais) |
| `Inventario.Companhia` | `c` | Companhia de origem (CB / EX / PF) |
| `Inventario.TipoFilial` | `tf` | Nome do tipo de filial |
| `[CORP_PRD].[dbo].[Filial]` | `FCORP` | Filial corporativa — servidor vinculado (linked server) |

### Relacionamentos Principais

```
SaldoEstoqueRestricao (ser)
    ├── JOIN EstoqueRestricao (er)        via IdRestricao
    ├── LEFT JOIN SaldoTipoEstoque (ste)  via IdSaldoTipoEstoque
    │       └── JOIN TipoEstoque (te)    via IdTipoEstoque
    │       └── LEFT JOIN SaldoSkuFilial (sf)  via IdSaldoSkuFilial
    │               └── JOIN Modalidade (m)    via IdSku = IdModalidadeSku
    │               └── LEFT JOIN SaldoSkuCompanhia (sc)  via IdSaldoSkuFilial
    │               └── LEFT JOIN Filial (f)              via IdFilial
    │                       └── JOIN TipoFilial (tf)      via IdTipoFilial
    │                       └── JOIN FCORP                via CNPJ
    └── LEFT JOIN Companhia (c)           via CodigoCompanhia OU f.IdCompanhia
```

---

## Campos Relevantes

### Saldo (SaldoEstoqueRestricao)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `QuantidadeDisponivel` | integer | **Volume disponível** — regra principal (`> 0`) |
| `QuantidadeReservada` | integer | Estoque já reservado para pedidos |
| `QuantidadeTotal` | integer | Total = Disponível + Reservado |
| `IdSaldoEstoqueRestricao` | PK | Identificador do registro |

### Restrição de Estoque (EstoqueRestricao)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `Tipo` | string | Código do tipo de restrição (ex: `'BT'`) |

> ⚠️ **`er.Tipo = 'BT'`** — aparece comentado na query como filtro optional. Significado de `BT` **a confirmar** (hipótese: Backorder Transfer). Outros tipos de restrição existem — mapeamento completo pendente.

### Tipo de Estoque (TipoEstoque / SaldoTipoEstoque)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `te.Tipo` | string | Código do tipo de estoque |
| `te.Nome` | string | Descrição do tipo |
| `ste.PrazoDias` | integer | Prazo em dias associado ao tipo de estoque |

### Modalidade (previsão de chegada)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `m.DataPrevisaoChegada` | datetime | Data prevista de chegada do estoque em trânsito |
| `m.IdSkuOrigem` | FK | **Chave de busca por SKU** — filtro principal da query |

> `DataPrevisaoChegada` é relevante para **estoque futuro**: SKU agendado/em trânsito que ainda não está fisicamente no CD mas tem previsão.

### Filial

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `f.IdFilial` | PK | Identificador da filial |
| `f.IdFilialOrigem` | FK | Filial de origem (para transferências) |
| `f.CNPJ` | string | CNPJ da filial (chave de ligação com FCORP) |
| `f.Ativa` | boolean | **Filial precisa estar ativa** |
| `f.RetiraEmLoja` | boolean | Permite modalidade de retirada em loja |
| `f.CentroDistribuicao` | boolean | Indica se a filial é um CD |
| `f.GerarReserva` | boolean | Filial gera reserva de estoque |
| `f.SeguirComReserva` | boolean | Filial mantém reserva no fluxo |
| `tf.Nome` | string | Nome do tipo da filial |

### Filial Corporativa — FCORP (linked server)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `FCORP.EntregaNacional` | boolean | Habilita entrega nacional a partir desta filial |
| `FCORP.CNPJ` | string | Chave de join com `f.CNPJ` |

### Companhia (escopo por bandeira)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `c.IdCompanhiaOrigem` | integer | Identifica a companhia: CB, EX ou PF |

---

## Filtros da Query de Referência

```sql
WHERE m.IdSkuOrigem IN (55066186)          -- Filtro por SKU (obrigatório)
  -- AND f.CNPJ IN ('33041260119560')      -- Filtro por filial específica (opcional)
  -- AND er.Tipo = 'BT'                    -- Filtro por tipo de restrição (opcional)
  AND ser.QuantidadeDisponivel > 0          -- Regra principal de estoque (obrigatório)
ORDER BY f.IdFilial
```

---

## Regras de Negócio

- **`QuantidadeDisponivel > 0`** é a condição primária — saldo menor ou igual a zero = sem estoque para o tracking
- A filial deve estar **ativa** (`f.Ativa = true`) para seu estoque ser considerado
- Estoque é filtrado por **companhia** (`c.IdCompanhiaOrigem`) — permite escopo por bandeira (CB / EX / PF)
- `DataPrevisaoChegada` permite identificar estoque **em trânsito** (futuro) — relevante para [[E04-agendamento]]
- `GerarReserva` e `SeguirComReserva` controlam comportamento de reserva por filial — impacta `QuantidadeReservada`
- O quantidade total (`QtdeTotal`) = disponível + reservado — importante para dimensionar a demanda
- `PrazoDias` no tipo de estoque define o prazo de entrega associado àquele saldo

---

## OMS e Estoque Regional vs. Nacional

> Fonte: Ricardo Tadeu Lima, 09/04/2026

O **OMS** (Order Management System) é outro sistema que contém informações de estoque, com uma visão diferente do banco `Inventario`:

| Aspecto | Banco Inventario (SQL) | OMS |
|---------|----------------------|-----|
| Escopo padrão | Estoque nacional | Estoque total (inclui regional) |
| Venda regional | Pode não aparecer como disponível | Mostra o estoque real |
| Uso no tracking | Query de referência confirmada | A integrar — método a definir |

### Cenário de Divergência

```
Banco Inventario: QuantidadeDisponivel = 0  (estoque nacional = zero)
OMS:              estoque = N unidades       (configurado para venda regional)

Motivo: o SKU está configurado para venda só em determinadas regiões
Resultado: a API de Oferta retorna "indisponível" se a região não for especificada
```

> ⚠️ **Não é bug.** É configuração de venda regional. A API Oferta requer o parâmetro de região para retornar corretamente. Ver [[E08-ativacao-pricing]].

> ⚠️ O mapeamento do OMS como fonte de estoque para o tracking ainda está **em aberto** — Ricardo demonstrou a divergência mas o método de integração não foi definido.

---

## O que Esta Query NÃO Responde

| Lacuna | Observação |
|--------|------------|
| Tipo de estoque consolidado | A query lista por tipo — não consolida em "tem estoque = S/N" |
| Estoque físico vs fingido | `TipoEstoque` diferencia, mas mapeamento dos valores a confirmar |
| Estoque de crossdocking | A verificar se é um `TipoEstoque` específico |
| **Estoque regional** | A query filtra por filial/companhia mas não exibe explicitamente as regiões de venda configuradas |
| API de acesso | A query acessa banco diretamente — API unificada não confirmada |

---

## Impacto no Pipeline

Esta lógica é a base da [[E05-estoque|Etapa 5 — Estoque]]:
- `QuantidadeDisponivel > 0` = "tem estoque" para fins do tracking
- Estoque é pré-requisito para avançar para [[E06-produzido]]

---

## Referências

- [[sku-lifecycle]] — Pipeline completo
- [[E05-estoque]] — Etapa que usa estas regras
- [[E04-agendamento]] — Etapa anterior (Modalidade / DataPrevisaoChegada)
- [[validacao-sincronizacao-sql-mongo]] — Detecção de divergência SQL ↔ MONGOS (V2)
