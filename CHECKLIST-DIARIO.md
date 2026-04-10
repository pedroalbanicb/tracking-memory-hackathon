---
tags: [tracking, checklist, diario]
status: ativo
updated: 2026-04-10
---

# ✅ Checklist Diário — Tracking GO

> Atualizado em 10/04/2026. Só itens abertos. Pendências detalhadas em [[PENDENCIAS]].

---

## 🚨 P1 — Aberto (dependem de SMEs)

### Admin Discovery (Juliana)
- [ ] Identificar sistema Admin real (URL, nome técnico)
- [ ] Processo E06 (Produzido Site) — manual ou automático?
- [ ] Processo E07 (Produzido Loja) — mesmo sistema ou diferente?
- [ ] Query real para verificar flags de produção
- [ ] Responsáveis e times por etapa

### SQL Confirmações Pendentes (Douglas Wolff)
- [ ] Verificar se `SkuLojistaPreço` existe (nome com acento)
- [ ] Test query E09 em DEV environment
- [ ] Validar aliases: `p2` → `Marca`? `sl` → qual tabela?

## 🔧 P2 — Research

### Sistemas (Ricardo)
- [ ] **BAAN/LN/Workbench** — nomenclatura atual do time

### Validação Técnica SQL (Douglas Wolff + Pedro)
- [ ] Executar query real E09 em DEV
- [ ] Performance check (< 5s aceitável)
- [ ] `FlagSkuSaldoDisponivel` — tabela `Sku` ou `SkuLojista`?
- [ ] `EstoqueRestricao.Tipo` — outros valores além de `'BT'`?

### SME Research
- [ ] **Tax Web** (Time Fiscal) — sistema interno ou vendor?
- [ ] **Manhattan WMS** (Abastecimento) — relação c/ Banco Inventário?
- [ ] **OMS** (Plataforma) — qual sistema específico?

---

## ✅ Concluído em 10/04/2026

- `ok_fiscal` removido — reescrito com `FlagCompraBloqueada`/`FlagVendaBloqueada`
- `SKLogista` → `SkuLojista` padronizado em todos os docs + overview.html
- `FLAVIA` → "flag atualiza" (erro de transcrição resolvido)
- `MONGOS` confirmado como MongoDB de Pricing
- `Corp` confirmado como SQL Server corporativo
- Fix `Handeck` → `Rundeck` em E09
- `fonte:` adicionado no E03 frontmatter
- Link [[discovery-status]] adicionado em sku-lifecycle
- "Tax Web (escrita) → API Catálogo (leitura)" padronizado
- RFC-003/RFC-004 stubs criados
- mapeamento-arquivos.md atualizado
- overview.html corrigido (E7→E8, footer)
- mock/data.json verificado — já estava limpo
- Dois Douglas desambiguados (nomes completos + papel)
- Redundância removida: PLANO-AMANHA, RESUMO-EXECUTIVO, detail stubs vazios

---

## 🆘 Escalation Contacts

**Admin System:** @juliana-dos-santos
**SQL/Database:** @douglas-souza-wolff
**Infrastructure:** @ricardo-tadeu-lima
**Coordination:** Pedro Martins
