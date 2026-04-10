## Quick Fixes — Inconsistências Documentais

**Labels:** `P3-low`, `fix`, `quick-fix`  
**Estimate:** 15-30 min cada  
**Assignee:** Qualquer dev (distribuição livre)

### Problema
Inconsistências menores identificadas na varredura de 09/04/2026 que podem ser resolvidas rapidamente sem necessidade de research.

### Tasks

#### ✅ Task 1: Corrigir `handeck` → `rundeck` em E09 frontmatter
**File:** `docs/pipeline/etapas/E09-exibicao-site-loja.md`  
**Action:** No frontmatter YAML, substituir tag `handeck` por `rundeck`

```yaml
# ANTES:
tags: [pipeline, etapa-09, exibicao, site, loja, corp, mongos, handeck]

# DEPOIS:  
tags: [pipeline, etapa-09, exibicao, site, loja, corp, mongos, rundeck]
```

#### ✅ Task 2: Adicionar campo `fonte:` no frontmatter de E03
**File:** `docs/pipeline/etapas/E03-proposta-comercial.md`  
**Action:** Adicionar campo fonte no YAML frontmatter

```yaml
# Adicionar:
fonte: "curl testado em 09/04/2026; API Catálogo"
```

#### ✅ Task 3: Adicionar wikilink [[discovery-status]] em sku-lifecycle
**File:** `docs/pipeline/sku-lifecycle.md`  
**Action:** Adicionar referência ao final do documento

```markdown
## Acompanhamento

Para status atualizado do discovery de cada etapa, consulte [[discovery-status]].
```

#### ✅ Task 4: Padronizar "Tax Web → API Catálogo (leitura)" 
**Files:** `docs/pipeline/sku-lifecycle.md`, `docs/pipeline/etapas/E02-validacao-fiscal.md`  
**Action:** Padronizar formato de origem em todas as referências

```
# Formato padrão:
Tax Web → API Catálogo (leitura)
```

### Acceptance Criteria
- [ ] Tags do E09 não contêm `handeck`
- [ ] E03 frontmatter tem campo `fonte` válido
- [ ] sku-lifecycle referencia discovery-status
- [ ] Formato Tax Web → API Catálogo consistente em todo o vault
- [ ] Links wikilink funcionam no Obsidian

### Files Changed
- `docs/pipeline/etapas/E09-exibicao-site-loja.md`
- `docs/pipeline/etapas/E03-proposta-comercial.md`
- `docs/pipeline/sku-lifecycle.md`
- `docs/pipeline/etapas/E02-validacao-fiscal.md`

**Priority:** P3 (não bloqueia nada, melhoria de qualidade)