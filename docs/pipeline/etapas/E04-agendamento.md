---
tags: [tracking, pipeline, etapa, agendamento, ln, neogrid]
etapa: 4
titulo: Agendamento
status: mapeado-parcialmente
origem: LN / Neogrid
escopo: 1P apenas
updated: 2026-04-09
fonte: Juliana Dos Santos
---

# E04 — Agendamento

> Etapa em que o agendamento de recebimento/entrega do produto é realizado. Origem confirmada em **LN (Infor) e/ou Neogrid**. Método de integração ainda não mapeado.

## Visão Geral

| Atributo             | Valor                                          |
| -------------------- | ---------------------------------------------- |
| Etapa                | 4 de 9                                         |
| Sistema de Origem    | **LN (Infor) / Neogrid**                       |
| Status do Mapeamento | **Sistema identificado — integração a mapear** |
| Etapa anterior       | [[E03-proposta-comercial]]                     |
| Próxima etapa        | [[E05-estoque]]                                |

---

## Como Obter os Dados

| Método | Detalhe |
|--------|---------|
| Sistema | **LN (Infor)** e/ou **Neogrid** |
| Interface | ⚠️ A definir — API LN, integração EDI Neogrid, banco ou evento? |
| Frequência de atualização | A definir |
| Chave de rastreamento | `id_sku` (presumido) |

> ℹ️ **Fonte: Juliana Dos Santos (2026-04-09).** Sistemas confirmados: **LN (Infor) e/ou Neogrid**. É possível que LN gerencie o contrato de agendamento e a Neogrid faça a comunicação EDI com o fornecedor — a confirmar com o time responsável.

---

## Campos / Schema

> Campos ainda não mapeados. Hipóteses iniciais abaixo — a confirmar.

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `agendamento_realizado` | boolean | Indica se o agendamento foi feito | Hipótese |
| `data_agendamento` | datetime | Data prevista ou realizada do agendamento | Hipótese |
| `tipo_agendamento` | enum | Entrega, retirada, crossdocking, etc. | Hipótese |

---

## Para Que Esses Dados São Usados

> A ser definido após mapeamento. Hipóteses:

- **Confirmar que há um cronograma de disponibilização** do SKU antes do estoque
- **Calcular lead-time** entre contrato comercial ([[E03-proposta-comercial]]) e agendamento
- **Identificar SKUs sem agendamento** — possíveis bloqueios operacionais
- Pode ser **N/A** para SKUs digitais ([[E01-cadastro-inicial]] → `tipo_produto = 'Digital/Download'`)

---

## Regras de Negócio

> A ser definido. Questões abertas abaixo.

- Produtos do tipo `Digital/Download` provavelmente **pulam esta etapa**
- Produtos `Crossdocking` podem ter agendamento diferenciado (direto com fornecedor)
- A relação com [[E05-estoque]] ainda não está clara — agendamento ocorre antes ou junto?

---

## Gaps / Perguntas em Aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | ~~Qual sistema gerencia o agendamento de produtos?~~ | GO / Operações | ✅ Respondido — LN (Infor) e Neogrid. Fonte: Juliana Dos Santos (09/04) |
| 2 | O agendamento é obrigatório para todos os tipos de produto? | GO | Aberto |
| 3 | Existe integração entre agendamento e estoque (E05)? | Time Integração | Aberto |
| 4 | Há API ou evento publicado quando um agendamento é criado? | Time Plataforma | Aberto |
| 5 | Para quais tipos de produto esta etapa é N/A? | GO / Produto | Aberto |

---

## Próximos Passos

- [ ] Agendar discovery com time de Operações / GO para mapear esta etapa
- [ ] Atualizar este documento após o discovery

---

## Referências

- [[sku-lifecycle]] — Pipeline completo
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [[E03-proposta-comercial]] — Etapa anterior
- [[E05-estoque]] — Próxima etapa
