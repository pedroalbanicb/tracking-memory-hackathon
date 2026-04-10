## Nomenclatura Crítica — Campos com Risco de Implementação

**Labels:** `P1-high`, `fix`, `needs-validation`  
**Estimate:** 2-4 horas  
**Priority:** Crítico (pode causar bugs na implementação)

### Problema
Campos documentados que não existem na API real ou têm nomenclatura contraditória que pode gerar inversão de lógica na implementação.

---

## Issue A: E02 — Remover campo fantasma `ok_fiscal`

### Context
**File:** `docs/pipeline/etapas/E02-validacao-fiscal.md`

**Problem:** 
- Campo `ok_fiscal = 'S'/'N'` **não existe na API real**
- Seção "Regras de Negócio" usa `ok_fiscal` como se fosse real
- Semântica invertida: `ok_fiscal = 'N'` = "fiscal OK" (confuso)
- Schema real usa `FlagCompraBloqueada = 0/1` e `FlagVendaBloqueada = 0/1`

### Tasks
- [ ] **Reescrever seção "Regras de Negócio"** usando campos reais:
  - `FlagCompraBloqueada = 0` → elegível para compra
  - `FlagVendaBloqueada = 0` → elegível para venda
- [ ] **Remover todas as referências** a `ok_fiscal` no documento
- [ ] **Validar alinhamento** entre Schema e Regras de Negócio
- [ ] **Verificar outros docs** que possam referenciar `ok_fiscal`

### Before/After Example
```markdown
# ANTES (campo fantasma):
- ok_fiscal = 'N' → fiscal OK, elegível
- ok_fiscal = 'S' → bloqueado por validação fiscal

# DEPOIS (campos reais):
- FlagCompraBloqueada = 0 AND FlagVendaBloqueada = 0 → elegível
- FlagCompraBloqueada = 1 OR FlagVendaBloqueada = 1 → bloqueado
```

---

## Issue B: Padronizar `SKLogista` vs `SkuLojista`

### Context
Mesma tabela SQL referenciada com dois nomes diferentes em documentos do vault.

**Files affected:**
- `sku-lifecycle.md`, `regras-exibicao-sku.md` → usam `SKLogista`
- `E08-ativacao-pricing.md`, `E09-exibicao-site-loja.md` → usam `SkuLojista`

### Research Needed
- [ ] **Conectar no banco** e verificar nome real da tabela
- [ ] **Verificar se `SkuLojistaPreço` existe literalmente** (nome com acento é incomum)
- [ ] **Verificar se há múltiplas tabelas** ou é a mesma com schemas diferentes

### Tasks
- [ ] **Query no banco:** `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%Lojista%'`
- [ ] **Unificar nomenclatura** em todo o vault usando nome correto
- [ ] **Resolver dúvida `SkuLojistaPreço`** (gap #1 do E08)
- [ ] **Atualizar todos os aliases SQL** conforme nome real

### Assignee
**@douglas-souza-wolff** (mencionado como referência técnica nos docs)

### Acceptance Criteria
- [ ] Nome da tabela confirmado via consulta SQL real
- [ ] Nomenclatura unificada em todo o vault
- [ ] Todos os aliases SQL (`sl`, etc.) documentados corretamente
- [ ] Gap #1 do E08 resolvido

### Risk
🔴 **Alto** - Implementação pode usar nome de tabela errado