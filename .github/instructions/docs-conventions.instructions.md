---
name: "Tracking GO — Convenções de Documentação"
description: "Padrões de criação e manutenção de documentação no vault Obsidian do Tracking GO."
applyTo: "**/*.md"
---

# Convenções de Documentação — Tracking GO

## Frontmatter YAML Obrigatório

Todo arquivo `.md` deve ter frontmatter com pelo menos:

```yaml
---
tags: [tracking, ...]
status: draft | integrado | mapeado-parcialmente | confirmado | em-aberto
updated: YYYY-MM-DD
---
```

### Campos Adicionais por Tipo

| Tipo | Campos extras |
|------|--------------|
| Etapa (`E0N-*`) | `etapa: N`, `titulo`, `origem`, `fonte` |
| PRD | `autor`, `data`, `revisores` |
| RFC | `autor`, `data`, `prd-relacionado`, `revisores` |
| ADR | `data`, `autores`, `rfc-relacionada` |
| Conceito | `tipo: conceito`, `fonte` |

## Nomenclatura de Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Etapa | `E{NN}-{titulo-kebab}.md` | `E05-estoque.md` |
| PRD | `PRD-{NNN}-{titulo-kebab}.md` | `PRD-001-tracking-sku-lifecycle.md` |
| RFC | `RFC-{NNN}-{titulo-kebab}.md` | `RFC-002-agendamento.md` |
| ADR | `ADR-{NNN}-{titulo-kebab}.md` | `ADR-001-decisao-fonte-dados.md` |
| Conceito | `{titulo-kebab}.md` | `regras-exibicao-sku.md` |

## Wikilinks

- Usar `[[nome-arquivo]]` sem extensão para referências cruzadas
- Usar `[[nome-arquivo\|Texto de exibição]]` quando o nome do arquivo não é legível
- Não usar links markdown relativos entre docs internos

## Status de Mapeamento

| Ícone | Status | Significado |
|-------|--------|-------------|
| ✅ | Confirmado | Endpoint/campo testado e documentado |
| ⚠️ | Parcial | Sistema identificado, detalhes a confirmar |
| 🟡 | A confirmar | Informação recebida, não validada |
| 🔴 | Não mapeado | Sem informação — requer discovery |

## Fontes e Citação

- Sempre citar pessoa + data: "Fonte: Juliana Dos Santos, 2026-04-09"
- Informações de reunião: incluir participantes e data no frontmatter `fonte:`
- Perguntas em aberto em tabela padronizada: `| # | Pergunta | Responsável | Status |`

## Pipeline — Numeração

O pipeline tem exatamente **9 etapas** (E01–E09). Ao referenciar:
- Use `E0N` para etapas 1-9 (com zero à esquerda)
- Cada etapa vive em `docs/pipeline/etapas/E0N-nome.md`
- O índice está em `docs/pipeline/sku-lifecycle.md`

## Commits

- Conventional Commits em português
- Prefixo por tipo: `docs(pipeline):`, `docs(conceito):`, `docs(prd):`, `docs(rfc):`, `docs(adr):`
