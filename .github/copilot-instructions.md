# Tracking GO — Copilot Instructions

## Contexto do Repositório

Este é um **vault Obsidian** com a documentação arquitetural do **Tracking de Produtos GO** — Casas Bahia Tech. Cobre o ciclo completo de um SKU 1P desde o cadastro até a exibição no site/loja.

**Responsável:** Guilherme Maesta Domke de Thomaz (guilherme.thomaz@viavarejo.com.br)
**Jira:** Projeto TCD — Board [2291](https://casasbahiatech.atlassian.net/jira/software/c/projects/TCD/boards/2291/backlog)
**Épico Tracking:** [TCD-9910](https://casasbahiatech.atlassian.net/browse/TCD-9910)

## Estrutura

| Pasta | Conteúdo |
|-------|----------|
| `PRD/` | Product Requirements Documents |
| `RFC/` | Request for Comments (propostas técnicas) |
| `ADR/` | Architecture Decision Records |
| `docs/pipeline/` | Pipeline de 9 etapas do SKU lifecycle |
| `docs/pipeline/etapas/` | Detalhamento por etapa (E01–E09) |
| `docs/conceitos/` | Conceitos de domínio (regras, glossário) |
| `mock/` | Dados mockados e protótipo visual HTML |

## Convenções Obsidian

- **Wikilinks** `[[nome-arquivo]]` para referências cruzadas entre docs
- **Frontmatter YAML** obrigatório com `tags`, `status`, `updated`
- Nomes de arquivo em **kebab-case** com prefixo de tipo (`E01-`, `RFC-`, `PRD-`, `ADR-`)
- Ao criar novos docs, copie o template correspondente (`PRD/template.md`, `RFC/template.md`, `ADR/template.md`)

## Pipeline — 9 Etapas

| # | Etapa | Sistema | Doc |
|---|-------|---------|-----|
| 1 | Cadastro Inicial | GO / API Catálogo | `E01-cadastro-inicial.md` |
| 2 | Validação Fiscal | Tax Web (via API Catálogo) | `E02-validacao-fiscal.md` |
| 3 | Proposta Comercial | LN (Infor) via API Catálogo | `E03-proposta-comercial.md` |
| 4 | Agendamento | LN / Neogrid | `E04-agendamento.md` |
| 5 | Estoque | API Oferta (`DisponibilidadeEstoque`) | `E05-estoque.md` |
| 6 | Produzido Site | Admin | `E06-produzido.md` |
| 7 | Produzido Loja Física | Admin | `E07-produzido-loja.md` |
| 8 | Ativação Pricing | API Oferta (`Valido`) | `E08-ativacao-pricing.md` |
| 9 | Exibição Site/Loja | SQL Corp / MONGOS (MongoDB de Pricing) | `E09-exibicao-site-loja.md` |

## Escopo

- **Apenas 1P** (First Party) — produtos 3P estão fora do escopo
- **Somente leitura** — o tracking observa, não altera dados
- **Multi-bandeira**: CB (Casas Bahia), EX (Extra), PF (Ponto Frio)

## Ao Gerar Documentação

- Use frontmatter YAML com `tags`, `status`, `updated`, `autor`
- Referencie etapas via `[[E0N-nome]]`
- Cite fontes de informação com nome e data (ex: "Fonte: Juliana Dos Santos, 2026-04-09")
- Marque gaps/perguntas em aberto com tabela `| # | Pergunta | Responsável | Status |`
- Status de mapeamento: ✅ Confirmado, ⚠️ Parcial, 🟡 A confirmar, 🔴 Não mapeado

## Ao Gerar Commits

- **Prefixo obrigatório com task Jira:** `[TCD-XXXX] - Descrição da mudança`
- Exemplos:
  - `[TCD-9911] - Cria models de tracking no domain`
  - `[TCD-9914] - Implementa TrackingCatalogoRepositorio para E01/E02/E03`
  - `[TCD-9910] - Adiciona ADR-001 implementação services pipeline`
- Sem task associada: `[NO-JIRA] - Descrição`
- Descrição em português, imperativo, sem ponto final

## Hackathon

- **Label Jira:** `hackathon` em todas as issues relacionadas ao hackathon
- **Tag Obsidian:** adicionar `hackathon` no frontmatter `tags` de todo doc gerado durante o hackathon
