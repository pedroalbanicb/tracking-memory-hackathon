---
tags: [tracking, pipeline, etapa, pricing, go, admin, precificacao, site, api-oferta]
etapa: 8
titulo: Ativação Pricing (Site)
status: integrado
origem: API Oferta — GET /v1/Preco/Sku/PrecoVenda (campo raiz Valido)
escopo: 1P apenas
updated: 2026-04-15
fonte: Juliana Dos Santos; Ricardo Tadeu Lima; Douglas Souza Wolff — reunião 09/04/2026
---

# E08 — Ativação Pricing (Site)

> Etapa que verifica se o SKU tem preço ativo no canal digital. **Integração definida:** campo `Valido` (raiz da resposta) da **API Oferta** — `GET /v1/Preco/Sku/PrecoVenda?IdsSku={idSku}`. Escrita das flags pelo GO e/ou Admin (confirmado Juliana Dos Santos, 09/04/2026).

## Visão Geral

| Atributo | Valor |
|----------|-------|
| Etapa | 8 de 9 |
| Sistema de Escrita | **GO / Admin** (quem seta as flags) |
| Sistema de Leitura | **API Oferta** — `GET /v1/Preco/Sku/PrecoVenda` |
| Campo de integração | `Valido` (raiz da resposta) — `true` = pricing ativo |
| Status do Mapeamento | ✅ Integrado — endpoint e campo confirmados |
| Etapa anterior | [[E07-produzido-loja]] |
| Próxima etapa | [[E09-exibicao-site-loja]] |

> ℹ️ **Fonte: Juliana Dos Santos (2026-04-09):** sistemas de escrita confirmados como **GO e/ou Admin**. Integração de leitura definida via **API Oferta** campo `Valido` — 2026-04-15.

---

## Como Obter os Dados

| Método | Detalhe |
|--------|---------|
| Endpoint | `GET /v1/Preco/Sku/PrecoVenda?IdsSku={idSku}` |
| Base URL (CB hlg) | `https://api-oferta-casasbahia-hlg.viavarejo.com.br` |
| Header | `accept: text/plain` |
| Campo de decisão | `Valido` — campo na **raiz** da resposta (não dentro de `PrecoVenda`) |
| Chave de rastreamento | `idSku` (query param) |
| Frequência de atualização | Por evento (acionado manualmente no GO/Admin) |

```bash
curl -X 'GET' \
  'https://api-oferta-casasbahia-hlg.viavarejo.com.br/v1/Preco/Sku/PrecoVenda?IdsSku={idSku}' \
  -H 'accept: text/plain'
```

---

## Campos / Schema

### Campo de Integração — API Oferta

| Caminho no JSON | Tipo | Valor esperado | Descrição | Status |
|----------------|------|---------------|-----------|--------|
| `Valido` | boolean | `true` | Campo raiz — indica se a resposta de preço é válida (SKU com pricing ativo) | ✅ Confirmado |

#### Exemplo de Resposta

```json
{
  "PrecoSkus": [
    {
      "PrecoVenda": {
        "IdSku": 4132,
        "DisponibilidadeVenda": true,
        "DisponibilidadeEstoque": true,
        ...
      }
    }
  ],
  "Valido": true,
  "Mensagens": [],
  "Protocolo": "947b6f26-f62f-48e7-a0e3-263b0774fffa"
}
```

> ⚠️ `Valido` está na **raiz** da resposta — não confundir com campos dentro de `PrecoSkus[*].PrecoVenda`.

### Backgroud — Flags SQL (Sistema de Escrita)

> As flags SQL abaixo são o que o GO/Admin **escreve** internamente. A leitura do tracking usa a API Oferta (campo `Valido`), que agrega essas flags.

| Tabela SQL | Flag | Valor esperado | Descrição |
|-----------|------|---------------|-----------|
| `SkuLojista` | `FlagAtiva` | `= 1` | Ativa o lojista para venda no canal |
| `SkuLojistaPreço` | `FlagAtiva` | `= 1` | Ativa o preço de venda por canal (site/app) |

### Campos de Domínio (conceitual)

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `precificado_site` | boolean | `Valido = true` na API Oferta | ✅ Confirmado |
| `preco_venda_site` | decimal | `PrecoSkus[0].PrecoVenda.Preco` | ✅ Disponível na resposta |
| `bandeira` | enum (`CB`/`EX`/`PF`) | Base URL da API varia por bandeira | 🟡 A confirmar endpoints EX/PF |
| `origem_preco` | string | Sistema que originou o preço (GO / Admin) | Hipótese |

### Multi-Bandeira

> Preços podem variar por bandeira — CB (Casas Bahia), EX (Extra), PF (Ponto Frio).
> A base URL da API Oferta varia por bandeira — verificar separadamente.

| Bandeira | Base URL (hlg) | Verificar separadamente? |
|----------|---------------|--------------------------|
| CB | `https://api-oferta-casasbahia-hlg.viavarejo.com.br` | Sim |
| EX | 🟡 A confirmar | Sim |
| PF | 🟡 A confirmar | Sim |

---

## Para Que Esses Dados São Usados

- **Verificar se o SKU tem preço ativo** — `Valido = true` na API Oferta
- **Identificar SKUs sem precificação** — gargalo frequente antes de lançamento
- **Análise por bandeira**: SKU precificado em CB mas não em EX — visibilidade cruzada
- **Alimentar [[E09-exibicao-site-loja]]** — precificação é pré-requisito para exibição

---

## Regras de Negócio

- **A flag de ativação de pricing é exclusiva do canal online (site/app)** — confirmado por Juliana Dos Santos (09/04/2026)
- **Campo `Valido` = `true`** na raiz da resposta da API Oferta indica pricing ativo para o SKU
- **Loja física sempre tem preço** — usa o preço base como fallback; tracking foca na flag online _(Juliana: "dá para focar nessa flag mesmo")_
- SKU sem `Valido = true` **não aparece** para compra no site ([[E09-exibicao-site-loja]])
- A precificação pode ser **por bandeira** — um SKU pode estar ativo em CB e inativo em EX
- Quando a flag é ativada no pricing, o **Rundeck** propaga para `SKU.ativa` e depois para `Produto.ativa` (~1 minuto). Ver [[regras-exibicao-sku]]
- **API Oferta requer região** — ao consultar o preço via API sem especificar a região, o retorno pode ser "indisponível". Não é bug — é configuração (o SKU pode ter sido configurado apenas para venda regional)

---

## Gaps / Perguntas em Aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | Quais são os base URLs da API Oferta para EX e PF (hlg e prd)? | Time Oferta | 🟡 CB confirmado — EX/PF a confirmar |
| 2 | Como identificar as regiões de venda de um SKU para evitar falso "indisponível"? | Time Oferta | Aberto |
| 3 | Existe evento Kafka publicado quando um SKU é precificado? | Time Plataforma | Aberto |

---

## Próximos Passos

- [ ] Confirmar base URLs da API Oferta para EX e PF
- [ ] Confirmar como obter as regiões de venda de um SKU (evitar falso "indisponível" por região)
- [x] **Interface de leitura definida** — API Oferta, campo `Valido` — 2026-04-15
- [x] Flag de pricing confirmada como **exclusiva do site** — Juliana Dos Santos, 09/04/2026
- [x] Loja física sempre tem preço (fallback) — tracking foca na flag online
- [x] API Oferta requer região — Ricardo Tadeu Lima, 09/04/2026

---

## Referências

- [[sku-lifecycle]] — Pipeline completo
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [[E06-produzido]] — Etapa anterior
- [[E09-exibicao-site-loja]] — Próxima etapa
