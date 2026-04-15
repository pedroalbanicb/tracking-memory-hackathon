---
tags: [tracking, checklist, diario]
status: ativo
updated: 2026-04-15
---

# ✅ Checklist Diário — Tracking GO

> Atualizado em 15/04/2026. Só itens abertos. Pendências detalhadas em [[PENDENCIAS]].

---

## 🚨 P1 — Aberto (dependem de SMEs)

### ~~Admin Discovery (Juliana)~~ — ✅ Resolvido via API Catálogo (ADR-003)
- [x] E06/E07: `FlagSkuProduzido` e `FlagSkuProduzidoLojaFisica` lidos via `GET /api/v1/produto-sku/selecionar`

### E04 — Agendamento (Alonso Dias Assuncao)
- [ ] Documentar fluxo LN/Neogrid recebido do Alonso
- [ ] Confirmar integração via Databricks ou query SQL direta

### E09 — Exibição (Douglas Wolff / Ricardo Tadeu)
- [ ] Decisão: API vs SQL Corp vs MONGOS para flags de exibição
- [ ] Verificar se `SkuLojistaPreço` existe (nome com acento)
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

## ✅ Concluído em 2026-04-15 (Hackathon)

- E05: implementado via API Oferta (`DisponibilidadeEstoque` em `PrecoSkus[0].PrecoVenda`)
- E08: implementado via API Oferta (`Valido` na raiz)
- E06/E07: implementados via API Catálogo (`FlagSkuProduzido`, `FlagSkuProduzidoLojaFisica`)
- ADR-002, ADR-003: promovidas para `Accepted`
- ADR-004: Oferta E05/E08 — `Accepted`
- ADR-005: Análise IA Gemini (repo stub, implementação Gemini pendente)
- ADR-006: Componente frontend AnaliseIA — `Proposed`
- SKILL.md: tabela de etapas e decisões pendentes atualizadas
- discovery-status.md: E05/E08 marcadas como ✅ implementado

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
