---
tags: [adr, tracking, agendamento, estoque, hackathon]
status: accepted
data: 2026-04-15
autores: [Guilherme Maesta Domke de Thomaz]
rfc-relacionada:
updated: 2026-04-15
---

# ADR-007 — E04 (Agendamento) Espelha Status de E05 (Estoque)

**Status:** Accepted  
**Data:** 2026-04-15  
**Autores:** Guilherme Maesta Domke de Thomaz  
**RFC relacionada:** N/A  
**ADRs anteriores:** [[ADR-004-integracao-api-oferta-e05-e08]]

---

## Contexto

A etapa E04 (Agendamento) representa o agendamento do SKU no sistema LN/Neogrid. Atualmente, não temos acesso à fonte de dados desta etapa — a integração com LN/Neogrid está pendente e não há prazo definido para disponibilização.

No modelo de listagem atual (`POST /api/v1/tracking/skus/listar`), o campo `agendamento` retorna `null` para todos os SKUs porque o repositório `TrackingAgendamentoRepositorio` lança `NotImplementedException`.

O agendamento (E04) é pré-requisito direto do estoque (E05): um SKU só entra em estoque depois de ter passado pelo processo de agendamento com o fornecedor. Portanto, se um SKU tem estoque disponível (`DisponibilidadeEstoque = true`), pode-se inferir com segurança que o agendamento foi realizado. O inverso também vale: sem estoque, assume-se que o agendamento não ocorreu ou não foi concluído.

Fonte do raciocínio: pipeline de 9 etapas documentado em [[E04-agendamento]] e [[E05-estoque]].

---

## Decisão

**Decidimos:** exibir o status de E04 (Agendamento) com o mesmo valor de E05 (Estoque) na listagem de tracking.

Implementação: no método `MapearParaItemAsync` do `TrackingSkuListaService`, o campo `Agendamento` recebe o mesmo valor já computado para `estoque` a partir da API Oferta (`DisponibilidadeEstoque`).

```csharp
// Antes
Agendamento = null,

// Depois
Agendamento = estoque,
```

Não há nova integração, novo repositório nem nova chamada HTTP — é puramente uma reatribuição de campo dentro do mapeamento já existente.

---

## Consequências

### Positivas
- E04 deixa de retornar `null`, melhorando a UX da listagem de tracking
- Inferência correta e conservadora: baseada em dependência de etapas do pipeline
- Zero overhead de performance — nenhuma chamada adicional

### Negativas / Trade-offs
- É uma aproximação: pode existir um SKU agendado sem estoque (ex.: atraso de fornecedor). Nesses casos, E04 mostrará `false` mesmo que o agendamento tenha ocorrido
- A fonte real (LN/Neogrid) não é consultada — a decisão é temporária até a integração ser viável

### Neutras
- O `TrackingAgendamentoRepositorio` e o `TrackingAgendamentoService` permanecem intactos (não são chamados no fluxo de listagem)
- Quando a integração real for implementada, este espelhamento deve ser removido

---

## Alternativas Rejeitadas

| Alternativa | Motivo de rejeição |
|-------------|-------------------|
| Manter `null` | Prejudica a UX — o usuário vê uma lacuna sem informação útil |
| Integrar LN/Neogrid agora | Fonte indisponível, cronograma incerto |
| Retornar `true` fixo | Incorreto para SKUs sem estoque — falso positivo |

## Referências

- [[E04-agendamento]]
- [[E05-estoque]]
- [[ADR-004-integracao-api-oferta-e05-e08]]
