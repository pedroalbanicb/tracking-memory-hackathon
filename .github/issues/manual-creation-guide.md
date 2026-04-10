# Issues para Criar Manualmente no GitHub

## Como usar:
1. Acesse: https://github.com/casas-bahia/tracking-memory-hackathon/issues/new
2. Copie o template abaixo
3. Cole no GitHub
4. Adicione labels e assignee conforme indicado

---

## Issue #1: Quick Fixes — Inconsistências Documentais

**Labels:** `P3-low`, `fix`, `quick-fix`  
**Assignee:** (deixar em branco — distribuição livre)

```
## Quick Fixes — Inconsistências Documentais

**Estimate:** 15-30 min cada  
**Priority:** P3 (não bloqueia nada, melhoria de qualidade)

### Problema
Inconsistências menores identificadas na varredura de 09/04/2026 que podem ser resolvidas rapidamente sem necessidade de research.

### Tasks

#### ✅ Task 1: Corrigir `handeck` → `rundeck` em E09 frontmatter
**File:** `docs/pipeline/etapas/E09-exibicao-site-loja.md`  
**Action:** No frontmatter YAML, substituir tag `handeck` por `rundeck`

#### ✅ Task 2: Adicionar campo `fonte:` no frontmatter de E03
**File:** `docs/pipeline/etapas/E03-proposta-comercial.md`  
**Action:** Adicionar campo fonte no YAML frontmatter

#### ✅ Task 3: Adicionar wikilink [[discovery-status]] em sku-lifecycle
**File:** `docs/pipeline/sku-lifecycle.md`  
**Action:** Adicionar referência ao final do documento

#### ✅ Task 4: Padronizar "Tax Web → API Catálogo (leitura)"
**Files:** Varios  
**Action:** Padronizar formato de origem em todas as referências

### Acceptance Criteria
- [ ] Tags do E09 não contém `handeck`
- [ ] E03 frontmatter tem campo `fonte` válido
- [ ] sku-lifecycle referencia discovery-status
- [ ] Formato Tax Web → API Catálogo consistente em todo o vault
```

---

## Issue #2: Nomenclatura Crítica — Campos com Risco

**Labels:** `P1-high`, `fix`, `needs-validation`  
**Assignee:** `douglas-souza-wolff`

```
## Nomenclatura Crítica — Campos com Risco de Implementação

**Priority:** P1 (Crítico - pode causar bugs na implementação)
**Estimate:** 2-4 horas

### Problema A: Remover campo fantasma `ok_fiscal`
**File:** `docs/pipeline/etapas/E02-validacao-fiscal.md`

**Problem:** 
- Campo `ok_fiscal = 'S'/'N'` **não existe na API real**
- Seção "Regras de Negócio" usa `ok_fiscal` como se fosse real
- Semântica invertida: `ok_fiscal = 'N'` = "fiscal OK" (confuso)

**Tasks:**
- [ ] Reescrever seção "Regras de Negócio" usando campos reais: `FlagCompraBloqueada = 0/1`
- [ ] Remover todas as referências a `ok_fiscal`
- [ ] Validar alinhamento entre Schema e Regras de Negócio

### Problema B: Padronizar `SKLogista` vs `SkuLojista`
**Context:** Mesma tabela referenciada com dois nomes diferentes

**Research Needed:**
- [ ] Conectar no banco e verificar nome real da tabela
- [ ] Verificar se `SkuLojistaPreço` existe literalmente (nome com acento)
- [ ] Unificar nomenclatura em todo o vault usando nome correto

**Risk:** 🔴 Alto - Implementação pode usar nome de tabela errado
```

---

## Issue #3: E06/E07 — Admin Discovery (Etapas Vazias)

**Labels:** `P1-high`, `documentation`, `needs-sme`, `admin`  
**Assignee:** `juliana-dos-santos`

```
## E06/E07 — Admin Discovery (Etapas Vazias)

**Priority:** P1 (crítico para pipeline)
**Estimate:** 4-8 horas
**SME Required:** Time Conteúdo / Admin

### Problema
E06 e E07 têm estrutura completa mas **zero informação confirmada**. São as etapas menos mapeadas do vault.

### Research Questions — E06 (Produção Site)
- [ ] **Qual sistema exato** controla `Produto.FlagExibeSite`?
- [ ] **URL do Admin:** Onde acessar? Qual ambiente?
- [ ] **Processo manual ou automático** para aprovar SKU para site?
- [ ] **Query real** para verificar status atual de SKUs

### Research Questions — E07 (Produção Loja)
- [ ] **Mesmo sistema Admin** usado para site e loja física?
- [ ] **Processos diferentes:** Critérios específicos para loja?
- [ ] **Flags separadas:** `FlagExibeSite` vs `FlagExibeLoja`?

### Deliverables
- Sistema identificado com URL/API
- Processo documentado com responsáveis
- Queries SQL testadas
- Campo `fonte:` no frontmatter atualizado

**Dependencies:** Acesso ao time/sistema Admin
```

---

## Issue #4: Research — Sistemas e Termos Indefinidos

**Labels:** `P2-medium`, `research`, `needs-sme`  
**Assignee:** `ricardo-tadeu-lima`

```
## Research — Sistemas e Termos Indefinidos

**Priority:** P2 (importante para arquitetura)
**Estimate:** 3-6 horas

### Issue A: MONGOS vs Corp — Sistemas E09
**Context:** Sistema origem documentado como "Corp / MONGOS" mas ambos nunca definidos

**Research:**
- [ ] **O que é MONGOS?** (Cluster MongoDB? Componente mongos de sharding?)
- [ ] **O que é "Corp"?** (API Corp? Linked server CORP_PRD? Time?)
- [ ] **Fluxo de dados:** Corp → MONGOS? Ou consulta paralela?

### Issue B: BAAN/LN/Workbench — Nomenclatura E03
**Context:** Três termos usados como sinônimos sem hierarquia

**Research:**
- [ ] **Sistema atual:** BAAN (legacy) ou LN (Infor)?
- [ ] **Workbench:** Módulo do LN? Sistema independente?
- [ ] **Nomenclatura padrão:** Como equipe se refere no dia-a-dia?

### Issue C: Admin Multi-Sistema
**Context:** "Admin" aparece em E06/E07/E08

**Research:**
- [ ] **Mesmo sistema?** Admin é uma plataforma única para as 3 etapas?
- [ ] **Nome técnico:** Qual o nome real do sistema/serviço?
```

---

## Issue #5: Validação Técnica — Campos e Queries SQL

**Labels:** `P2-medium`, `validation`, `sql`, `technical`  
**Assignee:** `douglas-souza-wolff`

```
## Validação Técnica — Campos e Queries SQL

**Priority:** P2 (importante para implementação)
**Estimate:** 2-4 horas

### SQL Aliases Validation (E09)
**Problem:** Vários aliases SQL marcados com `*` (a confirmar)

**Tasks:**
- [ ] **Test alias `p2` → `Marca`:** Verificar se realmente aponta para Marca table
- [ ] **`FlagSkuSaldoDisponivel`:** Confirmar se pertence a `Sku` ou `SkuLojista`
- [ ] **Execute real query:** E09 documentation em DEV environment
- [ ] **Performance check:** Query execution time acceptable?

### EstoqueRestricao Research
**Context:** `WHERE er.Tipo = 'BT'` — significado desconhecido

**Tasks:**
- [ ] **Connect to database:** Access `EstoqueRestricao` table
- [ ] **Enum values:** `SELECT DISTINCT Tipo FROM EstoqueRestricao`
- [ ] **Document meanings:** What does each `Tipo` value mean?

### Multi-Table Name Resolution
**Dependencies:** Issue #2 (Nomenclatura Crítica)

**Tasks:**
- [ ] **Real table names:** Confirmar `SkuLojista` vs `SKLogista` vs `SkuLojistaPreço`
- [ ] **Schema comparison:** Compare structures if multiple tables exist

**Database Access:** DEV environment preferred, READ-only sufficient
```

---

## Issue #6: Inventário e Coerência de Assets

**Labels:** `P3-low`, `documentation`, `maintenance`  
**Assignee:** (deixar em branco — distribuição livre)

```
## Inventário e Coerência de Assets

**Priority:** P3 (organização e qualidade)
**Estimate:** 1-2 horas

### Complete File Inventory
**File:** `docs/mapeamento-arquivos.md`
**Problem:** Inventário atual cobre apenas 3 arquivos. Vault tem 30+ importantes.

**Tasks:**
- [ ] **Add all E01-E09 files** with status and completion percentage
- [ ] **Add conceitos/** directory files
- [ ] **Add PRD/** e **RFC/** files
- [ ] **Metadata per file:** Status, completion%, last updated, sources
- [ ] **Decision:** Keep vs merge with discovery-status.md

### Mock Data Consistency
**Files:** `mock/data.json`, `overview.html`
**Problem:** Mock data may contain outdated field names

**Tasks:**
- [ ] **Audit data structure:** Compare with E01-E09 schemas
- [ ] **Replace deprecated fields:** `ok_fiscal` → `FlagCompraBloqueada/VendaBloqueada`
- [ ] **Test overview.html** with updated mock data
- [ ] **Verify all 9 stages** represented in mock

### RFC Stubs Creation
**Problem:** Broken wikilinks para RFC-003/RFC-004

**Tasks:**
- [ ] **Create RFC-003-estoque.md** using template
- [ ] **Create RFC-004 stub** (pricing integration?)
- [ ] **Fix wikilinks** in Obsidian graph view

**Acceptance:** No broken links, mock data current, complete inventory
```