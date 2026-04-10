## Research — Sistemas e Termos Indefinidos

**Labels:** `P2-medium`, `research`, `needs-sme`  
**Estimate:** 3-6 horas  
**Distribution:** Pode ser dividido entre 2-3 pessoas por responsável

### Problema
Sistemas citados nos docs sem definição formal ou introdução. Geram ambiguidade para implementação e debugging.

---

## Issue A: MONGOS vs Corp — Sistemas E09

**Priority:** P2-high (E09 é etapa final crítica)  
**Assignee:** @ricardo-tadeu-lima

### Context
**File:** `docs/pipeline/etapas/E09-exibicao-site-loja.md`

Sistema origem documentado como "Corp / MONGOS" mas ambos nunca foram formalmente definidos.

### Research Questions

#### 🔍 MONGOS
- [ ] **O que é MONGOS?** 
  - Cluster MongoDB específico?
  - Componente `mongos` de sharding?
  - Apelido de ambiente ("MongoDB de Produção")?
- [ ] **Como acessar:** Connection string, ambiente, responsável
- [ ] **Estrutura:** Quantos shards, configuração, collections relevantes

#### ✅ Corp — Resolvido 10/04/2026
- [x] **O que é "Corp"?** → SQL Server corporativo (banco SQL compartilhado). Não é API, não é time.
  - ~~API Corp específica?~~
  - Linked server `[CORP_PRD.dc.nova,1310]` referencia esse mesmo banco
  - ~~Time/tribe Corp?~~
  - ✅ Banco corporativo
- [x] **Como obter dados:** Query SQL direto no Corp (mesmo banco do checkout)
- [x] **Responsável:** Time Plataforma / Infra BD

#### 🔍 Integração Corp + MONGOS
- [ ] **Fluxo de dados:** Corp → MONGOS? Ou consulta paralela?
- [ ] **Frequência sync:** Real-time, batch, sob demanda
- [ ] **Como tracking acessa:** API única? Múltiplas consultas?

### Expected Output
```markdown
## MONGOS
- **Definição:** [Cluster/Component/Environment]
- **Access:** [Connection details]
- **Collections:** [Relevant collections for tracking]
- **Owner:** [Team responsible]

## Corp
- **Definição:** SQL Server corporativo (banco relacional compartilhado)
- **Access:** Query SQL / linked server CORP_PRD
- **Data:** Flags de exibição (SkuLojista, Sku, Produto, Marca, Categoria)
- **Owner:** Time Plataforma / Infra BD

## Integration
- **Data Flow:** SQL Corp (fonte de verdade) → MONGOS (réplica MongoDB para o site)
- **Frequency:** Por evento (Rundeck + pulso de estoque)
- **Tracking Access:** A definir — query SQL direto ou via MONGOS
```

---

## Issue B: BAAN/LN/Workbench — Nomenclatura E03

**Priority:** P2-medium  
**Assignee:** Time Integração/GO

### Context
**File:** `docs/pipeline/etapas/E03-proposta-comercial.md`

Três termos (`BAAN`, `LN`, `Workbench`) usados como sinônimos sem hierarquia clara.

### Research Questions
- [ ] **Sistema atual:** BAAN (legacy) ou LN (Infor)?
- [ ] **Workbench:** Módulo do LN? Sistema independente? Interface específica?
- [ ] **Tags corretos:** Devem ser `baan, ln, infor` separados ou hierárquicos?
- [ ] **Nomenclatura padrão:** Como equipe se refere no dia-a-dia?

### Tasks
- [ ] **Entrevistar time GO:** Qual nomenclatura técnica oficial
- [ ] **Padronizar referências** em E03 usando termo correto
- [ ] **Atualizar tags frontmatter** com hierarquia correta
- [ ] **Documentar relação** BAAN→LN migration se relevante

---

## Issue C: Admin Multi-Sistema (E06/E07/E08)

**Priority:** P2-high (conecta com Issue #03)  
**Assignee:** @juliana-dos-santos

### Context
Sistema "Admin" aparece como origem em 3 etapas diferentes:
- **E06:** Produção Site
- **E07:** Produção Loja  
- **E08:** Ativação Pricing

### Research Questions
- [ ] **Mesmo sistema?** Admin é uma plataforma única para as 3 etapas?
- [ ] **Sistemas diferentes:** 3 "Admins" distintos com mesmo nome?
- [ ] **Módulos:** Admin tem módulos Site/Loja/Pricing?
- [ ] **Nome técnico:** Qual o nome real do sistema/serviço?

### Dependencies
**Blocks:** Issue #03 (Admin Discovery)  
**Coordination:** Research paralelo mas consolidar resultados

---

## Issue D: Menor Priority — Outros Termos

### EstoqueRestricao (`er.Tipo = 'BT'`)
**File:** `docs/pipeline/etapas/E05-estoque.md`
- [ ] Significado de `'BT'` (hipótese: "Backorder Transfer")
- [ ] Outros valores possíveis do campo `Tipo`
- [ ] **Assignee:** Time Abastecimento

### OMS (Order Management System)
**File:** `docs/pipeline/etapas/E05-estoque.md`  
- [ ] Qual sistema OMS específico (não genérico)
- [ ] Como integration com estoque regional
- [ ] **Assignee:** Time OMS/Plataforma

### Manhattan WMS vs Banco Inventario
**File:** `docs/pipeline/etapas/E05-estoque.md`
- [ ] Relação entre Manhattan WMS (frontmatter) e Banco Inventario (corpo doc)
- [ ] São o mesmo sistema? WMS gerencia o banco?
- [ ] **Assignee:** Time Abastecimento

---

## Distribution Strategy

**High Priority (fazer primeiro):**
- Issue A (MONGOS/Corp) → @ricardo-tadeu-lima
- Issue C (Admin Multi-Sistema) → @juliana-dos-santos

**Medium Priority (paralelo):**
- Issue B (BAAN/LN) → Time GO  
- Issue D items → Times específicos quando disponíveis

**Coordination:** Weekly sync para consolidar insights between issues