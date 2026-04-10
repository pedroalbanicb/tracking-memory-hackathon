---
tags: [conceito, exibicao, sku, flags, mongodb, MONGOS, corp, marca, categoria, sql]
tipo: conceito
status: expandido
updated: 2026-04-09
fonte: Ricardo Tadeu Lima; Douglas Souza Wolff — reunião 09/04/2026
nota: "FLAVIA" na transcrição interpretado como artefato de speech-to-text de "flag via" / "flag ativa"; "Handeck" corrigido para "Rundeck" (sistema de automação de jobs)
---

# Conceito — Regras de Exibição do SKU no Site e Loja Física

> Regras que determinam se um SKU aparece no site e/ou na loja física.
> **Expandido em 09/04/2026:** Ricardo Tadeu Lima (flags base) + Douglas Souza Wolff (flags adicionais: Sku completo, Marca, Categoria) + query SQL evidenciada.

---

## Condição de Exibição — Mapeamento Completo de Flags

> Atualizado com notas de Douglas Souza Wolff (09/04/2026). Anteriormente documentado como "3 flags" (Ricardo) — expandido para incluir Marca, Categoria e flags adicionais de Sku.

Para que um SKU apareça no site, **todas as flags abaixo precisam ser verdadeiras ao mesmo tempo**:

### Ativação Pricing

| Tabela | Flag | Valor | Descrição |
|--------|------|-------|----------|
| `SkuLojista` | `FlagAtiva` | `= 1` | Ativação do lojista para venda no canal |
| `SkuLojistaPreço` | `FlagAtiva` | `= 1` | Ativação específica do preço de venda por canal |

### Disponível no Site

| Tabela | Flag | Alias SQL | Valor | Observação |
|--------|------|-----------|-------|------------|
| `SkuLojista` | `FlagAtiva` | `sl` | `= 1` | Mesma flag da ativação de pricing |
| `Produto` | `FlagExibe` | `p` | `= 1` | **Vem automático do pulso de estoque** |
| `Sku` | `FlagAtivaERP` | `s` | `= 1` | Flag do ERP — obrigatória para reconhecimento |
| `Sku` | `FlagSkuProduzido` | `s` | `= 1` | Conteúdo do SKU produzido |
| `Sku` | `FlagAtiva` | `s` | `= 1` | Visibilidade do SKU |
| `Sku` | `FlagSkuSaldoDisponivel` | `sl`* | `= 1` | Saldo disponível — ⚠️ *alias SQL é `sl` (SkuLojista); Douglas atribui ao Sku — a confirmar |
| `Marca` | `FlagAtiva` | `p2`* | `= 1` | Marca do produto ativa — ⚠️ *alias `p2` a confirmar |
| `Categoria` (direta) | `FlagAtiva` | `c` | `= 1` | Categoria do produto |
| `Categoria` (pai) | `FlagAtiva` | `c1` | `= 1` | CategoriaPai |
| `Categoria` (neto) | `FlagAtiva` | `c2` | `= 1` | Nível intermediário — nomenclatura a confirmar |
| `Categoria` (departamento) | `FlagAtiva` | `c3` | `= 1` | Departamento |

> ⚠️ **Se qualquer uma dessas flags estiver inativa — por erro de replicação, desativação ou falha de integração — o SKU não aparece no site, mesmo que as demais estejam corretas.**

### Flag Legada (não validada ativamente)

| Tabela | Flag | Alias SQL | Behavior | Fonte |
|--------|------|-----------|----------|-------|
| `Sku` | `FlagSkuProduzidoLojaFisica` | `s` | Comentada no SQL (`--`). Valor deve ser `= 1` mas não é filtrada | Ricardo Tadeu Lima: *"Hoje em dia acho que não é validado mais. Mas tem que estar como um."* |

---

## Fluxo de Propagação das Flags

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
```

```
Movimentação de Estoque
    │
    ▼
Flag ativa é propagada automaticamente via pulso de estoque
    (independente do job Rundeck)
```

### Resumo do Fluxo

| Etapa | Trigger | Sistema | Lag estimado |
|-------|---------|---------|--------------|
| 1 | `SKLogista.ativa` setado | Backoffice | — |
| 2 | Rundeck job | Sistema de automação de jobs | imediato |
| 3 | `SKU.ativa` + `SKU.stock` atualizados | SKU | ~0 |
| 4 | Replica para `Produto.ativa` | Produto | ~1 minuto |
| 5 | Dados replicados no MongoDB (MONGOS) | MONGOS | a confirmar |
| Paralelo | Pulso de estoque propaga flag ativa | Estoque → MongoDB | por evento |

---

## Replicação para MongoDB (MONGOS)

- **MONGOS** é o nome interno do MongoDB utilizado para servir dados ao site
- Todas as flags (SKLogista, SKU, Produto) precisam estar replicadas no MongoDB para que o SKU apareça no site
- Falha de replicação = SKU invisível no site, mesmo com as flags corretas nas tabelas relacionais (SQL)

### Cenário de Falha

```
SKLogista.ativa = true  ✅
SKU.ativa = true        ✅
Produto.ativa = true    ✅
MongoDB (MONGOS)         ❌ (não replicado por falha de integração)

Resultado: SKU não aparece no site
```

---

## Validação de Divergência SQL ↔ MongoDB

> Ver [[validacao-sincronizacao-sql-mongo]] — funcionalidade de V2 do sistema.

A detecção de divergência entre SQL (fonte) e MongoDB/MONGOS (réplica) é:
- **Fora do escopo do MVP**: identificar por que um usuário não acionou um processo (não auditável)
- **Dentro do escopo do V2**: detectar que as informações deveriam ser iguais nos dois sistemas e não estão

---

## Canais Cobertos

| Canal | Coberto por esta regra |
|-------|----------------------|
| Site (web) | ✅ Sim |
| App mobile | ✅ Sim (mesmo canal digital) |
| Loja Física | ✅ Sim |

---

## Impacto no Pipeline

Esta regra é a lógica central da [[E09-exibicao-site-loja|Etapa 9 — Exibição]]:
- Um SKU só chega ao estado "ativo" no tracking quando esta condição for satisfeita
- A etapa de [[E08-ativacao-pricing]] (SKLogista Preço) é pré-requisito desta etapa

---

## Referências

- [[sku-lifecycle]] — Pipeline completo
- [[E08-ativacao-pricing]] — Ativação pricing (SKLogista Preço)
- [[E09-exibicao-site-loja]] — Etapa de exibição (usa estas regras)
- [[validacao-sincronizacao-sql-mongo]] — Detecção de divergência SQL ↔ MONGOS (V2)
- [[sku-on-off-1p-3p]] — Contexto 1P/3P
