---
tags: [conceito, sincronizacao, sql, mongodb, MONGOS, divergencia, v2, integracao]
tipo: conceito
status: proposto
escopo: V2 — fora do MVP
updated: 2026-04-09
fonte: Douglas Souza Wolff, Ricardo Tadeu Lima, Guilherme Maesta — reunião 09/04/2026
---

# Conceito — Validação de Sincronização SQL ↔ MongoDB (MONGOS)

> Funcionalidade de detecção de divergência entre a fonte relacional (SQL) e a réplica no MongoDB (MONGOS).
> Definida como **evolução V2** — fora do escopo do MVP.

---

## Contexto

O sistema de tracking lida com dois planos de dados para as flags de exibição do SKU:

| Plano | Sistema | Papel |
|-------|---------|-------|
| **Fonte** | SQL (banco relacional — `SkuLojista`, `SKU`, `Produto`) | Origem das flags de ativação |
| **Réplica** | MongoDB — MONGOS | Serve os dados para o site e canais digitais |

A sincronização entre esses dois sistemas é feita via job Rundeck (propaga flags SKU e Produto) e por pulso de estoque (evento). Ver [[regras-exibicao-sku]].

---

## O Que o Sistema Consegue e Não Consegue Detectar

### Fora do Escopo — Inauditável

> "A gente não consegue avaliar porque que o cara não foi lá apertou o botão" — Douglas Souza Wolff

O tracking **não pode** identificar:
- Por que um usuário não realizou uma ação manual no sistema
- Intenção ou omissão de operadores
- Histórico de ações humanas não registradas

### Dentro do Escopo — Detectável

> "Pelo menos dizer: opa, aqui deveria ter integrado, as informações deveriam estar iguais nos dois locais, não estão." — Douglas Souza Wolff

> "Gerar um erro de sincronização, pelo que entendi, é isso aí." — Ricardo Tadeu Lima

> "É uma sub-validação: ver que tá errado no mongo e conferir se tá na esquerda (SQL) ou não." — Guilherme Maesta

O tracking **pode** identificar:
- Divergência entre o valor de uma flag no SQL e o valor correspondente no MongoDB
- Quando os dados **deveriam ser iguais** (pós-propagação) mas não estão
- Qual sistema tem o dado correto (SQL = fonte de verdade)

---

## Regra de Validação

```
SE flag_sql(SKU.ativa) ≠ flag_mongo(SKU.ativa)
   → ERRO DE SINCRONIZAÇÃO

SE flag_sql(Produto.ativa) ≠ flag_mongo(Produto.ativa)
   → ERRO DE SINCRONIZAÇÃO

SE flag_sql(SkuLojista.ativa) ≠ flag_mongo(SkuLojista|SkuLojistaPreco.ativa)
   → ERRO DE SINCRONIZAÇÃO
```

**Pressuposto:** SQL é sempre a **fonte de verdade**. MongoDB é réplica.

---

## Diagnóstico / Semântica do Erro

| Condição | SQL | MongoDB | Diagnóstico |
|----------|-----|---------|-------------|
| ✅ Sincronizado — ativo | `ativa = true` | `ativa = true` | OK — SKU visível no site |
| ✅ Sincronizado — inativo | `ativa = false` | `ativa = false` | OK — SKU não visível (esperado) |
| ⚠️ Divergência positiva | `ativa = true` | `ativa = false` | **Erro de sync** — SKU deveria aparecer mas não aparece |
| ⚠️ Divergência negativa | `ativa = false` | `ativa = true` | **Erro de sync** — SKU aparece indevidamente no site |

---

## Posicionamento no Roadmap

| Momento | Escopo |
|---------|--------|
| **MVP** | Mostrar estado das flags no SQL — sem comparação com MongoDB |
| **V2 — Evolução** | Comparar SQL ↔ MongoDB e sinalizar divergência como "erro de sincronização" |

> "Isso eu acho para mim ser uma validação importante." — Ricardo Tadeu Lima
> "Eu acredito que isso entraria como um segundo momento, talvez, como evolução do sistema." — Douglas Souza Wolff

---

## Impacto no Produto

- Permite ao analista GO identificar problemas de integração **sem precisar acessar o MongoDB diretamente**
- Reduz tempo de diagnóstico: "o dado está errado no site" → localiza se o problema é no SQL ou na replicação
- Complementa a visibilidade de [[E09-exibicao-site-loja]] com camada de diagnóstico técnico

---

## Perguntas em Aberto para V2

| # | Pergunta | Status |
|---|----------|--------|
| 1 | Qual é o endpoint/collection do MongoDB (MONGOS) que armazena as flags? | Aberto |
| 2 | O acesso ao MONGOS é via API interna ou direto no banco? | Aberto |
| 3 | Qual é o lag esperado de sincronização? (para evitar falso-positivo imediato) | Aberto |
| 4 | MONGOS é o nome oficial ou apelido interno? | A confirmar |

---

## Referências

- [[regras-exibicao-sku]] — Flags e fluxo de propagação (Rundeck, pulso de estoque)
- [[E09-exibicao-site-loja]] — Etapa de exibição (onde o erro se manifesta)
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
