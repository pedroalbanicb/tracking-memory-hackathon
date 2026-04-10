## E06/E07 — Admin Discovery (Etapas Vazias)

**Labels:** `P1-high`, `documentation`, `needs-sme`, `admin`  
**Estimate:** 4-8 horas  
**Assignee:** @juliana-dos-santos
**SME Required:** Time Conteúdo / Admin

### Problema
E06 e E07 têm estrutura completa de documento mas **zero informação confirmada**. São as etapas menos mapeadas do vault inteiro.

**Current State:**
- E06 (Produzido Site): 90% dos campos são hipotéticos
- E07 (Produzido Loja): Praticamente idêntico ao E06
- Ambos citam sistema "Admin" sem URL, API ou detalhes técnicos

---

## Issue A: E06 — Produção Site (Admin Discovery)

### Research Questions

#### 🔍 Sistema Admin
- [ ] **Qual sistema exato** controla `Produto.FlagExibeSite`?
- [ ] **URL do Admin:** Onde acessar? Qual ambiente?
- [ ] **Documentação técnica:** API docs, manual, responsável
- [ ] **Time responsável:** Quem mantém o Admin?

#### 🔍 Processo de Produção
- [ ] **Processo manual ou automático** para aprovar SKU para site?
- [ ] **Quem executa:** Content Manager? Sistema? Workflow?
- [ ] **Critérios de aprovação:** O que faz um SKU ser aprovado?
- [ ] **Tempo típico:** Quanto demora de E05→E06?

#### 🔍 Validação Técnica 
- [ ] **Query real** para verificar status atual de SKUs em produção
- [ ] **Logs/auditoria:** Como rastrear mudanças de flag?
- [ ] **Dependências:** E06 depende de E05 (estoque) obrigatoriamente?

### Expected Deliverables
```markdown
## Sistema
- **Nome:** [Real system name]
- **URL:** [Access URL]
- **API:** [Endpoint if exists]
- **Responsável:** [Team/Person]

## Processo
- **Tipo:** Manual/Automático
- **Executor:** [Role/Person]
- **Critérios:** [Approval criteria]
- **SLA:** [Typical duration]

## Dados
- **Query verificação:** [Real SQL]
- **Campos confirmados:** [Actual field names]
- **Logs:** [Audit trail location]
```

---

## Issue B: E07 — Produção Loja Física

### Research Questions

#### 🔍 Comparação com E06
- [ ] **Mesmo sistema Admin** usado para site e loja física?
- [ ] **Processos diferentes:** Critérios específicos para loja?
- [ ] **Flags separadas:** `FlagExibeSite` vs `FlagExibeLoja`?
- [ ] **Times diferentes:** Quem aprova cada um?

#### 🔍 Específico Loja Física
- [ ] **Distribuição:** Como chega nos sistemas de loja?
- [ ] **Regionalização:** Aprovação por região/loja específica?
- [ ] **Integração PDV:** Como conecta com sistema de caixa?

### Consolidation Decision
- [ ] **Avaliar se E06+E07 devem ser um documento único** com seções Site/Loja
- [ ] **Ou manter separados** se processos forem muito diferentes

---

## Acceptance Criteria

### Documentation Quality
- [ ] Seção "Sistema" preenchida com dados reais (não hipotéticos)
- [ ] Processo descrito com responsáveis identificados
- [ ] Queries SQL testadas e confirmadas
- [ ] Campo `fonte:` no frontmatter com responsável e data
- [ ] Status `confirmed` no frontmatter

### Technical Validation  
- [ ] Admin system accessible/documented
- [ ] API endpoints identified (if exist)
- [ ] Test queries return real data
- [ ] Integration points mapped

### Business Process
- [ ] Approval workflow documented
- [ ] SLAs identified
- [ ] Responsible teams confirmed
- [ ] Escalation process defined

### Next Steps
- [ ] **Se sistemas forem idênticos:** Consolidar E06+E07
- [ ] **Se diferentes:** Manter separados com cross-references
- [ ] **Link para E08:** Como E06/E07 alimentam ativação de pricing

**Dependencies:** Acesso ao time/sistema Admin  
**Blocker Potential:** Alto (E06/E07 são etapas essenciais do pipeline)