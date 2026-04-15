---
name: tracking-go-domain
description: "Domínio Tracking GO — tracking de produtos com 9 etapas do ciclo de vida do SKU 1P, regras de negócio, schemas, flags de exibição, integrações. USE quando: qualquer agent precisar de contexto de domínio para implementar, testar ou diagnosticar o sistema de tracking de produtos. Fonte de verdade: este repositório."
---

# Skill: Tracking GO — Domínio de Produto

> Conhecimento arquitetural do **Tracking de Produtos GO** — Casas Bahia Tech.
> Este repositório é a **fonte de verdade** de todo o domínio de tracking.

## Propósito

Esta skill expõe o conhecimento de domínio do tracking para que **qualquer agent** (DEV, QA, PO, SRE, Tech Lead) consiga:

1. Entender o pipeline de SKU (9 etapas, fontes, campos, regras)
2. Implementar integrações sabendo exatamente o que cada sistema expõe
3. Criar testes baseados nas regras de negócio documentadas
4. Diagnosticar por que um SKU não aparece no site
5. Tomar decisões arquiteturais com contexto real

## Quando Ativar

- Menção a: tracking de produtos, ciclo de vida SKU, tracking GO, etapas E01-E09
- Menção a: flags de exibição, SkuLojista, MONGOS, estoque/inventário
- Menção a: produzido site/loja, ativação pricing, API Catálogo
- Qualquer decisão sobre fontes de dados do tracking (API vs SQL)
- Criação de testes, specs ou user stories do domínio de tracking

---

## Pipeline — 9 Etapas do Ciclo de Vida do SKU

```
E01 → E02 → E03 → E04 → E05 → E06 → E07 → E08 → E09
Cad.   Fiscal  Comercial  Agend.  Estoque  Prod.Site  Prod.Loja  Pricing  Exibição
```

| # | Etapa | Sistema de Origem | Interface | Status | Doc |
|---|-------|-------------------|-----------|--------|-----|
| 1 | **Cadastro Inicial** | GO / API Catálogo | ✅ `GET /api/v1/produto-sku/selecionar` | Integrado | `docs/pipeline/etapas/E01-cadastro-inicial.md` |
| 2 | **Validação Fiscal** | Tax Web → API Catálogo | ✅ Mesmo endpoint E01 | Integrado | `docs/pipeline/etapas/E02-validacao-fiscal.md` |
| 3 | **Proposta Comercial** | LN (Infor) → API Catálogo | ✅ `FlagContratoLiberado` (null se sem contrato) | Integrado | `docs/pipeline/etapas/E03-proposta-comercial.md` |
| 4 | **Agendamento** | LN / Neogrid | 🔴 Integração a mapear | Pendente | `docs/pipeline/etapas/E04-agendamento.md` |
| 5 | **Estoque** | Banco Inventario (SQL) | ⚠️ Query SQL confirmada — API a definir | Regras mapeadas | `docs/pipeline/etapas/E05-estoque.md` |
| 6 | **Produzido Site** | Admin (escrita) / API Catálogo (leitura) | ✅ `FlagSkuProduzido` via API Catálogo | Integrado | `docs/pipeline/etapas/E06-produzido.md` |
| 7 | **Produzido Loja Física** | Admin (escrita) / API Catálogo (leitura) | ✅ `FlagSkuProduzidoLojaFisica` via API Catálogo | Integrado | `docs/pipeline/etapas/E07-produzido-loja.md` |
| 8 | **Ativação Pricing** | GO/Admin → SQL (SkuLojista) | ⚠️ Flags SQL confirmadas — interface a definir | Flags confirmadas | `docs/pipeline/etapas/E08-ativacao-pricing.md` |
| 9 | **Exibição Site/Loja** | SQL Corp / MONGOS (MongoDB de Pricing) | ⚠️ Flags mapeadas — decisão API vs SQL pendente | Flags expandidas | `docs/pipeline/etapas/E09-exibicao-site-loja.md` |

---

## Regras de Negócio Chave

### SKU Disponível para Compra

Para um SKU aparecer no site, **TODAS** as condições devem ser verdadeiras:

```
E01 (cadastrado)
AND E02 (FlagCompraBloqueada = 0)
AND E03 (ContratoLiberado = true)
AND E04 (agendado ou N/A)
AND E05 (QuantidadeDisponivel > 0)
AND E06 (produzido_site = 'S')
AND E07 (produzido_loja_fisica = 'S')  -- legada, pode não ser validada ativamente
AND E08 (SkuLojista.FlagAtiva = 1 AND SkuLojistaPreço.FlagAtiva = 1)
AND E09 (TODAS as flags de exibição = 1, replicadas no MongoDB/MONGOS)
```

### Flags de Exibição (E09) — 5 Grupos, 11+ Flags

| Grupo | Tabela | Flag |
|-------|--------|------|
| Pricing | `SkuLojista` | `FlagAtiva` |
| Pricing | `SkuLojistaPreço` | `FlagAtiva` |
| SKU | `Sku` | `FlagAtiva` |
| SKU | `Sku` | `FlagAtivaERP` |
| SKU | `Sku` | `FlagSkuProduzido` |
| SKU | `Sku` | `FlagSkuSaldoDisponivel` |
| Produto | `Produto` | `FlagAtiva` |
| Produto | `Produto` | `FlagExibe` |
| Marca | `Marca` | `FlagAtiva` |
| Categoria | `Categoria` (4 níveis) | `FlagAtiva` |

> Se **qualquer** flag estiver inativa ou não replicada no MongoDB (MONGOS), o SKU fica invisível no site.

### Propagação de Flags (Rundeck)

```
SkuLojista.ativa → Rundeck → SKU.ativa + SKU.stock → (~1min) → Produto.ativa
Paralelo: pulso de estoque → flags propagadas → MONGOS atualizado
```

### Estoque — Regra Principal

```sql
Inventario.SaldoEstoqueRestricao.QuantidadeDisponivel > 0
-- Filial.Ativa = true (obrigatório)
-- Escopo por Companhia (IdCompanhiaOrigem) = bandeira (CB/EX/PF)
```

### Pricing — Canal Online vs Loja Física

- Flag de pricing é **exclusiva do canal online** (site/app)
- **Loja física sempre tem preço** (fallback para preço base)
- O tracking foca na flag online — é ela que bloqueia exibição no site
- API Oferta **requer região** — sem região = "indisponível" (não é bug)

### 1P vs 3P

- **1P**: SKU ON ≠ SKU OFF (dados distintos). Tracking opera sobre SKU OFF (backoffice).
- **3P**: Fora do escopo do tracking.

---

## API Confirmada — Catálogo (E01, E02, E03, E06, E07)

```
GET /api/v1/produto-sku/selecionar
Host: gestaoproduto-catalogo-{env}.viavarejo.com.br
Header: apikey: [API_KEY_ENV]
Query: idSkuSite={id_sku} (ou idSkuLoja={id_sku})
       &composicao=Geral.Nome;Mercadorias.DadosBasicos.NomeTipoSku;Mercadorias.DadosBasicos.FlagCrossDocking;Mercadorias.DadosBasicos.FlagCompraBloqueada;Mercadorias.Controle.DataCadastro;Mercadorias.DadosBasicos.FlagContratoLiberado;Mercadorias.Geral.FlagSkuProduzido;Mercadorias.Geral.FlagSkuProduzidoLojaFisica
```

Campos disponíveis e mapeamento para etapas do tracking:

| Campo | Etapa | Regra |
|-------|-------|-------|
| `Geral.Nome` | E01 | Nome do produto |
| `Mercadorias[].Controle.DataCadastro` | E01 | Data de cadastro |
| `Mercadorias[].DadosBasicos.NomeTipoSku` | E01 | Tipo de produto |
| `Mercadorias[].DadosBasicos.FlagCrossDocking` | E01 | Flag crossdocking |
| `Mercadorias[].DadosBasicos.FlagCompraBloqueada` | E02 | `0` = validado fiscalmente |
| `Mercadorias[].DadosBasicos.FlagContratoLiberado` | E03 | `true` = contrato emitido |
| `Mercadorias[].Geral.FlagSkuProduzido` | E06 | `1` = produzido para site |
| `Mercadorias[].Geral.FlagSkuProduzidoLojaFisica` | E07 | `1` = produzido para loja física |

---

## Decisões Pendentes

| Decisão | Status | Doc |
|---------|--------|-----|
| Fonte de dados: API vs SQL direto | � Parcialmente resolvido (E01-E03, E06, E07 via API Catálogo) | `docs/conceitos/decisao-fonte-dados-tracking.md` |
| Integração agendamento (LN/Neogrid) | 🔴 Em aberto | `docs/pipeline/etapas/E04-agendamento.md` |
| Método integração estoque (API vs banco) | 🔴 Em aberto | `docs/pipeline/etapas/E05-estoque.md` |
| Endpoint leitura flags pricing | 🔴 Em aberto | `docs/pipeline/etapas/E08-ativacao-pricing.md` |

---

## Conceitos de Domínio

| Conceito | Arquivo | Resumo |
|----------|---------|--------|
| SKU ON/OFF, 1P/3P | `docs/conceitos/sku-on-off-1p-3p.md` | Distinção entre backoffice (OFF) e site (ON) |
| Regras de Exibição | `docs/conceitos/regras-exibicao-sku.md` | 11 flags em 5 grupos, propagação via Rundeck |
| Regras de Estoque | `docs/conceitos/regras-estoque-inventario.md` | Schema Inventario SQL, tipos de estoque |
| Decisão API vs SQL | `docs/conceitos/decisao-fonte-dados-tracking.md` | Debate em aberto: API (cliente vê) vs SQL (checkout usa) |
| Validação SQL↔MongoDB | `docs/conceitos/validacao-sincronizacao-sql-mongo.md` | Detecção de divergência — escopo V2 |

---

## Mapa do Repositório

```
tracking-memory-hackathon/
├── PRD/                              # Product Requirements Documents
│   └── PRD-001-tracking-sku-lifecycle.md   # PRD principal — requisitos do tracking
├── RFC/                              # Request for Comments
│   └── archive/                      # RFCs arquivadas (implementadas)
├── ADR/                              # Architecture Decision Records
│   └── (nenhuma ADR ainda)
├── docs/
│   ├── pipeline/
│   │   ├── sku-lifecycle.md          # Índice do pipeline (visão geral)
│   │   └── etapas/                   # E01 a E09 — detalhamento por etapa
│   ├── conceitos/                    # Regras de negócio e conceitos de domínio
│   ├── mapeamento-arquivos.md        # Inventário de todos os arquivos do vault
│   └── referencias-confluence.md     # Índice de páginas Confluence por tema
├── mock/
│   ├── data.js / data.json           # 9 etapas + 8 SKUs de exemplo
│   └── index.html                    # Protótipo visual do painel GO
└── overview.html                     # Visão geral estática
```

---

## Como Consumir Esta Skill

### Para DEV (implementação)

1. Leia o PRD (`PRD/PRD-001-tracking-sku-lifecycle.md`) para entender o domínio
2. Para cada etapa, consulte o doc detalhado em `docs/pipeline/etapas/E0N-*.md` (campos, schemas, regras)
3. Verifique decisões pendentes antes de implementar — pode precisar de RFC
4. Use `mock/data.json` como referência para estrutura de dados do frontend

### Para QA (testes)

1. Regras de negócio de cada etapa = base para cenários de teste
2. Tabela de flags (E09) = contrato do sistema — cada flag é um caso de teste
3. Mock data tem cenários variados (todos status, N/A, parcial) — bons para test fixtures
4. Validar schemas de API Catálogo contra campos documentados em E01/E02/E03

### Para PO (requisitos)

1. PRD-001 é o documento central de requisitos
2. Perguntas em aberto (tabela em cada etapa) = backlog de discovery
3. Pipeline completo = user story map visual

### Para SRE (troubleshooting)

1. Regras de exibição = checklist de diagnóstico "por que SKU não aparece no site"
2. Propagação de flags (Rundeck) = ponto de falha de integração
3. SQL ↔ MongoDB divergência = escopo V2 mas útil para diagnóstico manual agora
4. `docs/referencias-confluence.md` = runbooks existentes

---

## Regras da Skill

- Sempre cite o arquivo-fonte ao fornecer informação de domínio
- Marque decisões pendentes com ⚠️ ao responder — não assuma o resultado
- Se precisar de mais detalhes sobre uma etapa, leia `docs/pipeline/etapas/E0N-*.md`
- Para conceitos transversais, consulte `docs/conceitos/`
- Esta skill é **somente leitura** — fornece contexto, não implementa código
- Ao gerar specs, testes ou código para o tracking, use os schemas e regras documentados aqui como base
