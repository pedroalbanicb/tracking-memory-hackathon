## Validação Técnica — Campos e Queries SQL

**Labels:** `P2-medium`, `validation`, `sql`, `technical`  
**Estimate:** 2-4 horas  
**Assignee:** @douglas-souza-wolff

### Problema
Campos documentados com contradições, aliases SQL duvidosos, e queries que precisam de validação em ambiente real.

---

## Issue A: SQL Aliases Validation (E09)

**Priority:** P2-high (E09 é etapa crítica final)

### Context
**File:** `docs/pipeline/etapas/E09-exibicao-site-loja.md`, `docs/conceitos/regras-exibicao-sku.md`

Vários aliases SQL marcados com `*` (a confirmar) que podem estar incorretos.

### Validation Tasks

#### 🔍 Alias `p2` → `Marca`
```sql
-- Current documentation claims:
-- p2.* → Marca table
-- BUT p2 prefix usually means Produto
```
- [ ] **Test real query:** Verificar se `p2` realmente aponta para `Marca`
- [ ] **Alternative:** Se `p2` é `Produto`, qual alias correto para `Marca`?
- [ ] **Update docs:** Corrigir alias documentation

#### 🔍 `FlagSkuSaldoDisponivel` — Table Ownership
```sql
-- Contradiction documented:
-- Douglas S. Wolff says: belongs to `Sku` table
-- But SQL alias is `sl` → which is alias for `SkuLojista`
```
- [ ] **DESCRIBE table:** `DESCRIBE Sku` and `DESCRIBE SkuLojista`
- [ ] **Verify field:** Which table actually contains `FlagSkuSaldoDisponivel`
- [ ] **Update attribution:** Correct the documentation

#### 🔍 Complete E09 Query Test
- [ ] **Execute real query** from E09 documentation in DEV environment
- [ ] **Verify all aliases:** Ensure all `p.*`, `sl.*`, `m.*` etc. are correct
- [ ] **Performance check:** Query execution time acceptable?
- [ ] **Result validation:** Returns expected data structure

---

## Issue B: EstoqueRestricao Research

**Priority:** P2-medium  

### Context
**File:** `docs/pipeline/etapas/E05-estoque.md`

```sql
-- Current filter (meaning unknown):
WHERE er.Tipo = 'BT'  -- Hypothesis: "Backorder Transfer"
```

### Research Tasks
- [ ] **Connect to database:** Access `EstoqueRestricao` table
- [ ] **Enum values:** `SELECT DISTINCT Tipo FROM EstoqueRestricao`
- [ ] **Document meanings:** What does each `Tipo` value mean?
- [ ] **BT confirmation:** Confirm if `'BT'` means "Backorder Transfer"
- [ ] **Impact analysis:** How does `Tipo` filter affect tracking results?

```sql
-- Expected research query:
SELECT 
  Tipo, 
  COUNT(*) as count,
  MIN(DataCriacao) as oldest,
  MAX(DataCriacao) as newest
FROM EstoqueRestricao 
GROUP BY Tipo
ORDER BY count DESC;
```

---

## Issue C: Multi-Table Name Resolution 

**Dependencies:** Issue #2 (Nomenclatura Crítica)

### `SkuLojista` vs `SKLogista` vs `SkuLojistaPreço`
- [ ] **Real table names:** `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%Lojista%'`
- [ ] **Schema comparison:** Compare structures if multiple tables exist
- [ ] **Alias standards:** Document correct aliases for each table

### Test Queries
```sql
-- Verify table existence:
SELECT TABLE_NAME, TABLE_SCHEMA 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME LIKE '%Lojista%';

-- If SkuLojistaPreço exists (name with accent):
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'SkuLojistaPreço';
```

---

## Issue D: E09 Integration Test

**Priority:** P2-high

### Complete Data Flow Validation
- [ ] **End-to-end test:** From SQL query to tracking result
- [ ] **Performance:** Query execution time in real environment
- [ ] **Data quality:** Sample results match expected schema
- [ ] **Missing data:** Identify gaps in real vs documented data

### Test Script Template
```sql
-- E09 Complete Test Query (to be refined based on validation)
SELECT 
  s.SkuId,
  p.ProdutoId,
  p.FlagExibeSite,
  p.FlagExibeLoja,
  sl.FlagAtivo,
  sl.FlagSkuSaldoDisponivel,  -- Verify table ownership
  m.MarcaNome,               -- Verify p2 alias
  c1.CategoriaNome as CategoriaRaiz,
  c2.CategoriaNome as CategoriaNeto
FROM Sku s
  JOIN Produto p ON s.ProdutoId = p.ProdutoId
  JOIN SkuLojista sl ON s.SkuId = sl.SkuId  -- Verify table name
  JOIN Marca m ON p.MarcaId = m.MarcaId     -- Verify alias
  JOIN Categoria c1 ON p.CategoriaId = c1.CategoriaId
  LEFT JOIN Categoria c2 ON c1.CategoriaPaiId = c2.CategoriaId
WHERE s.SkuId = 123456  -- Test with known SKU
LIMIT 10;
```

---

## Acceptance Criteria

### Documentation Updates
- [ ] All SQL aliases in E09 confirmed and corrected
- [ ] `FlagSkuSaldoDisponivel` table ownership resolved
- [ ] `EstoqueRestricao.Tipo` enum values documented
- [ ] Real table names confirmed (SkuLojista variants)

### Technical Validation
- [ ] E09 query executes successfully in DEV
- [ ] Performance acceptable (< 5 seconds for single SKU)
- [ ] Data structure matches documented schema
- [ ] No SQL errors or warnings

### Knowledge Transfer
- [ ] Document real database access method
- [ ] Share connection details with team (securely)
- [ ] Update [[regras-exibicao-sku]] with confirmed info
- [ ] Remove all `*` (a confirmar) markers from docs

---

## Database Access Requirements

**Environment:** DEV database preferred (avoid production load)  
**Permissions:** READ-only access sufficient  
**Tables needed:** `Sku`, `Produto`, `SkuLojista`, `Marca`, `Categoria`, `EstoqueRestricao`  
**Coordination:** With DBA team for access setup

**Risk Mitigation:** 
- Use LIMIT clauses for all test queries
- Document query execution times
- No DML operations (INSERT/UPDATE/DELETE)