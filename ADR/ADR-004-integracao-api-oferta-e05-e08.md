---
tags: [adr, tracking, api-oferta, estoque, pricing, hackathon]
status: accepted
data: 2026-04-15
autores: [Guilherme Maesta Domke de Thomaz]
rfc-relacionada:
updated: 2026-04-15
---

# ADR-004 — Integração E05 (Estoque) e E08 (Ativação Pricing) via API Oferta

**Status:** Accepted  
**Data:** 2026-04-15  
**Autores:** Guilherme Maesta Domke de Thomaz  
**RFC relacionada:** N/A  
**ADRs anteriores:** [[ADR-002-contrato-api-tracking-skus-fase-1-graphql]], [[ADR-003-complementacao-dados-api-catalogo]]

---

## Contexto

As ADRs anteriores definiram o fluxo de composição da listagem de tracking em duas etapas:

1. **[[ADR-002-contrato-api-tracking-skus-fase-1-graphql]]** — fonte base via GraphQL de mercadorias
2. **[[ADR-003-complementacao-dados-api-catalogo]]** — complementação de E01, E02, E03, E06 e E07 via API Catálogo

Nesse modelo, as colunas `estoque` (E05) e `ativacaoPricing` (E08) ainda retornavam `null` por falta de fonte integrada. As etapas E04, E09 também permanecem `null` (fontes pendentes).

Havia debate em aberto ([[decisao-fonte-dados-tracking]]) sobre usar **SQL direta** (tabelas do Banco Inventario e SkuLojista) ou **API** para leitura desses dados. A análise da API Oferta revelou que o endpoint `GET /v1/Preco/Sku/PrecoVenda` responde **ambas** as perguntas em uma única chamada, com campos confirmados e contrato estável.

Fonte: Documentação das etapas [[E05-estoque]] e [[E08-ativacao-pricing]], reunião 09/04/2026 (Juliana Dos Santos, Ricardo Tadeu Lima, Douglas Souza Wolff).

---

## Decisão

**Decidimos:** usar a **API Oferta** como interface de leitura para E05 e E08, via o endpoint `GET /v1/Preco/Sku/PrecoVenda?IdsSku={idSku}`, e compor os campos `estoque` e `ativacaoPricing` na listagem de tracking existente (`POST /api/v1/tracking/skus/listar`).

### 1. Mapeamento de campos da API Oferta

| Coluna Tracking | Campo API Oferta | Localização no JSON | Regra |
|---|---|---|---|
| `estoque` (E05) | `DisponibilidadeEstoque` | `PrecoSkus[*].PrecoVenda.DisponibilidadeEstoque` | `true` quando `DisponibilidadeEstoque = true`; `false` caso contrário |
| `ativacaoPricing` (E08) | `Valido` | Raiz da resposta | `true` quando `Valido = true`; `false` caso contrário |

> ⚠️ `DisponibilidadeEstoque` está dentro de `PrecoSkus[*].PrecoVenda` — **não** na raiz. O campo `Valido` está na **raiz** da resposta.

### 2. Fluxo de composição atualizado no BFF (3 fontes)

```
1. Frontend envia POST /api/v1/tracking/skus/listar
2. BFF executa query GraphQL de mercadorias (listagem base — ADR-002)
3. Para cada item retornado:
   a. BFF chama GET /api/v1/produto-sku/selecionar (API Catálogo — ADR-003)
      → preenche E01, E02, E03, E06, E07
   b. BFF chama GET /v1/Preco/Sku/PrecoVenda?IdsSku={skuOn} (API Oferta — esta ADR)
      → preenche E05 (estoque) e E08 (ativacaoPricing)
4. BFF retorna payload consolidado com todas as colunas
```

### 3. Contrato de saída atualizado (fase 1 + Catálogo + Oferta)

```json
{
  "data": {
    "items": [
      {
        "id": "293448",
        "skuOff": "5368715",
        "skuOn": "55072185",
        "mercadoria": "MOEDOR DE CAFE MONDIAL MCF-01-BI PT/INOX 220V",
        "tipoNegociacao": "NORMAL",
        "cadastro": true,
        "validacaoFiscal": true,
        "propostaComercial": null,
        "agendamento": null,
        "estoque": true,
        "produzidoSite": false,
        "produzidoLf": false,
        "ativacaoPricing": true,
        "exibicaoSite": null
      }
    ],
    "total": 1
  }
}
```

> **Nota:** `estoque` e `ativacaoPricing` agora são preenchidos com `true`/`false` (não mais `null`). Os campos `agendamento` (E04) e `exibicaoSite` (E09) permanecem `null` — fontes ainda não integradas.

### 4. Regra de preenchimento completa (fase 1 consolidada)

| Coluna PRD | Fonte | Campo | Regra |
|---|---|---|---|
| `cadastro` (E01) | API Catálogo | existência do SKU | `true` (sempre) |
| `validacaoFiscal` (E02) | API Catálogo | `FlagCompraBloqueada` | `true` quando `= 0` |
| `propostaComercial` (E03) | API Catálogo | `FlagContratoLiberado` | `true`/`false`/`null` |
| `agendamento` (E04) | — | — | `null` (LN/Neogrid pendente) |
| `estoque` (E05) | **API Oferta** | `PrecoSkus[*].PrecoVenda.DisponibilidadeEstoque` | **`true` quando `DisponibilidadeEstoque = true`** |
| `produzidoSite` (E06) | API Catálogo | `FlagSkuProduzido` | `true` quando `= 1` |
| `produzidoLf` (E07) | API Catálogo | `FlagSkuProduzidoLojaFisica` | `true` quando `= 1` |
| `ativacaoPricing` (E08) | **API Oferta** | `Valido` (raiz) | **`true` quando `Valido = true`** |
| `exibicaoSite` (E09) | — | — | `null` (SQL Corp/MONGOS pendente) |

### 5. Tratamento de erros na composição

| Cenário | Comportamento |
|---|---|
| API Oferta retorna sucesso | Preenche `estoque` e `ativacaoPricing` com valores booleanos |
| API Oferta retorna erro HTTP (4xx/5xx) | Preenche `estoque` e `ativacaoPricing` com `null` — log de erro com correlationId |
| API Oferta timeout | Preenche `estoque` e `ativacaoPricing` com `null` — log de warning com correlationId |
| SKU não encontrado na API Oferta (`Valido = false`, `PrecoSkus` vazio) | `estoque = false`, `ativacaoPricing = false` |

> A falha na API Oferta **não bloqueia** a resposta do tracking — os demais campos (GraphQL + API Catálogo) continuam preenchidos. Esta é a mesma estratégia de degradação graceful da [[ADR-003-complementacao-dados-api-catalogo]].

### 6. Escopo explícito desta ADR

Inclui:
- Uso da API Oferta (`GET /v1/Preco/Sku/PrecoVenda`) como fonte de leitura para E05 e E08
- Mapeamento de `DisponibilidadeEstoque` → `estoque` e `Valido` → `ativacaoPricing`
- Composição no `TrackingSkuListaService` (3ª fonte, após GraphQL e API Catálogo)
- Tratamento de erros e degradação graceful
- Atualização do contrato de saída do endpoint `POST /api/v1/tracking/skus/listar`

Não inclui:
- Integração com LN/Neogrid para agendamento (E04)
- Integração com SQL Corp / MONGOS para exibição (E09)
- Consulta multi-bandeira (EX/PF) — apenas CB nesta fase
- Consulta regional (sem parâmetro de região nesta fase)

---

## Consequências

### Positivas
- **7 de 9 etapas preenchidas** — com esta ADR, apenas E04 (agendamento) e E09 (exibição) permanecem `null`
- **Um único endpoint para dois steps** — reduz complexidade de integração
- **Coerência com o que o cliente vê** — a API Oferta é a mesma consultada pelo site
- **Sem acesso direto ao banco** — não exige linked server, acesso ao Inventario SQL ou SkuLojista
- **Contrato claro e testável** — schema JSON documentado com exemplo real
- **Degradação graceful** — falha na API Oferta não bloqueia a listagem

### Negativas / Trade-offs
- **N+1 chamadas adicionais** à API Oferta (1 por item) — soma-se às N+1 da API Catálogo (total: 2N chamadas extras por lote)
- **Falso negativo se API estiver fora** — campos retornam `null` em vez de valor real (mitigação: log + monitoramento)
- **Região**: `DisponibilidadeEstoque` pode variar por região — SKU sem configuração regional pode retornar `false` mesmo com estoque no CD principal
- **Latência adicional** — terceira chamada HTTP por item na composição

### Neutras
- A leitura SQL (Inventario, SkuLojista) permanece documentada como contexto do sistema de escrita — poderá ser usada em V2 para diagnóstico e divergência
- O endpoint de tracking não muda de rota — apenas passa a preencher mais colunas

---

## Alternativas Rejeitadas

| Alternativa | Motivo de rejeição |
|-------------|-------------------|
| Query SQL direta no Banco Inventario | Requer linked server, acesso infraestrutura, complexidade de configuração por ambiente |
| Query SQL em SkuLojista / SkuLojistaPreço | Requer acesso direto ao banco de pricing, sem API intermediária |
| Kafka (evento de estoque/pricing) | Sem tópico identificado para estes eventos no escopo 1P; complexidade de state management |
| Manter `null` para E05/E08 e aguardar fase 2 | Dados já disponíveis via API que também é usada pelo site — desnecessário adiar |
| Chamadas paralelas (API Catálogo + API Oferta simultâneas) | Pode ser otimização V2 — nesta fase, manter sequencial para simplificar debug e logging |

---

## Arquitetura de Implementação Backend

### Camadas

```
BFF (TrackingController)
  └─ ITrackingSkuListaService (composição)
       ├─ ITrackingGraphQLRepositorio      → GraphQL mercadorias (base)
       ├─ ITrackingCatalogoRepositorio     → API Catálogo (E01-E03, E06-E07)
       └─ ITrackingOfertaRepositorio       → API Oferta (E05, E08)
```

### Interfaces (domain/Contracts)

```csharp
public interface ITrackingOfertaRepositorio
{
    Task<IResponse<PrecoSkuResponse>> ObterPrecoSkuAsync(int idSku);
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

### Composição no TrackingSkuListaService (pseudocódigo)

```csharp
private async Task<TrackingSkuListaItem> MapearParaItemAsync(TrackingGraphQLMercadoriaItem item)
{
    var skuOn = ParseSkuOn(item);

    // Chamada 1: API Catálogo (E01, E02, E03, E06, E07)
    var catalogoData = await _catalogoRepositorio.BuscarDadosCatalogo(skuOn);

    // Chamada 2: API Oferta (E05, E08)
    var ofertaData = await _ofertaRepositorio.ObterPrecoSkuAsync(skuOn);

    return new TrackingSkuListaItem
    {
        // ... campos GraphQL (base) ...
        Cadastro = true,
        ValidacaoFiscal = MapearE02(catalogoData),
        PropostaComercial = MapearE03(catalogoData),
        Agendamento = null,
        Estoque = ofertaData?.PrecoSkus?.FirstOrDefault()?.PrecoVenda?.DisponibilidadeEstoque,
        ProduzidoSite = MapearE06(catalogoData),
        ProduzidoLf = MapearE07(catalogoData),
        AtivacaoPricing = ofertaData?.Valido,
        ExibicaoSite = null
    };
}
```

### URLs por Bandeira

| Bandeira | Base URL (hlg) |
|----------|---------------|
| CB | `https://api-oferta-casasbahia-hlg.viavarejo.com.br` |
| EX | 🟡 A confirmar |
| PF | 🟡 A confirmar |

---

## Perguntas em aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | Quais são os base URLs da API Oferta para EX e PF (hlg e prd)? | Time Oferta | 🟡 CB confirmado — EX/PF a confirmar |
| 2 | `DisponibilidadeEstoque` varia por região? Se sim, qual região usar como default? | Time Oferta | 🟡 A confirmar |
| 3 | Existe header de autenticação / apikey necessário para a API Oferta? | Time Oferta | 🟡 A confirmar |
| 4 | As chamadas de API Oferta deveriam ser paralelizadas com a API Catálogo em V2? | Squad TCD | 🟡 Otimização futura |

---

## Referências

- [[ADR-002-contrato-api-tracking-skus-fase-1-graphql]] — Contrato GraphQL fase 1
- [[ADR-003-complementacao-dados-api-catalogo]] — Complementação via API Catálogo
- [[E05-estoque]] — Detalhamento do step de estoque
- [[E08-ativacao-pricing]] — Detalhamento do step de pricing
- [[decisao-fonte-dados-tracking]] — Debate original sobre fonte de dados
- [[sku-lifecycle]] — Pipeline completo
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
