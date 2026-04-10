# ✅ Checklist Diário — Tracking GO

## 🚨 P1 CRITICAL (Must Complete)

### Admin Discovery (Juliana)
- [ ] Identificar sistema Admin real (URL, nome técnico)
- [ ] Processo E06 (Produzido Site) - manual ou automático?
- [ ] Processo E07 (Produzido Loja) - mesmo sistema ou diferente?  
- [ ] Query real para verificar flags de produção
- [ ] Responsáveis e times por etapa

### SQL Critical (Douglas)  
- [ ] **URGENT:** Remover `ok_fiscal = 'S'/'N'` das regras E02
- [ ] **URGENT:** Confirmar nome real: `SKLogista` ou `SkuLojista`?
- [ ] Verificar se `SkuLojistaPreço` existe (nome com acento)
- [ ] Test query E09 em DEV environment
- [ ] Validar aliases: `p2` → `Marca`? `sl` → qual tabela?

## 🔧 P2 RESEARCH

### Systems (Ricardo)
- [ ] **MONGOS** - cluster, componente, ou ambiente?
- [ ] **Corp** - API, time, ou linked server?
- [ ] **BAAN/LN/Workbench** - nomenclatura atual do time

### Technical Validation (Douglas)
- [ ] Execute query real E09 em DEV
- [ ] Performance check (< 5s aceitável)
- [ ] `FlagSkuSaldoDisponivel` - tabela `Sku` ou `SkuLojista`?
- [ ] `EstoqueRestricao.Tipo` - outros valores além de `'BT'`?

### SME Research (Teams)
- [ ] **Tax Web** (Time Fiscal) - sistema interno ou vendor?
- [ ] **Manhattan WMS** (Abastecimento) - relação c/ Banco Inventário?
- [ ] **OMS** (Plataforma) - qual sistema específico?
- [ ] **FLAVIA** (Plataforma) - sistema real ou speech-to-text erro?

## ⚡ P3 QUICK FIXES (Any Dev)

### Documentation  
- [ ] Fix `handeck` → `rundeck` em E09 tags
- [ ] Add `fonte:` field no E03 frontmatter
- [ ] Add wikilink [[discovery-status]] em sku-lifecycle  
- [ ] Padronizar "Tax Web → API Catálogo (leitura)" format

### Organization
- [ ] Create RFC-003-estoque.md stub
- [ ] Create RFC-004.md stub
- [ ] Complete file inventory em mapeamento-arquivos.md
- [ ] Update mock/data.json - remove `ok_fiscal`, add real fields

### Editorial  
- [ ] Differentiate "Douglas S. Wolff" vs "Douglas W. Castro"
- [ ] Review overview.html consistency
- [ ] Fix any remaining broken wikilinks

---

## 📊 Daily Progress Tracker

**Day:** ___/04/2026

### Completed Today
- [ ] P1: ________________
- [ ] P1: ________________  
- [ ] P2: ________________
- [ ] P3: ________________

### Blocked/Issues
- **Blocker:** ________________
- **Resolution:** ________________
- **ETA:** ________________

### Tomorrow Priority
1. ________________
2. ________________
3. ________________

### SME Meetings Scheduled
- **Person:** ________________ **Topic:** ________________ **When:** ______
- **Person:** ________________ **Topic:** ________________ **When:** ______

---

## 🆘 Escalation Contacts

**Admin System:** @juliana-dos-santos  
**SQL/Database:** @douglas-souza-wolff  
**Infrastructure:** @ricardo-tadeu-lima  
**Emergency:** Pedro Martins (Coordination)

**Templates Available:** `.github/issues/` (detailed interview scripts)  
**Progress Tracking:** Update this checklist daily  
**Weekly Review:** Sexta 11/04 - consolidar achados