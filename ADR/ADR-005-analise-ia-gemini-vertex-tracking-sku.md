---
tags: [adr, tracking, ia, gemini, vertex-ai, hackathon]
status: accepted
data: 2026-04-15
autores: [pedro.martins@viavarejo.com.br]
rfc-relacionada: 
updated: 2026-04-15
versao: 1.1 — corrigido modelo (gemini-2.5-flash) e lib de auth (Google.Apis.Auth 1.68.0)
---

# ADR-005 — Análise IA de SKU via Google Vertex AI (Gemini)

**Status:** Accepted  
**Data:** 2026-04-15  
**Autores:** Pedro Albani Martins  
**RFC relacionada:** *(nenhuma — decisão emergencial de hackathon)*

---

## Contexto

O produto de Tracking de SKU exibe para o operador de gestão de produto o status de cada uma das 9 etapas do pipeline. O problema: o operador precisa **interpretar** os dados manualmente — analisar quais flags estão falsas, por que o produto não está online, qual ação tomar. Isso consome tempo e exige conhecimento do domínio.

Durante o hackathon (abril/2026), surgiu a oportunidade de conectar um **LLM diretamente ao pipeline de tracking** para gerar um diagnóstico automático: consolidar os dados das 9 etapas, mandar para um modelo de linguagem e devolver uma análise em linguagem natural de volta ao operador.

A restrição principal era velocidade: precisávamos entregar valor funcionando em horas, usando credenciais GCP já disponíveis no ambiente HLG de outro produto interno (projeto `via-gcb-categorizador-prdt-hlg`).

---

## Decisão

**Decidimos:** implementar um repositório de infra (`TrackingAnaliseIARepositorio`) que autentica via `Google.Apis.Auth` (`ServiceAccountCredential`) com service account do Google Cloud e chama o Vertex AI (Gemini 2.5 Flash) diretamente via REST. O serviço (`TrackingAnaliseIAService`) orquestra a coleta das 9 etapas em paralelo, monta um prompt estruturado e delega ao repositório. O BFF expõe um endpoint `GET /api/v1/tracking/analise-ia/{idSkuSite}`.

### Fluxo completo

```
GET /api/v1/tracking/analise-ia/{idSkuSite}
  │
  └─► TrackingController.AnalisarSkuIA()
        │
        └─► TrackingAnaliseIAService.AnalisarSku()
              │
              ├─ Task.WhenAll() ← dispara as 9 etapas em paralelo
              │    ├── E01 TrackingCadastroService.BuscarCadastroInicial()
              │    ├── E02 TrackingValidacaoFiscalService.BuscarValidacaoFiscal()
              │    ├── E03 TrackingPropostaComercialService.BuscarPropostaComercial()
              │    ├── E04 TrackingAgendamentoService.BuscarAgendamento()
              │    ├── E05 TrackingEstoqueService.BuscarEstoque()
              │    ├── E06 TrackingProduzidoSiteService.BuscarProduzidoSite()
              │    ├── E07 TrackingProduzidoLojaService.BuscarProduzidoLoja()
              │    ├── E08 TrackingPricingService.BuscarAtivacaoPricing()
              │    └── E09 TrackingExibicaoService.BuscarExibicao()
              │
              ├─ Monta prompt estruturado com todos os dados
              │
              └─► TrackingAnaliseIARepositorio.AnalisarContexto()
                    │
                    ├─ ServiceAccountCredential.GetAccessTokenForRequestAsync() ← Google.Apis.Auth 1.68.0
                    └─ POST https://{location}-aiplatform.googleapis.com/v1/projects/...
                         └── modelo: gemini-2.5-flash
                              └── retorna análise em texto (português BR)
```

### Response retornada ao front

```json
{
  "isOk": true,
  "data": {
    "idSkuSite": 12345,
    "diagnostico": "Offline — bloqueadores: SKU inativa, sem estoque.",
    "analise": "O SKU 12345 está cadastrado corretamente (E01) e passou na validação fiscal (E02)...",
    "geradoEm": "2026-04-15T14:32:00Z",
    "modelo": "gemini-2.5-flash"
  }
}
```

O campo `diagnostico` é gerado localmente (determinístico, a partir das flags) — serve para um badge rápido no front. O campo `analise` é o texto livre gerado pelo Gemini.

### Por que o Vertex AI e não a API pública do Gemini?

O projeto GCP disponível (`via-gcb-categorizador-prdt-hlg`) já tem permissões configuradas no **Vertex AI**, não na AI Studio API. Vertex AI usa endpoint regional com autenticação IAM — exige o fluxo JWT → OAuth2 token, diferente da AI Studio que usa API Key direta.

---

## Consequências

### Positivas
- Dependência mínima de SDK: `Google.Apis.Auth 1.68.0` para autenticação (lida internamente com proxy corporativo e renovação de token) + `HttpClient` via `IHttpClient` (já abstraído no projeto)
- Coleta todas as 9 etapas em paralelo — latência dominada pela etapa mais lenta, não pela soma
- Diagnóstico local (`Diagnostico`) é instantâneo e não depende de LLM — fallback seguro
- Experiência "mágica" para o operador: abre o detalhe do SKU e já recebe um parecer em linguagem natural

### Negativas / Trade-offs
- Latência total alta: soma da etapa mais lenta (paralelo) + autenticação OAuth2 + inferência Gemini (~3–8s estimado)
- Service account credential em `appsettings.Development.json` — aceitável para hackathon, **deve ir para K8s Secret antes de ir para produção**
- Sem cache: cada chamada gera um novo token OAuth2 e uma nova inferência — custo por requisição
- O prompt é estático (não usa few-shot ou RAG com histórico real)
- Sem fallback se o Vertex AI estiver indisponível: o `catch` retorna `IsOk = false` sem análise parcial

### Neutras
- O modelo `gemini-2.5-flash` foi escolhido por disponibilidade no projeto GCP HLG — pode ser trocado via config (`GeminiOptions:ModelId`)
- A estrutura segue exatamente os padrões do repositório (interface no domain, implementação no infra, service orquestrando)

---

## Alternativas Rejeitadas

| Alternativa | Motivo de rejeição |
|---|---|
| OpenAI / Azure OpenAI | Sem credenciais disponíveis no ambiente HLG no momento do hackathon |
| SDK oficial `Google.Cloud.AIPlatform.V1` | Adicionaria dependência NuGet pesada; `Google.Apis.Auth` + REST direto cobre o necessário com menos overhead |
| AI Studio API Key (não Vertex) | Projeto GCP disponível não tinha permissões de AI Studio, só Vertex AI |
| MCP Server intermediário | Sobre-engenharia para o escopo do hackathon; MCP faz sentido numa fase 2 |
| Pré-computar análise no background (Kafka) | Complexidade maior; para hackathon o on-demand é suficiente |
| Cache do token OAuth2 (singleton) | Deixado para fase 2 — no hackathon o `AddTransient` é aceitável |

---

## Melhorias Planejadas (Pós-Hackathon)

| # | Melhoria | Prioridade |
|---|---|---|
| 1 | Mover credenciais para K8s Secret (remover do appsettings) | 🔴 Alta |
| 2 | Cache do Bearer token OAuth2 (validade 1h, usar `IMemoryCache`) | 🟡 Média |
| 3 | Timeout configurável na chamada ao Vertex AI | 🟡 Média |
| 4 | Fallback: retornar análise parcial se LLM der timeout | 🟡 Média |
| 5 | Few-shot prompt com exemplos reais de diagnósticos validados pelo negócio | 🟢 Baixa |
| 6 | Avaliar migração para MCP Server (fase 2 de integração IA) | 🟢 Baixa |

---

## Referências

- [[ADR-002-contrato-api-tracking-skus-fase-1-graphql]]
- [[ADR-003-complementacao-dados-api-catalogo]]
- [[ADR-004-integracao-api-oferta-e05-e08]]
- [Vertex AI REST — generateContent](https://cloud.google.com/vertex-ai/docs/reference/rest/v1/projects.locations.publishers.models/generateContent)
- [Google OAuth2 Service Account JWT](https://developers.google.com/identity/protocols/oauth2/service-account)
- Projeto GCP: `via-gcb-categorizador-prdt-hlg`
- Service Account: `compass-categorizador-llm-dev@via-gcb-categorizador-prdt-hlg.iam.gserviceaccount.com`
