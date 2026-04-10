---
tags: [meta, backlog, melhorias, vault, tracking]
tipo: backlog
status: triagem
updated: 2026-04-10
autor: Pedro Martins
---

# Backlog de Melhorias — Vault Tracking GO

> Itens identificados na varredura de 09/04/2026. Maioria resolvido em 10/04. Restam os itens abaixo.

---

## 1. E06 e E07 — Praticamente idênticos, muito vazios

**Arquivos:** [[E06-produzido]], [[E07-produzido-loja]]
**Problema:** Ambos têm estrutura completa mas quase zero informação confirmada. A maioria dos campos é hipotética. São as etapas menos mapeadas do vault.
**Ação:** Após discovery do Admin (Juliana / Time Conteúdo), preencher ou condensar em um único doc com duas seções (Site vs Loja).
**Impacto:** Médio — etapas do pipeline que precisam de dados reais.
**Depende de:** PENDENCIAS S1, S2, S3.

---

## ✅ Resolvido em 10/04/2026

| # | Item | Resolução |
|---|------|-----------|
| 1 | E02 — nomenclatura legada `ok_fiscal` | Reescrito com `FlagCompraBloqueada`/`FlagVendaBloqueada` |
| 2 | sku-lifecycle — distinção "Tax Web (escrita) → API Catálogo (leitura)" | Padronizado em todos os locais |
| 3 | mapeamento-arquivos.md incompleto | Inventário atualizado com RFC-003/004, tags, datas |
| 4 | RFC-003 e RFC-004 não existiam | Stubs criados com contexto |
| 5 | E03 — falta `fonte` no frontmatter | Adicionado |
| 6 | sku-lifecycle sem link para discovery-status | Adicionado |
| 7 | overview.html não auditado | Corrigido (E7→E8, footer date) |
| 8 | mock/data.json coerência | Verificado — já estava limpo |
| 4 | RFC-003/004 stubs | P2 | Após decisão API vs SQL |
| 3 | mapeamento-arquivos incompleto | P2 | Quando houver tempo |
| 1 | E02 nomenclatura | P3 | Próxima sessão |
| 9 | mock/data.json coerência | P3 | Antes do demo |
| 2 | sku-lifecycle E02 origem | P3 | Próxima sessão |
| 6 | E03 frontmatter fonte | P3 | Quick fix |
| 7 | Wikilink discovery-status | P3 | Quick fix |
| 8 | overview.html audit | P3 | Quando houver tempo |

---

## 🔍 Levantamento de Termos Estranhos / Fora de Contexto

> Varredura de 09/04/2026. Termos sem definição, nomenclatura ambígua ou incoerente identificados ao longo de todos os documentos (E01–E09, conceitos, RFC). Requer confirmação humana com os especialistas de domínio.

---

### 🔴 Crítico — Alto risco de ambiguidade ou erro na implementação

---

#### T01 — ~~`FLAVIA`~~ ✅ Resolvido 10/04 — erro de transcrição

**Arquivo:** [[E09-exibicao-site-loja]], [[regras-exibicao-sku]]  
**Resolução:** "FLAVIA atualiza" na transcrição da reunião = "flag atualiza" = flag atualizada automaticamente via pulso de estoque. Não é um sistema real. Tag removida do E09. Referências corrigidas para "flag atualizada via pulso de estoque".

---

#### T02 — `ok_fiscal = 'S'/'N'` (campo fantasma com semântica invertida)

**Arquivo:** [[E02-validacao-fiscal]]  
**Problema:** O campo **não existe na API** (o próprio doc explica isso). Ainda assim, a seção "Regras de Negócio" usa `ok_fiscal` como se fosse real, com semântica invertida: `ok_fiscal = 'N'` significa "fiscal OK, elegível" — `'N'` de "Não bloqueado". Lógica contra-intuitiva que pode causar inversão de lógica na implementação.  
**Ação:** Reescrever todas as regras usando `FlagCompraBloqueada = 0` (campo real). Remover `ok_fiscal` completamente.  
**Responsável:** Desenvolvedor / Pedro Martins

---

#### T03 — ~~`SKLogista` vs `SkuLojista`~~ ✅ Resolvido 10/04

**Arquivo:** [[sku-lifecycle]], [[regras-exibicao-sku]], [[validacao-sincronizacao-sql-mongo]] usam `SKLogista`; [[E08-ativacao-pricing]], [[E09-exibicao-site-loja]] usam `SkuLojista`.  
**Problema:** A mesma tabela SQL aparece com dois nomes distintos em documentos do mesmo vault.  
**Pergunta:** Qual é o nome real da tabela no banco de dados?  
**Responsável:** Douglas Souza Wolff / Time Oferta

---

#### T04 — `SkuLojistaPreço` (acento em nome de tabela SQL)

**Arquivo:** [[E08-ativacao-pricing]], [[E09-exibicao-site-loja]]  
**Problema:** Nome de tabela SQL com caractere especial (`ç`). Extremamente incomum em bancos relacionais. Pode ser: o nome real (legacy), um alias conceitual documentado como se fosse real, ou a mesma tabela `SkuLojista` com schema diferente. O gap #1 do E08 confirma a dúvida sem resolução.  
**Pergunta:** Qual o nome exato da tabela? `SkuLojistaPreço` existe literalmente no banco?  
**Responsável:** Douglas Souza Wolff / Time Oferta

---

### 🟡 Ambíguo — Presente nos docs mas sem definição formal

---

#### T05 — `MONGOS` (sistema sem introdução formal)

**Arquivo:** [[E09-exibicao-site-loja]], [[regras-exibicao-sku]], [[decisao-fonte-dados-tracking]]  
**Problema:** Escrito em CAPS como se fosse um sistema proprietário interno. Na arquitetura MongoDB, `mongos` é o roteador de sharding — pode ser o nome do ambiente, do cluster ou do componente. Nunca formalmente definido no vault.  
**Pergunta:** É um cluster específico? O componente mongos de sharding? Um apelido de ambiente (ex: "MongoDB de Produção")?  
**Responsável:** Ricardo Tadeu Lima / Time Infra

---

#### T06 — `handeck` nos tags de E09 (typo de `rundeck`)

**Arquivo:** [[E09-exibicao-site-loja]] — frontmatter `tags:`  
**Problema:** O tag `handeck` consta nos metadados oficiais de E09. O arquivo [[regras-exibicao-sku]] já documenta a correção ("Handeck corrigido para Rundeck"), mas o tag errado permanece em E09, poluindo o graph view do Obsidian.  
**Ação:** Substituir `handeck` por `rundeck` nos tags de E09.  
**Responsável:** Pedro Martins (quick fix)

---

#### T07 — `BAAN` / `LN (Infor)` / `Workbench` (três nomes para o mesmo contexto)

**Arquivo:** [[E03-proposta-comercial]]  
**Problema:** BAAN é o ERP legado; LN (Infor) é o sucessor. São usados como sinônimos ("tabelas BAAN do LN"). "Workbench" é citado como interface ("Workbench: Mapa de Comercialização → Contrato de Compras") sem definição — é um módulo? Sistema interno? Interface do LN? Os tags do E03 incluem `baan`, `ln` e `infor` como três termos separados sem hierarquia.  
**Pergunta:** O sistema chama BAAN ou LN? O Workbench é um módulo do LN ou sistema independente?  
**Responsável:** Time de Integração / GO

---

#### T08 — `er.Tipo = 'BT'` (significado desconhecido)

**Arquivo:** [[E05-estoque]], [[regras-estoque-inventario]]  
**Problema:** Aparece na query SQL como filtro opcional. Significado desconhecido — hipótese no doc é "Backorder Transfer", sem confirmação. Outros valores possíveis do campo nunca foram mapeados.  
**Pergunta:** O que significa `'BT'`? Quais outros valores existem para `EstoqueRestricao.Tipo`?  
**Responsável:** Time Abastecimento

---

#### T09 — `FlagSkuSaldoDisponivel` (tabela contraditória)

**Arquivo:** [[E09-exibicao-site-loja]], [[regras-exibicao-sku]]  
**Problema:** Douglas Souza Wolff atribui essa flag à tabela `Sku`, mas a query SQL sugere que pertence à `SkuLojista`. Ambos os docs marcam a contradição sem resolução.  
**Pergunta:** Essa flag pertence a `Sku` ou `SkuLojista`?  
**Responsável:** Douglas Souza Wolff / Time Oferta

---

#### T10 — `FlagAtivaERP` (qual ERP, qual "reconhecimento"?)

**Arquivo:** [[E09-exibicao-site-loja]]  
**Problema:** Descrita como "Flag de ativação no ERP — necessária para reconhecimento". Não especifica qual ERP (LN? SAP? Outro), nem o que falha quando é `0`.  
**Pergunta:** Qual ERP? O que exatamente deixa de funcionar quando essa flag está inativa?  
**Responsável:** Ricardo Tadeu Lima / Time Plataforma

---

#### T11 — `CategoriaNeto` (nomenclatura informal de hierarquia)

**Arquivo:** [[E09-exibicao-site-loja]], [[regras-exibicao-sku]]  
**Problema:** O nível `c2` da hierarquia de Categoria é documentado como "CategoriaNeto (ou nível intermediário)". O termo "Neto" (grandchild) não é nomenclatura padrão de catálogo de e-commerce.  
**Pergunta:** Qual o nome oficial desse nível no sistema de categorias?  
**Responsável:** Time de Catálogo / Douglas Souza Wolff

---

#### T12 — Tabela `Marca` como origem da flag

**Arquivo:** [[E09-exibicao-site-loja]], [[regras-exibicao-sku]]  
**Problema:** A query SQL atribui a flag `FlagAtiva` à tabela `Marca`, mas precisa confirmação se essa é realmente a tabela de origem. Ambos os docs indicam "a confirmar".  
**Pergunta:** Na query SQL real, `p2` realmente aponta para `Marca`?  
**Responsável:** Douglas Souza Wolff

---

#### T13 — `Pulso de estoque` (mecanismo indefinido)

**Arquivo:** [[E09-exibicao-site-loja]], [[regras-exibicao-sku]]  
**Problema:** Usado como mecanismo conhecido para propagar `Produto.FlagExibe` automaticamente. Nunca definido: qual sistema gera esse pulso? É um evento Kafka? Um job periódico? Qual a frequência?  
**Pergunta:** O que é o "pulso de estoque"? Qual sistema o emite e com qual frequência?  
**Responsável:** Ricardo Tadeu Lima / Time Plataforma

---

#### T14 — ~~`Corp` (sistema sem definição)~~ — ✅ Resolvido 10/04/2026

**Arquivo:** [[E09-exibicao-site-loja]] (campo "Origem"), [[decisao-fonte-dados-tracking]]  
**Resolução:** Corp = SQL Server corporativo (banco SQL compartilhado). Não é API, não é time, não é sistema separado. É o banco relacional que todos usam. O linked server `CORP_PRD` referencia esse mesmo banco.  
**Fonte:** Pedro Martins, 10/04/2026

---

### 🟠 Inconsistência / Anomalia Documental

---

#### T15 — `Tax Web` (sistema nunca formalmente introduzido)

**Arquivo:** [[E02-validacao-fiscal]]  
**Problema:** Mencionada como sistema de origem como `TaxWeb` e `Tax Web` (com e sem espaço, inconsistente). Nunca foi introduzida ou descrita — é sistema interno? Produto de terceiro? Qual time é responsável?  
**Responsável:** Time Fiscal / Juliana Dos Santos

---

#### T16 — `Admin` (mesmo nome em 3 etapas diferentes — é o mesmo sistema?)

**Arquivo:** [[E06-produzido]], [[E07-produzido-loja]], [[E08-ativacao-pricing]]  
**Problema:** O sistema "Admin" aparece como origem em produção de conteúdo de site, loja e ativação de pricing. É o mesmo sistema nas 3 etapas? É uma plataforma? Um módulo? Nenhum endpoint ou referência técnica identificada em nenhuma das três.  
**Pergunta:** "Admin" é um sistema único? Existe API do Admin? Qual o nome técnico do serviço?  
**Responsável:** Juliana Dos Santos

---

#### T17 — `Manhattan WMS` (citado só no frontmatter de E05, sem presença no corpo)

**Arquivo:** [[E05-estoque]]  
**Problema:** O frontmatter tem tag `wms` e nota "sistema confirmado como Manhattan WMS", mas o **corpo do documento** não menciona Manhattan WMS em nenhum momento. O origin oficial da etapa é "Banco Inventario (SQL)". Existe relação entre os dois?  
**Pergunta:** O banco `Inventario` é gerenciado pelo Manhattan WMS? São a mesma coisa?  
**Responsável:** Juliana Dos Santos / Time Abastecimento

---

#### T18 — `OMS` (sigla usada sem introdução)

**Arquivo:** [[E05-estoque]]  
**Problema:** Dois gaps em E05 mencionam consulta ao OMS para estoque regional, mas OMS não é definido, nem aparece em nenhum outro documento do vault.  
**Pergunta:** O que é OMS? Order Management System? Qual sistema/serviço específico?  
**Responsável:** Time OMS / Plataforma

---

#### T19 — Dois "Douglas" como fonte sem diferenciação clara

**Arquivo:** [[decisao-fonte-dados-tracking]]  
**Problema:** O documento cita `Douglas Souza Wolff` e `Douglas Willian De Castro` com posições distintas no debate. Qualquer referência futura a "Douglas disse..." é imediatamente ambígua. Falta cargo/área para diferenciar.  
**Ação:** Adicionar contexto de área ou papel de cada Douglas nas citações.  
**Responsável:** Pedro Martins (quick fix)

---

#### T20 — `id_mapa_comercializacao` (campo hipotético documentado como schema)

**Arquivo:** [[E03-proposta-comercial]]  
**Problema:** Campo listado na tabela de Schema como "Referência ao mapa comercial no LN" mas marcado como "a confirmar" e nunca testado via API. Está na tabela de schema ao lado de campos confirmados, sem distinção visual suficiente.  
**Ação:** Mover para seção separada de "Campos Hipotéticos / Não Confirmados".  
**Responsável:** Pedro Martins / Time Catálogo

---

### Tabela-Resumo — Prioridade de Refinamento

| ID | Termo | Arquivo(s) | Prioridade | Responsável |
|----|-------|-----------|-----------|-------------|
| T01 | ~~`FLAVIA`~~ | E09, regras-exibicao | ✅ Resolvido | Pedro Martins — 10/04 |
| T02 | `ok_fiscal` (campo fantasma) | E02 | 🔴 Alta | Pedro Martins |
| T03 | ~~`SKLogista` vs `SkuLojista`~~ | múltiplos | ✅ Resolvido | Pedro Martins — 10/04 |
| T04 | `SkuLojistaPreço` (acento em tabela) | E08, E09 | 🔴 Alta | Douglas Wolff / Time Oferta |
| T05 | `MONGOS` (sem definição) | E09, conceitos | 🟡 Média | Ricardo / Time Infra |
| T06 | `handeck` nos tags de E09 | E09 | 🟡 Média | Pedro Martins (quick fix) |
| T07 | BAAN / LN / Workbench | E03 | 🟡 Média | Time Integração / GO |
| T08 | `er.Tipo = 'BT'` | E05, regras-estoque | 🟡 Média | Time Abastecimento |
| T09 | `FlagSkuSaldoDisponivel` (tabela?) | E09, regras-exibicao | 🟡 Média | Douglas Wolff |
| T10 | `FlagAtivaERP` (qual ERP?) | E09 | 🟡 Média | Ricardo / Time Plataforma |
| T11 | `CategoriaNeto` (informal) | E09, regras-exibicao | 🟡 Média | Time Catálogo |
| T12 | Tabela `Marca` (a confirmar) | E09, regras-exibicao | 🟡 Média | Douglas Wolff |
| T13 | `Pulso de estoque` (indefinido) | E09, regras-exibicao | 🟡 Média | Ricardo / Time Plataforma |
| T14 | ~~`Corp` (sistema?)~~ | E09, decisao-fonte | ✅ Resolvido | Pedro Martins — Corp = SQL Server corporativo |
| T15 | `Tax Web` (não introduzida) | E02 | 🟠 Baixa | Juliana Dos Santos |
| T16 | `Admin` (mesmo sistema em 3?) | E06, E07, E08 | 🟠 Baixa | Juliana Dos Santos |
| T17 | `Manhattan WMS` (só no frontmatter) | E05 | 🟠 Baixa | Juliana / Abastecimento |
| T18 | `OMS` (não definido) | E05 | 🟠 Baixa | Time OMS / Plataforma |
| T19 | ~~Dois "Douglas" ambíguos~~ | decisao-fonte | ✅ Resolvido | Pedro Martins — nomes completos + papel |
| T20 | `id_mapa_comercializacao` (hipotético) | E03 | 🟠 Baixa | Pedro Martins / Catálogo |
