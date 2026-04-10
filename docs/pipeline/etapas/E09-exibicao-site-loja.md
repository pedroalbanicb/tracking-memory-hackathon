---
tags: [tracking, pipeline, etapa, exibicao, corp, site, loja-fisica, flags, rundeck, flavia, MONGOS, mongodb, marca, categoria]
etapa: 9
titulo: Exibição — Site / Loja Física
status: flags-expandidas
origem: Corp / SKLogista / SKU / Produto / Marca / Categoria / MONGOS
escopo: 1P apenas
updated: 2026-04-09
fonte: Juliana Dos Santos; Ricardo Tadeu Lima; Douglas Souza Wolff — reunião 09/04/2026
---

# E09 — Exibição — Site / Loja Física

> Etapa final do pipeline. O SKU está **disponível para compra** quando todas as etapas anteriores foram satisfeitas e as 3 flags de ativação estão verdadeiras e replicadas no MongoDB. Regras mapeadas por Ricardo Tadeu Lima em 09/04/2026.

## Visão Geral

| Atributo | Valor |
|----------|-------|
| Etapa | 9 de 9 |
| Sistema de Origem | **SKLogista / SKU / Produto (SQL) → Corp / MONGOS (MongoDB)** |
| Status do Mapeamento | **Regras mapeadas — método de integração a definir** |
| Etapa anterior | [[E08-ativacao-pricing]] |
| Próxima etapa | ✅ SKU ATIVO — fim do pipeline |

> ℹ️ **Fonte: Juliana Dos Santos (2026-04-09)** — sistema confirmado: Corp. **Ricardo Tadeu Lima (09/04/2026)** — flags, fluxo de propagação e dependência do MongoDB (MONGOS) mapeados.

---

## Regra Principal — Flags Simultâneas para Exibição no Site

> Fonte: Ricardo Tadeu Lima, 09/04/2026 (flags base) + Douglas Souza Wolff, 09/04/2026 (expansão Marca/Categoria/Sku)

Para que um SKU apareça no site, **todas as flags abaixo precisam ser verdadeiras** e estar replicadas no MongoDB (MONGOS):

### Grupo 1 — Pricing (SkuLojista)

| Tabela            | Flag        | Alias SQL | Valor | Descrição                            | Status       |
| ----------------- | ----------- | --------- | ----- | ------------------------------------ | ------------ |
| `SkuLojista`      | `FlagAtiva` | `sl`      | `= 1` | Ativação do lojista para o canal     | ✅ Confirmado |
| `SkuLojistaPreço` | `FlagAtiva` | —         | `= 1` | Ativação do preço de venda por canal | ✅ Confirmado |

### Grupo 2 — SKU

| Tabela | Flag                         | Alias SQL | Valor | Descrição                                                | Status                                                                                              |
| ------ | ---------------------------- | --------- | ----- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `Sku`  | `FlagAtiva`                  | `s`       | `= 1` | Visibilidade do SKU (propagada pelo Handeck)             | ✅ Confirmado                                                                                        |
| `Sku`  | `FlagAtivaERP`               | `s`       | `= 1` | Flag de ativação no ERP — necessária para reconhecimento | ✅ Confirmado (SQL)                                                                                  |
| `Sku`  | `FlagSkuProduzido`           | `s`       | `= 1` | Conteúdo do SKU produzido (fotos, descrição)             | ✅ Confirmado (SQL)                                                                                  |
| `Sku`  | `FlagSkuSaldoDisponivel`     | `sl`*     | `= 1` | Saldo disponível no inventário                           | ✅ Confirmado — ⚠️ *a confirmar tabela: Douglas atribui ao `Sku`, SQL mostra alias `sl` (SkuLojista) |
| `Sku`  | `FlagSkuProduzidoLojaFisica` | `s`       | `= 1` | Conteúdo produzido para loja física                      | ⚠️ **Legada/comentada** — ver nota abaixo                                                           |

> 🗒️ **`FlagSkuProduzidoLojaFisica` — Flag Legada:** aparece **comentada** na query SQL (`-- s.FlagSkuProduzidoLojaFisica = 1`). Ricardo Tadeu Lima (09/04/2026): *"Hoje em dia acho que não é validado mais. Mas tem que estar como um, senão não reconhece."* — Flag não filtrada ativamente, mas o valor deve ser `= 1` para o sistema reconhecer o SKU.

### Grupo 3 — Produto

| Tabela | Flag | Alias SQL | Valor | Descrição | Status |
|--------|------|-----------|-------|-----------|--------|
| `Produto` | `FlagAtiva` | `p` | `= 1` | Visibilidade do Produto pai (propagada ~1min após Sku pelo Handeck) | ✅ Confirmado |
| `Produto` | `FlagExibe` | `p` | `= 1` | Exibição no site — **atualizado automaticamente via pulso de estoque (FLAVIA)** | ✅ Confirmado |

### Grupo 4 — Marca

| Tabela | Flag | Alias SQL | Valor | Descrição | Status |
|--------|------|-----------|-------|-----------|--------|
| `Marca` | `FlagAtiva` | `p2`* | `= 1` | Marca do produto ativa | ✅ Confirmado — ⚠️ *alias SQL `p2` a confirmar como Marca |

### Grupo 5 — Categoria (Hierarquia completa)

> Douglas Souza Wolff (09/04/2026): `Categoria [FlagAtiva (Categoria, CategoriaPai, Departamento)]`

| Tabela | Flag | Alias SQL | Valor | Nível | Status |
|--------|------|-----------|-------|-------|--------|
| `Categoria` | `FlagAtiva` | `c` | `= 1` | Categoria direta do produto | ✅ Confirmado |
| `Categoria` | `FlagAtiva` | `c1` | `= 1` | CategoriaPai | ✅ Confirmado |
| `Categoria` | `FlagAtiva` | `c2` | `= 1` | CategoriaNeto (ou nível intermediário) | ✅ Confirmado — ⚠️ nomenclatura a confirmar |
| `Categoria` | `FlagAtiva` | `c3` | `= 1` | Departamento | ✅ Confirmado |

> ⚠️ **Se qualquer uma das flags acima (em qualquer grupo) estiver inativa ou não replicada no MongoDB (MONGOS), o SKU não aparecerá no site.**

## Fluxo de Propagação (Job Rundeck)

```
SKLogista.ativa = true (ou SKLogista Preço.ativa = true)
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
| Interface | ⚠️ A definir — API Corp, query SQL direta ou API MongoDB? Ver [[decisao-fonte-dados-tracking]] |
| Frequência | Por evento (Rundeck + pulso de estoque FLAVIA) |
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

> `disponivel_para_compra = true` quando:

```
E01 (cadastrado)
AND E02 (ok_fiscal = 'N')
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

- **Estado final do tracking** — confirma que o SKU completou o pipeline
- **URL do produto no site** — link direto para o analista verificar a publicação
- **Separar canal digital de loja física** — um SKU pode estar ativo em um canal e não no outro
- **Calcular lead-time total**: `data_ativacao - data_cadastro (E01)` — métrica chave do domínio GO
- **Relatório de SKUs ativos por categoria** — filtrava pelo gerente de categoria (ver [[PRD-001-tracking-sku-lifecycle]])
- **Base para exportação** de lista de SKUs ativos

---

## Regras de Negócio

- **3 flags obrigatórias simultâneas:** `SKLogista/SKLogistaPreco.ativa` + `SKU.ativa` + `Produto.ativa`
- Todas as flags precisam estar **replicadas no MongoDB (MONGOS)** para o SKU aparecer no site
- Falha de replicação em qualquer nível = SKU invisível no site (mesmo com SQL correto)
- Um SKU pode estar **ativo no site mas não em loja física** — e vice-versa — estados independentes
- A exibição depende de **todas as etapas anteriores** serem satisfeitas — é o estado acumulativo
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
| 1 | `SKLogista` e `SKLogista Preço` são tabelas distintas ou a mesma com alias? | Time Oferta | Aberto |
| 2 | Qual API / endpoint acessa as flags no SQL para integração? | Time Oferta | 🔴 Crítico |
| 3 | Qual collection/endpoint do MongoDB (MONGOS) armazena as flags? | Time Plataforma | 🔴 Crítico |
| 4 | Existe evento Kafka publicado quando o SKU fica disponível para compra? | Time Plataforma | Aberto |
| 5 | Como verificar status de loja física separadamente de site? | Operações | Aberto |
| 6 | Tracking vai consultar via **API** (o que o cliente vê) ou via **query SQL direta** (fonte de verdade do checkout)? | Time Plataforma | 🔴 Em aberto — ver [[decisao-fonte-dados-tracking]] |
| 7 | `FlagSkuSaldoDisponivel` é da tabela `Sku` (Douglas Wolf) ou `SkuLojista` (alias `sl` no SQL)? | Time Oferta | 🟡 A confirmar |
| 8 | Alias SQL `p2` corresponde à tabela `Marca`? E `c`, `c1`, `c2`, `c3` mapeiam qual hierarquia exata de Categoria? | Time Plataforma | 🟡 A confirmar |

---

## Próximos Passos

- [ ] Confirmar com time de Oferta qual serviço/tabela é a fonte das flags (`SKLogista` vs `SKLogistaPreco`)
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
- [[E08-ativacao-pricing]] — Etapa anterior (SKLogista Preço)
- [[E01-cadastro-inicial]] — Marco zero para lead-time total
- [[sku-on-off-1p-3p]] — Contexto 1P/3P
