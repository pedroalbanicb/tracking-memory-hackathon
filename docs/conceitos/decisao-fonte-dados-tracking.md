---
tags: [conceito, decisao, arquitetura, tracking, sql-corp, sql, mongodb, MONGOS]
tipo: decisao-pendente
status: em-aberto
updated: 2026-04-09
fonte: Douglas Souza Wolff; Ricardo Tadeu Lima; Douglas Willian De Castro — reunião 09/04/2026
---

# Decisão — Fonte de Dados do Tracking: API vs SQL Direto

> Debate arquitetural aberto em 09/04/2026. **Sem decisão até o momento.**
> Impacta a etapa [[E09-exibicao-site-loja]] e todas as flags de exibição.

---

## Contexto

O sistema de tracking precisa verificar se as flags de exibição de um SKU estão ativas. Existem dois planos onde esses dados existem:

| Plano | Sistema | O que representa |
|-------|---------|-----------------|
| **API / Site** | API Oferta ou MONGOS (MongoDB de Pricing) | O que o **cliente e o gestor enxergam** no site |
| **SQL direto** | Banco relacional — `SkuLojista`, `Sku`, `Produto`, etc. | **Fonte de verdade** — onde os dados são escritos originalmente |

---

## Posições na Reunião

### Douglas Souza Wolff — Usar API (o que está "por cima")

> *"Talvez a gente precisasse vir por cima, sem bater direto nesse caso aí, porque o que está em cima é o que o cliente enxerga e é o que o gestor está enxergando ali também. 'Ah, não está no site, beleza.' Porque que API não tá voltando? Aí aí a investigação, entendeu."*

**Argumento:** O tracking deve refletir a **experiência real do usuário**. Se a API não retorna um SKU, é o que importa para o gestor. A investigação começa depois, a partir da divergência detectada.

**Risco identificado pelo próprio Douglas Souza Wolff (SQL/flags):** *"Pegando direto da API, pode ser que problemas de Integração — API não esteja funcionando — e aí a gente vai dar falso positivo."*

### Ricardo Tadeu Lima — SQL é a fonte de verdade (usado no checkout)

> *"O checkout, quando você for fechar a compra, em alguns steps lá ele deixa de validar a API e pega direto no SQL. Ele vem direto no SQL aqui para saber se a informação está realmente populada. Isso justamente para evitar vendas indevidas."*

**Argumento:** O SQL é a fonte que o sistema crítico (checkout) usa para evitar vendas incorretas. É o dado real.

### Douglas Willian De Castro — Falso positivo em qualquer dos lados

> *"É, de qualquer coisa ele vai ter esse caso de falso positivo."*

**Observação:** Nenhuma das duas opções elimina completamente o risco de falso positivo.

---

## Trade-offs

| Critério | Via API | Via SQL Direto |
|----------|---------|---------------|
| Coerência com o que o cliente vê | ✅ Alta | ⚠️ Pode divergir (replicação pendente) |
| Coerência com a realidade dos dados | ⚠️ Depende da integração | ✅ Alta (fonte de verdade) |
| Risco de falso positivo | 🔴 Se API falhar | 🟡 Se estiver em prod mas não replicado |
| Complexidade de integração | Depende de endpoint disponível | Query SQL ou proc disponível (já usada no checkout) |
| Alinhamento com experiência do gestor | ✅ O gestor usa o site | ⚠️ Pode mostrar "ok" enquanto site não exibe |
| Uso já estabelecido na plataforma | — | ✅ Checkout já usa SQL direto |

---

## Abordagem Alternativa — Dois Planos (V2)

> Ver [[validacao-sincronizacao-sql-mongo]] — detectar divergências entre SQL e MongoDB como funcionalidade de evolução.

No MVP, o tracking mostra **um** dos dois planos. Na V2, é possível comparar ambos e sinalizar divergências explicitamente para o gestor.

---

## Status da Decisão

| Campo | Valor |
|-------|-------|
| Status | 🔴 **Em aberto** |
| Decisão até | — |
| Responsáveis | Time de Plataforma / Douglas Willian De Castro (arquitetura) / Douglas Souza Wolff (SQL/flags) |
| Impacto | Arquitetura da integração de [[E09-exibicao-site-loja]] |
| Relacionado | [[validacao-sincronizacao-sql-mongo]], [[E09-exibicao-site-loja]], [[regras-exibicao-sku]] |

---

## Próximos Passos

- [ ] Alinhar posição final com Douglas Willian De Castro (arquitetura) e Douglas Souza Wolff (SQL/flags)
- [ ] Verificar se existe endpoint que retorne as flags consolidadas por SKU (SQL Corp ou API Oferta)
- [ ] Confirmar se a query SQL usada no checkout pode ser reutilizada no tracking
- [ ] Registrar decisão final aqui e atualizar frontmatter `status: decidido`
