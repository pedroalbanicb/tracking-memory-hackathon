## Inventário e Coerência de Assets

**Labels:** `P3-low`, `documentation`, `maintenance`  
**Estimate:** 1-2 horas  
**Assignee:** Distribuição livre (tarefas independentes)

### Problema
Artefatos incompletos e possível desalinhamento entre mock data e documentação real.

---

## Issue A: Complete File Inventory

**Priority:** P3-low  
**Estimate:** 30-45 min

### Context
**File:** `docs/mapeamento-arquivos.md`

Inventário atual cobre apenas 3 arquivos (README, RFC-002, overview.html). Vault tem 30+ arquivos importantes.

### Tasks

#### 📋 Expand Inventory
- [ ] **Add all E01-E09 files** with status and completion percentage
- [ ] **Add conceitos/** directory files
- [ ] **Add PRD/** directory files  
- [ ] **Add ADR/** directory files
- [ ] **Add RFC/** files (including stubs)

#### 📋 Metadata per File
For each file, document:
- [ ] **Status:** (draft/review/confirmed/needs-research)
- [ ] **Completion:** (estimated % complete)
- [ ] **Last Updated:** (date)
- [ ] **Sources:** (people/systems referenced)
- [ ] **Dependencies:** (blocks/blocked by other docs)

#### 📋 Evaluation vs discovery-status.md
- [ ] **Compare with discovery-status.md:** Avoid duplication
- [ ] **Decision:** Keep both, merge, or deprecate mapeamento-arquivos?
- [ ] **Cross-reference:** If keeping both, add wikilinks

### Template Structure
```markdown
## Pipeline Documentation
| File | Status | Complete | Updated | Sources |
|------|--------|----------|---------|----------|
| E01-cadastro-inicial.md | ✅ Confirmed | 95% | 2026-04-09 | Juliana Dos Santos |
| E02-validacao-fiscal.md | ⚠️ Nomenclatura issue | 85% | 2026-04-09 | API Catálogo |
| ... | ... | ... | ... | ... |

## Concept Documentation
| File | Status | Complete | Updated | Sources |
|------|--------|----------|---------|----------|
| regras-exibicao-sku.md | ✅ Confirmed | 90% | 2026-04-09 | Douglas Souza Wolff |
| ... | ... | ... | ... | ... |
```

---

## Issue B: Mock Data Consistency

**Priority:** P3-medium  
**Estimate:** 1 hour

### Context
**Files:** `mock/data.json`, `overview.html`

Mock data may contain outdated field names (ex: `ok_fiscal` instead of `FlagCompraBloqueada`).

### Tasks

#### 🔍 Data Structure Audit
- [ ] **Open `mock/data.json`** and identify all field names
- [ ] **Compare with current docs:** Cross-reference with E01-E09 schemas
- [ ] **Identify mismatches:** Fields that changed names or don't exist
- [ ] **Document gaps:** Missing fields that should be in mock

#### 🔧 Data Updates
- [ ] **Replace deprecated fields:**
  ```json
  // BEFORE:
  "ok_fiscal": "N"
  
  // AFTER:
  "FlagCompraBloqueada": 0,
  "FlagVendaBloqueada": 0
  ```
- [ ] **Add missing fields:** Based on confirmed schemas
- [ ] **Update sample values:** Ensure realistic test data
- [ ] **Validate JSON:** Ensure valid syntax after changes

#### 🎨 overview.html Integration
- [ ] **Test overview.html** with updated mock data
- [ ] **Check rendering:** Ensure UI still works correctly
- [ ] **Update labels/displays:** If field names changed in UI
- [ ] **Verify all 9 stages** are represented in mock data

### Expected Changes
```json
// Example updates needed:
{
  "sku_id": 123456,
  "etapas": {
    "E02": {
      // OLD:
      "ok_fiscal": "N",
      
      // NEW:
      "FlagCompraBloqueada": 0,
      "FlagVendaBloqueada": 0,
      "status": "elegivel"
    },
    "E08": {
      // Verify table name:
      "tabela": "SkuLojista",  // or "SKLogista"?
      "preco_ativo": true
    }
  }
}
```

---

## Issue C: RFC Stubs Creation

**Priority:** P3-low  
**Estimate:** 15-20 min

### Context
Broken wikilinks in Obsidian graph view for referenced but non-existent RFCs.

**References:**
- `E05-estoque.md` → [[RFC-003-estoque]]
- `E08-ativacao-pricing.md`, `E09-exibicao-site-loja.md` → possible RFC-004

### Tasks
- [ ] **Create RFC-003-estoque.md** using template from `RFC/template.md`
- [ ] **Create RFC-004 stub** (determine focus: pricing integration?)
- [ ] **Minimal content:** Just frontmatter + "TBD" body to fix links
- [ ] **Update references:** Ensure wikilinks work in Obsidian

### Template Use
```yaml
---
tags: [rfc, estoque, tbd]
status: placeholder
created: 2026-04-09
author: TBD
---

# RFC-003: Estoque Integration

> **Status:** TBD - Placeholder criado para resolver broken wikilinks

## Problema
(To be defined based on E05 research)

## Proposta
(To be defined)
```

---

## Acceptance Criteria

### File Inventory
- [ ] `mapeamento-arquivos.md` contains all vault files
- [ ] Each file has status, completion%, update date, sources
- [ ] Relationship with `discovery-status.md` clarified
- [ ] No duplicate documentation maintenance

### Mock Data
- [ ] `mock/data.json` uses current field names (no `ok_fiscal`)
- [ ] All documented fields represented in mock
- [ ] `overview.html` renders correctly with updated data
- [ ] Mock data reflects all 9 pipeline stages

### RFC Stubs
- [ ] No broken wikilinks in Obsidian graph view
- [ ] RFC-003 and RFC-004 placeholder files exist
- [ ] Templates used correctly (proper frontmatter)
- [ ] References from E05/E08/E09 work correctly

### Quality Check
- [ ] All JSON files valid syntax
- [ ] All markdown files valid frontmatter YAML
- [ ] No orphan files or broken internal references
- [ ] Graph view in Obsidian shows clean connections

**Dependencies:** None (independent tasks)  
**Distribution:** 3 tasks can be assigned to different people