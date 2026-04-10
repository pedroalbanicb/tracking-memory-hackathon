---
tags: [tracking, pipeline, etapa, exibicao, sql-corp, site, loja-fisica, flags, rundeck, mongos, mongodb, marca, categoria]
etapa: 9
titulo: Exibição — Site / Loja Física
status: flags-expandidas
origem: SQL Corp (banco corporativo) / SkuLojista / SKU / Produto / Marca / Categoria / MONGOS
escopo: 1P apenas
updated: 2026-04-10
fonte: Juliana Dos Santos; Ricardo Tadeu Lima; Douglas Souza Wolff — reunião 09/04/2026
---

# E09 — Exibição — Site / Loja Física

> Step final do pipeline. O tracking verifica se o SKU está **disponível para compra** consultando as flags de ativação no SQL Corp e sua replicação no MongoDB. Cada step é uma consulta de estado independente — este step não depende dos anteriores para ser verificado. Regras mapeadas por Ricardo Tadeu Lima em 09/04/2026.

## Visão Geral

| Atributo             | Valor                                                         |
| -------------------- | ------------------------------------------------------------- |
| Etapa                | 9 de 9                                                        |
| Sistema de Origem    | **SkuLojista / SKU / Produto (SQL Corp) → MONGOS (MongoDB de Pricing)** |
| Status do Mapeamento | **Regras mapeadas — método de integração a definir**          |
| Etapa anterior       | [[E08-ativacao-pricing]]                                      |
| Próxima etapa        | ✅ SKU ATIVO — fim do pipeline                                 |

> ℹ️ **Fonte: Juliana Dos Santos (2026-04-09)** — sistema confirmado: Corp (SQL Server corporativo — banco compartilhado). **Ricardo Tadeu Lima (09/04/2026)** — flags, fluxo de propagação e dependência do MongoDB (MONGOS) mapeados. **Pedro Martins (10/04/2026)** — "Corp" confirmado como SQL Server corporativo, não API nem time.

---

## Regra Principal — Flags Simultâneas para Exibição no Site

> Fonte: Ricardo Tadeu Lima, 09/04/2026 (flags base) + Douglas Souza Wolff, 09/04/2026 (expansão Marca/Categoria/Sku)

Para que um SKU apareça no site, **todas as flags abaixo precisam ser verdadeiras** e estar replicadas no MongoDB (MONGOS):

### Grupo 1 — Pricing (SkuLojista)

| Tabela            | Flag        | Valor | Descrição                            | Status       |
| ----------------- | ----------- | ----- | ------------------------------------ | ------------ |
| `SkuLojista`      | `FlagAtiva` | `= 1` | Ativação do lojista para o canal     | ✅ Confirmado |
| `SkuLojistaPreço` | `FlagAtiva` | `= 1` | Ativação do preço de venda por canal | ✅ Confirmado |

### Grupo 2 — SKU

| Tabela | Flag                         | Valor | Descrição                                                | Status                                                                                              |
| ------ | ---------------------------- | ----- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `Sku`  | `FlagAtiva`                  | `= 1` | Visibilidade do SKU (propagada pelo Rundeck)             | ✅ Confirmado                                                                                        |
| `Sku`  | `FlagAtivaERP`               | `= 1` | Flag de ativação no ERP — necessária para reconhecimento | ✅ Confirmado                                                                                  |
| `Sku`  | `FlagSkuProduzido`           | `= 1` | Conteúdo do SKU produzido (fotos, descrição)             | ✅ Confirmado                                                                                  |
| `Sku`  | `FlagSkuSaldoDisponivel`     | `= 1` | Saldo disponível no inventário                           | ✅ Confirmado — ⚠️ tabela a confirmar: Douglas Souza Wolff atribui ao `Sku`, query SQL sugere `SkuLojista` |
| `Sku`  | `FlagSkuProduzidoLojaFisica` | `= 1` | Conteúdo produzido para loja física                      | ⚠️ **Legada/comentada** — ver nota abaixo                                                           |

> 🗒️ **`FlagSkuProduzidoLojaFisica` — Flag Legada:** aparece **comentada** na query SQL (`-- s.FlagSkuProduzidoLojaFisica = 1`). Ricardo Tadeu Lima (09/04/2026): *"Hoje em dia acho que não é validado mais. Mas tem que estar como um, senão não reconhece."* — Flag não filtrada ativamente, mas o valor deve ser `= 1` para o sistema reconhecer o SKU.

### Grupo 3 — Produto

| Tabela | Flag | Valor | Descrição | Status |
|--------|------|-------|-----------|--------|
| `Produto` | `FlagAtiva` | `= 1` | Visibilidade do Produto pai (propagada ~1min após Sku pelo Rundeck) | ✅ Confirmado |
| `Produto` | `FlagExibe` | `= 1` | Exibição no site — **flag atualizada automaticamente via pulso de estoque** | ✅ Confirmado |

### Grupo 4 — Marca

| Tabela | Flag | Valor | Descrição | Status |
|--------|------|-------|-----------|--------|
| `Marca` | `FlagAtiva` | `= 1` | Marca do produto ativa | ✅ Confirmado — ⚠️ tabela a confirmar com Douglas Souza Wolff |

### Grupo 5 — Categoria (Hierarquia completa)

> Douglas Souza Wolff (09/04/2026): `Categoria [FlagAtiva (Categoria, CategoriaPai, Departamento)]`

| Tabela      | Flag        | Valor | Nível                                  | Status                                     |
| ----------- | ----------- | ----- | -------------------------------------- | ------------------------------------------ |
| `Categoria` | `FlagAtiva` | `= 1` | Categoria direta do produto            | ✅ Confirmado                               |
| `Categoria` | `FlagAtiva` | `= 1` | CategoriaPai                           | ✅ Confirmado                               |
| `Categoria` | `FlagAtiva` | `= 1` | CategoriaNeto (ou nível intermediário) | ✅ Confirmado — ⚠️ nomenclatura a confirmar |
| `Categoria` | `FlagAtiva` | `= 1` | Departamento                           | ✅ Confirmado                               |

> ⚠️ **Se qualquer uma das flags acima (em qualquer grupo) estiver inativa ou não replicada no MongoDB (MONGOS), o SKU não aparecerá no site.**

## Fluxo de Propagação (Job Rundeck)

```
SkuLojista.ativa = true (ou SkuLojistaPreço.ativa = true)
    │
    ▼
Job **Rundeck** executa  _(sistema de automação de jobs)_
    │
    ├──▶ SKU.ativa = true
    │    SKU.stock = atualizado
    │
    └── (~1 minuto depois)
         ▶ Produto.ativa = true

Paralelo — pulso de estoque:
    Movimentação de estoque → flag ativa propagada → MONGOS atualizado automaticamente
```

Ver fluxo completo em [[regras-exibicao-sku]].

## Como Obter os Dados

| Método | Detalhe |
|--------|---------|
| Tabelas SQL | `SkuLojista`, `SkuLojistaPreço`, `Sku`, `Produto`, `Marca`, `Categoria` (4 níveis) |
| Réplica | MongoDB — **MONGOS** (serve dados para o site) |
| Interface | ⚠️ A definir — query SQL direto no Corp, ou API MongoDB? Ver [[decisao-fonte-dados-tracking]] |
| Frequência | Por evento (Rundeck + pulso de estoque — flag atualiza automaticamente) |
| Chave de rastreamento | `id_sku` / `id_produto` |

## Campos / Schema

> As flags SQL confirmadas estão detalhadas na seção **Regra Principal** acima, com grupos por entidade (SkuLojista, Sku, Produto, Marca, Categoria).

### Campos de Domínio (mapeamento conceitual)

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `precificado_loja_fisica` | boolean | SKU com preço ativo em loja física | 🟡 A confirmar nomenclatura |
| `precificado_site` | boolean | SKU com preço ativo no canal digital | 🟡 A confirmar nomenclatura |
| `url_site_sku` | string | URL de acesso ao produto no site | 🟡 Hipótese |
| `disponivel_para_compra` | boolean | Status consolidado final (todas as flags verdadeiras) | Derivado |

### Status Consolidado

> `disponivel_para_compra = true` quando (visão consolidada — cada item é verificado independentemente pelo tracking):

```
E01 (cadastrado)
AND E02 (FlagCompraBloqueada = 0)
AND E03 (contrato_liberado = true)
AND E04 (agendado ou N/A)
AND E05 (tem_estoque = true)
AND E06 (produzido_site = 'S')
AND E07 (produzido_loja_fisica = 'S')
AND E08 (precificado = true)
AND E09 (ativo_site = true OU ativo_loja = true)
```

---

## Para Que Esses Dados São Usados

- **Estado final observável** — confirma que o SKU está visível para compra neste momento
- **URL do produto no site** — link direto para o analista verificar a publicação
- **Separar canal digital de loja física** — um SKU pode estar ativo em um canal e não no outro
- **Calcular lead-time total**: `data_ativacao - data_cadastro (E01)` — métrica chave do domínio GO
- **Relatório de SKUs ativos por categoria** — filtrava pelo gerente de categoria (ver [[PRD-001-tracking-sku-lifecycle]])
- **Base para exportação** de lista de SKUs ativos

---

## Regras de Negócio

- **3 flags obrigatórias simultâneas:** `SkuLojista/SkuLojistaPreco.ativa` + `SKU.ativa` + `Produto.ativa`
- Todas as flags precisam estar **replicadas no MongoDB (MONGOS)** para o SKU aparecer no site
- Falha de replicação em qualquer nível = SKU invisível no site (mesmo com SQL correto)
- Um SKU pode estar **ativo no site mas não em loja física** — e vice-versa — estados independentes
- A exibição é o **resultado observável** de várias condições de negócio estarem satisfeitas — o tracking verifica este estado independentemente dos outros steps
- Flag ativa é propagada via pulso de estoque automaticamente, **independente** do job Rundeck
- SKU pode sair desse estado (desativação) por: falta de estoque, problema fiscal, retirada de preço ou falha de replicação
- O filtro `Ativos: Sim` no painel filtra por esta etapa

---

## Lead-Time Total do Pipeline

| Métrica | Cálculo |
|---------|---------|
| Lead-time fiscal | `data_liberacao_fiscal - data_cadastro` |
| Lead-time comercial | `data_emissao_contrato - data_liberacao_fiscal` |
| Lead-time conteúdo | `data_producao_site - data_cadastro` |
| **Lead-time total** | **`data_ativacao - data_cadastro`** |

---

## Gaps / Perguntas em Aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | ~~`SKLogista` vs `SkuLojista`~~ | Time Oferta | ✅ Confirmado — nome real: `SkuLojista` e `SkuLojistaPreço` (tabelas distintas) |
| 2 | Qual API / endpoint acessa as flags no SQL para integração? | Time Oferta | 🔴 Crítico |
| 3 | Qual collection/endpoint do MongoDB (MONGOS) armazena as flags? | Time Plataforma | 🔴 Crítico |
| 4 | Existe evento Kafka publicado quando o SKU fica disponível para compra? | Time Plataforma | Aberto |
| 5 | Como verificar status de loja física separadamente de site? | Operações | Aberto |
| 6 | Tracking vai consultar via **API** (o que o cliente vê) ou via **query SQL direta** (fonte de verdade do checkout)? | Time Plataforma | 🔴 Em aberto — ver [[decisao-fonte-dados-tracking]] |
| 7 | `FlagSkuSaldoDisponivel` é da tabela `Sku` (Douglas Souza Wolff) ou `SkuLojista` (query SQL sugere)? | Time Oferta | 🟡 A confirmar |
| 8 | Tabela `Marca` é realmente a origem da flag? E os 4 níveis de `Categoria` mapeiam qual hierarquia exata? | Time Plataforma | 🟡 A confirmar |

---

## Próximos Passos

- [x] Confirmar nome real das tabelas: `SkuLojista` e `SkuLojistaPreço` ✅ 10/04
- [ ] Mapear endpoint de leitura das flags no SQL e no MONGOS
- [ ] Criar RFC-004 para propor integração com SQL + MONGOS
- [x] Regras de negócio (flags, propagação, MONGOS) documentadas — Ricardo Tadeu Lima, 09/04/2026
- [ ] Definir regra de negócio para `disponivel_para_compra` consolidado

---

## Referências

- [[sku-lifecycle]] — Pipeline completo
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [[regras-exibicao-sku]] — Regras detalhadas de flags, propagação e MONGOS
- [[validacao-sincronizacao-sql-mongo]] — Detecção de divergência SQL ↔ MONGOS (V2)
- [[E08-ativacao-pricing]] — Etapa anterior (SkuLojistaPreço)
- [[E01-cadastro-inicial]] — Marco zero para lead-time total
- [[sku-on-off-1p-3p]] — Contexto 1P/3P
