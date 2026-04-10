---
tags: [tracking, pipeline, etapa, pricing, go, admin, precificacao, site, sklojista, sql]
etapa: 8
titulo: Ativação Pricing (Site)
status: flags-confirmadas
origem: SkuLojista / SkuLojistaPreço (SQL) — escrita via GO / Admin
escopo: 1P apenas
updated: 2026-04-09
fonte: Juliana Dos Santos; Ricardo Tadeu Lima; Douglas Souza Wolff — reunião 09/04/2026
---

# E08 — Ativação Pricing (Site)

> Etapa que verifica se o SKU tem preço ativo no canal digital. **Flags SQL confirmadas por Douglas Souza Wolff em 09/04/2026:** `SkuLojista.FlagAtiva` e `SkuLojistaPreço.FlagAtiva`. Sistema de escrita: GO e/ou Admin (Juliana Dos Santos). Método de integração para leitura ainda não definido.

## Visão Geral

| Atributo | Valor |
|----------|-------|
| Etapa | 8 de 9 |
| Sistema de Escrita | **GO / Admin** (quem seta as flags) |
| Sistema de Leitura | **SQL — tabelas `SkuLojista` / `SkuLojistaPreço`** (fonte das flags) |
| Status do Mapeamento | Flags confirmadas — método de integração para leitura a definir |
| Etapa anterior | [[E07-produzido-loja]] |
| Próxima etapa | [[E09-exibicao-site-loja]] |

> ℹ️ **Fonte: Juliana Dos Santos (2026-04-09):** sistemas de escrita confirmados como **GO e/ou Admin**. **Douglas Souza Wolff (2026-04-09):** flags SQL confirmadas — `SkuLojista.FlagAtiva` e `SkuLojistaPreço.FlagAtiva`.

---

## Como Obter os Dados

| Método | Detalhe |
|--------|---------|
| Sistema de escrita | **GO** e/ou **Admin** — quem ativa o pricing |
| Tabelas SQL (fonte) | `SkuLojista` (flag base) e `SkuLojistaPreço` (flag de preço por canal) |
| Interface de leitura | ⚠️ A definir — query SQL direta, API Corp ou API Oferta? Ver [[decisao-fonte-dados-tracking]] |
| Frequência de atualização | Por evento (acionado manualmente no GO/Admin) |
| Chave de rastreamento | `id_sku` |

> ℹ️ **Douglas Souza Wolff (2026-04-09):** flags SQL identificadas diretamente nessas tabelas. GO e Admin são os sistemas que escrevem nesses registros — a distinção entre os dois ainda a confirmar com o time de pricing.

---

## Campos / Schema

### Flags SQL Confirmadas — Ativação Pricing

> Fonte: Douglas Souza Wolff, 09/04/2026

| Tabela SQL | Flag | Valor esperado | Descrição | Status |
|-----------|------|---------------|-----------|--------|
| `SkuLojista` | `FlagAtiva` | `= 1` | Ativa o lojista para venda no canal | ✅ Confirmado |
| `SkuLojistaPreço` | `FlagAtiva` | `= 1` | Ativa especificamente o preço de venda por canal (site/app) | ✅ Confirmado |

> ⚠️ **A confirmar:** `SkuLojista` e `SkuLojistaPreço` são tabelas distintas ou schemas/views diferentes da mesma tabela? Impacta a query de integração. Gap #1 abaixo.

### Campos de Domínio (conceitual)

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `precificado_site` | boolean | Derivado: `SkuLojista.FlagAtiva AND SkuLojistaPreço.FlagAtiva` | ✅ Confirmado (derivado) |
| `preco_venda_site` | decimal | Valor do preço de venda no site | Hipótese |
| `data_ativacao_preco` | datetime | Data em que o preço foi ativado | Hipótese |
| `bandeira` | enum (`CB`/`EX`/`PF`) | Bandeira da precificação | Hipótese |
| `origem_preco` | string | Sistema que originou o preço (GO / Admin) | Hipótese |

### Multi-Bandeira

> Preços podem variar por bandeira — CB (Casas Bahia), EX (Extra), PF (Ponto Frio).
> Um SKU pode estar precificado para CB mas não para EX.

| Bandeira | Verificar separadamente? |
|----------|--------------------------|
| CB | Sim |
| EX | Sim |
| PF | Sim |

---

## Para Que Esses Dados São Usados

- **Verificar se o SKU tem preço ativo** — sem preço, não pode ser exibido para compra
- **Identificar SKUs sem precificação** — gargalo frequente antes de lançamento
- **Lead-time de precificação**: `data_ativacao_preco - data_producao_site ([[E06-produzido]])`
- **Análise por bandeira**: SKU precificado em CB mas não em EX — visibilidade cruzada
- **Alimentar [[E09-exibicao-site-loja]]** — precificação é pré-requisito para exibição

---

## Regras de Negócio

- **A flag de ativação de pricing é exclusiva do canal online (site/app)** — confirmado por Juliana Dos Santos (09/04/2026)
- **Loja física sempre tem preço** — se nenhum preço for encontrado, ela usa o preço base como fallback. Logo, para loja física essa flag é praticamente sempre verdadeira e não é discriminante para o tracking
- **O tracking foca na flag online** — é ela quem bloqueia o SKU de aparecer no site. Loja física pode ser ignorada neste contexto _(Juliana: "dá para focar nessa flag mesmo")_
- SKU sem `precificado_site = true` **não aparece** para compra no site ([[E09-exibicao-site-loja]])
- A precificação pode ser **por bandeira** — um SKU pode estar ativo em CB e inativo em EX
- Quando a flag é ativada no pricing, o **Rundeck** propaga para `SKU.ativa` e depois para `Produto.ativa` (~1 minuto). Ver [[regras-exibicao-sku]]
- **API Oferta requer região** — ao consultar o preço via API sem especificar a região, o retorno é "indisponível". Não é bug — é configuração (o SKU pode ter sido configurado apenas para venda regional)
- Preço de R$0,00 ou nulo pode ser considerado "sem precificação" — confirmar regra de negócio
- A ativação de preço pode ter **data de vigência** (início e fim) — a confirmar
- Relação com Oferta de Preço (`api-oferta-preco`): esse serviço consulta e publica preços — confirmar se é ele a fonte de verdade do status

---

## Gaps / Perguntas em Aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | `SkuLojista` e `SkuLojistaPreço` são tabelas distintas ou a mesma com alias/schema diferente? | Time Oferta | 🟡 Flag confirmada — estrutura a confirmar |
| 2 | Qual a interface de leitura das flags? Query SQL direta, API Corp ou API Oferta? Ver [[decisao-fonte-dados-tracking]] | Time Plataforma | 🔴 Crítico — decisão pendente |
| 3 | O preço varia por bandeira (CB/EX/PF)? O tracking verifica cada uma separadamente? | Time Pricing | Aberto |
| 4 | Existe evento Kafka publicado quando um SKU é precificado? | Time Plataforma | Aberto |
| 5 | Como identificar as regiões de venda de um SKU para evitar falso "indisponível"? | Time Oferta | Aberto |

---

## Próximos Passos

- [ ] Confirmar com time de Oferta a fonte da flag `precificado_site` e endpoint de consulta
- [ ] Confirmar como obter as regiões de venda de um SKU (evitar falso "indisponível" por região)
- [ ] Criar RFC-004 após alinhamento
- [x] Flag de pricing confirmada como **exclusiva do site** — Juliana Dos Santos, 09/04/2026
- [x] Loja física sempre tem preço (fallback) — tracking foca na flag online
- [x] API Oferta requer região — Ricardo Tadeu Lima, 09/04/2026

---

## Referências

- [[sku-lifecycle]] — Pipeline completo
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [[E06-produzido]] — Etapa anterior
- [[E09-exibicao-site-loja]] — Próxima etapa
