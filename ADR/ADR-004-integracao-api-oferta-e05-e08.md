---
tags: [adr, tracking, api-oferta, estoque, pricing, hackathon]
status: accepted
data: 2026-04-15
autores: [Guilherme Thomaz]
rfc-relacionada: 
updated: 2026-04-15
---

# ADR-004 — Integração E05 e E08 via API Oferta

**Status:** Accepted  
**Data:** 2026-04-15  
**Autores:** Guilherme Maesta Domke de Thomaz  
**RFC relacionada:** N/A

---

## Contexto

O tracking de produtos precisa verificar dois estados críticos do SKU 1P:

- **E05 — Estoque:** o SKU tem estoque disponível para venda?
- **E08 — Ativação Pricing:** o SKU tem preço ativo para o canal digital?

Havia debate em aberto ([[decisao-fonte-dados-tracking]]) sobre usar **SQL direta** (tabelas do Banco Inventario e SkuLojista) ou **API** para leitura desses dados. A análise da API Oferta revelou que o endpoint `GET /v1/Preco/Sku/PrecoVenda` responde **ambas** as perguntas em uma única chamada, com campos confirmados e contrato estável.

---

## Decisão

**Decidimos:** usar a **API Oferta** como interface de leitura para E05 e E08, via o endpoint `GET /v1/Preco/Sku/PrecoVenda?IdsSku={idSku}`.

| Etapa | Campo | Localização no JSON |
|-------|-------|---------------------|
| E05 — Estoque | `DisponibilidadeEstoque` | `PrecoSkus[*].PrecoVenda.DisponibilidadeEstoque` |
| E08 — Ativação Pricing | `Valido` | Raiz da resposta |

A implementação backend seguirá os padrões da arquitetura BFF do `gestaoproduto-plataforma-api`:
- Um `ITrackingOfertaRepositorio` no domain/Contracts
- Um `TrackingOfertaRepositorio` na infra usando `IHttpClient`
- Um `ITrackingOfertaService` no domain/Contracts
- Um `TrackingOfertaService` na service layer
- Exposição via `TrackingController` no BFF

---

## Consequências

### Positivas
- **Um único endpoint para dois steps** — reduz complexidade de integração
- **Coerência com o que o cliente vê** — a API Oferta é a mesma consultada pelo site
- **Sem acesso direto ao banco** — não exige linked server, acesso ao Inventario SQL ou SkuLojista
- **Contrato claro e testável** — schema JSON documentado com exemplo real
- **Mais simples para V1** — backend pode ser implementado sem DBA ou acesso a banco de produção

### Negativas / Trade-offs
- **Falso positivo se API estiver fora** — se a API Oferta falhar, o tracking reportará incorretamente (mitigação: circuit breaker / timeout com estado de erro explícito)
- **Região**: `DisponibilidadeEstoque` pode variar por região — SKU sem configuração regional retorna `false` mesmo com estoque
- **API Oferta requer região ou retorna disponibilidade do CD principal** — comportamento a validar

### Neutras
- A leitura SQL (Inventario, SkuLojista) permanece documentada como contexto do sistema de escrita — poderá ser usada em V2 para diagnóstico e divergência

---

## Alternativas Rejeitadas

| Alternativa | Motivo de rejeição |
|-------------|-------------------|
| Query SQL direta no Banco Inventario | Requer linked server, acesso infraestrutura, complexidade de configuração por ambiente |
| Query SQL em SkuLojista / SkuLojistaPreço | Requer acesso direto ao banco de pricing, sem API intermediária |
| Kafka (evento de estoque/pricing) | Sem tópico identificado para estes eventos no escopo 1P; complexidade de state management |

---

## Arquitetura de Implementação Backend

### Camadas

```
BFF (TrackingController)
  └─ ITrackingOfertaService
       └─ ITrackingOfertaRepositorio
            └─ IHttpClient → API Oferta
```

### Interfaces (domain/Contracts)

```csharp
public interface ITrackingOfertaRepositorio
{
    Task<PrecoSkuResponse> ObterPrecoSkuAsync(int idSku, string bandeira);
}

public interface ITrackingOfertaService
{
    Task<TrackingOfertaResult> ObterEstoqueEPricingAsync(int idSku, string bandeira);
}
```

### Modelo de resposta da API Oferta (domain/Models)

```csharp
public class PrecoSkuResponse
{
    public List<PrecoSkuItem> PrecoSkus { get; set; }
    public bool Valido { get; set; }          // E08 — Ativação Pricing
    public List<string> Mensagens { get; set; }
    public string Protocolo { get; set; }
}

public class PrecoSkuItem
{
    public PrecoVendaModel PrecoVenda { get; set; }
}

public class PrecoVendaModel
{
    public int IdSku { get; set; }
    public bool DisponibilidadeEstoque { get; set; }  // E05 — Estoque
    public bool DisponibilidadeVenda { get; set; }
    public decimal Preco { get; set; }
}
```

### URLs por Bandeira

| Bandeira | Base URL (hlg) |
|----------|---------------|
| CB | `https://api-oferta-casasbahia-hlg.viavarejo.com.br` |
| EX | 🟡 A confirmar |
| PF | 🟡 A confirmar |

---

## Referências

- [[E05-estoque]] — Detalhamento do step de estoque
- [[E08-ativacao-pricing]] — Detalhamento do step de pricing
- [[decisao-fonte-dados-tracking]] — Debate original sobre fonte de dados
- [[sku-lifecycle]] — Pipeline completo
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [ADR-002](ADR-002-contrato-api-tracking-skus-fase-1-graphql.md) — Contrato GraphQL fase 1
