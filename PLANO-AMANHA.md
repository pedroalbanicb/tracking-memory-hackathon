# 📋 Plano de Trabalho — Amanhã (10/04/2026)

> **Status:** Reorganizado após análise completa do backlog  
> **Total:** 35 itens identificados | 6 templates criados | Pronto para distribuição

---

## 🚨 P1 — Crítico (Implementação)

### 1. E06/E07 — Admin Discovery (VAZIO)
**Responsável:** @juliana-dos-santos  
**Estimate:** 4-8h  
**Problema:** Etapas completas mas ZERO dados reais confirmados  
**Action:** Research sistema Admin, processo, campos reais

### 2. Nomenclatura SQL Crítica  
**Responsável:** @douglas-souza-wolff  
**Estimate:** 2-4h  
**Problemas:**
- `ok_fiscal = 'S'/'N'` → **campo fantasma** (não existe na API)
- `SKLogista` vs `SkuLojista` → **samme tabela, nomes diferentes**  
- `SkuLojistaPreço` → **acento em SQL** (real?)

---

## 🔧 P2 — Research & Validação

### 3. Sistemas Indefinidos
**Responsável:** @ricardo-tadeu-lima  
**Estimate:** 3-6h  
**Research:**
- **MONGOS** vs **Corp** (E09 origin)
- **BAAN/LN/Workbench** → 3 nomes, mesmo sistema?
- **Admin multi-etapas** → sistema único ou vários?

### 4. Validação Técnica SQL
**Responsável:** @douglas-souza-wolff  
**Estimate:** 2-4h  
**Validate:**
- Alias `p2` → realmente aponta para `Marca`?
- `FlagSkuSaldoDisponivel` → tabela `Sku` ou `SkuLojista`?
- Query E09 → executar em DEV, verificar performance

### 5. Termos Críticos c/ Risco
**Distribuir:** Multiple SMEs  
**Estimate:** 6-10h total  
**Urgent:**
- **FLAVIA** → sistema real ou speech-to-text erro?
- **Tax Web** → sistema internal, vendor, ou time?
- **OMS** → qual sistema específico?
- **Manhattan WMS** → relação c/ Banco Inventário?

---

## 🧹 P3 — Quick Fixes (< 30 min cada)

### 6. Correções Imediatas
**Responsável:** Qualquer dev  
**Tasks:**
- [ ] `handeck` → `rundeck` nos tags E09
- [ ] Adicionar `fonte:` no frontmatter E03  
- [ ] Link [[discovery-status]] em sku-lifecycle
- [ ] Padronizar "Tax Web → API Catálogo (leitura)"
- [ ] Diferenciar dois Douglas nas citações

### 7. RFC Stubs (broken links)
**Estimate:** 15 min  
**Tasks:**
- [ ] Criar `RFC-003-estoque.md` (stub)
- [ ] Criar `RFC-004.md` (stub)  
- [ ] Fix broken wikilinks no Obsidian

---

## 📊 P3 — Organização & Assets

### 8. Inventário Completo
**Estimate:** 1-2h  
**Tasks:**
- [ ] Completar `docs/mapeamento-arquivos.md` (só tem 3 files)
- [ ] Review mock/data.json → remover `ok_fiscal`, usar campos reais
- [ ] Audit overview.html → coerência c/ docs atuais

---

## 🎯 Estratégia de Distribuição

### Por Responsável

| Pessoa | P1 + P2 Hours | P3 Tasks | Total Load |
|--------|---------------|-----------|------------|
| **@douglas-souza-wolff** | 4-8h | SQL validation | High |
| **@juliana-dos-santos** | 4-8h | Admin discovery | High |  
| **@ricardo-tadeu-lima** | 3-6h | Sistemas research | Medium |
| **Time Abastecimento** | 2-3h | Manhattan/OMS research | Medium |
| **Time Fiscal** | 1-2h | Tax Web definition | Low |
| **Desenvolvedores** | 1-2h | Quick fixes (P3) | Low |

### Por Tipo de Trabalho

| Tipo | Count | Description |
|------|-------|-------------|
| **Research** | 15 items | SME interviews, system discovery |
| **Validation** | 8 items | SQL queries, field verification |  
| **Quick Fix** | 7 items | Documentation corrections |
| **Organization** | 5 items | File management, assets |

---

## 📅 Cronograma Sugerido

### Amanhã (10/04) — Manhã
- [ ] **P1 Research start:** Juliana (Admin), Douglas (SQL crítico)
- [ ] **P3 Quick fixes:** Qualquer dev disponível
- [ ] **Coordination:** Setup SME meetings

### Amanhã (10/04) — Tarde  
- [ ] **P2 Research:** Ricardo (systems), Teams específicos
- [ ] **P2 Validation:** Douglas SQL testing
- [ ] **P3 Organization:** Inventory, mock data

### Sexta (11/04) — Consolidação
- [ ] **Knowledge transfer** entre researches
- [ ] **Update documentation** with findings
- [ ] **Review gaps** remaining
- [ ] **Plan next iteration**

---

## ⚡ Actions Imediatos

### Hoje Ainda (09/04)
- [ ] **Share plano** with team leads
- [ ] **Schedule SME meetings** for tomorrow
- [ ] **Distribute P3 quick fixes** (paralelo)  

### Primeira Coisa Amanhã
- [ ] **P1 start:** Admin discovery + SQL crítico
- [ ] **Access setup:** DEV database for Douglas
- [ ] **Contact escalation:** SME availability check

---

## 🎮 Templates Prontos (Fallback)

Se problemas de SME availability ou access:

**Structured interviews ready:** `.github/issues/`
- 02-nomenclatura-critica.md → SQL validation script
- 03-admin-discovery.md → Business process interview  
- 04-sistemas-indefinidos.md → Systems architecture mapping
- 05-validacao-tecnica.md → Technical validation checklist

**Manual execution:** Copy/paste questionnaires for structured research

---

**🏆 Goal:** 80% dos critical/high items resolvidos até sexta  
**🎯 Success criteria:** P1 completed, P2 majorily resolved, P3 cleaned up  
**📋 Tracking:** Daily progress updates no canal team