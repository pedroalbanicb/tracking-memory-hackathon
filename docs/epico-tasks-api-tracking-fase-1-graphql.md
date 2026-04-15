---
tags: [tracking, jira, backlog, api, graphql]
tipo: planejamento-jira
status: draft
updated: 2026-04-14
autor: GitHub Copilot
fonte: "Baseado em [[PRD-002-frontend-tracking]] e [[ADR-002-contrato-api-tracking-skus-fase-1-graphql]]"
---

# Preparacao Jira — Epico e Tasks (API Tracking Fase 1 GraphQL)

## Objetivo

Preparar os itens para criacao no Jira (projeto TCD, board 2291) da fase 1 da API de Tracking, com fonte inicial unica em GraphQL, conforme [[ADR-002-contrato-api-tracking-skus-fase-1-graphql]].

## Epic (rascunho)

- Tipo: Epic
- Titulo sugerido: [TCD-XXXX] - Implementar API Tracking de SKUs fase 1 com fonte GraphQL
- Labels: `tracking`, `api`, `graphql`, `fase-1`
- Componentes sugeridos: `gestaoproduto-plataforma-api`

### Descricao sugerida (copiar no Jira)

Implementar o endpoint de listagem de Tracking de SKUs para suportar a tela de lista do GO, com cobertura faseada.

Escopo desta fase:
- receber lista de SKUs para consulta em lote;
- consultar fonte GraphQL de mercadorias;
- retornar payload no contrato definido no PRD-002 para a tabela;
- preencher E01 (cadastro) com dados do GraphQL;
- retornar `null` para etapas sem fonte nesta fase (E02, E03, E05, E06, E07, E08, E09), sem inferir `false`.

Fora de escopo nesta fase:
- composicao com services de outras fontes (sera tratada em ADR posterior);
- contrato final da tela de detalhe;
- regras definitivas de consolidacao de pipeline E02-E09.

Referencias:
- [[PRD-002-frontend-tracking]]
- [[ADR-002-contrato-api-tracking-skus-fase-1-graphql]]
- [[sku-lifecycle]]

### Criterios de aceite do Epic

- Existe endpoint de lote publicado para listagem de SKUs de tracking.
- Payload de resposta segue as colunas da tabela do PRD-002.
- Query GraphQL foi simplificada removendo campos/filtros nao usados nesta fase.
- As etapas sem fonte retornam `null` (nao `false`).
- Existe cobertura de testes unitarios para controller/service/mapeamento principal.
- Documentacao tecnica atualizada (swagger + notas de decisao).

## Tasks sugeridas

### 1) Contrato de API e modelos de resposta

- Tipo: Story
- Titulo sugerido: [TCD-XXXX] - Definir contrato do endpoint de listagem tracking por lote de SKUs
- Labels: `tracking`, `api-contract`
- Dependencia: nenhuma

Descricao:
- Definir request/response do endpoint de fase 1.
- Garantir alinhamento com colunas do PRD-002.
- Formalizar tipos de campos e politica de `null` para etapas sem fonte.

Criterios de aceite:
- Request com lista de SKUs documentado.
- Response com campos `id`, `skuOff`, `skuOn`, `mercadoria`, `tipoNegociacao`, `cadastro`, `validacaoFiscal`, `propostaComercial`, `estoque`, `produzidoSite`, `produzidoLf`, `ativacaoPricing`, `exibicaoSite`.
- Swagger atualizado.

Estimativa sugerida: 3 SP

### 2) Integracao GraphQL no repositorio de tracking

- Tipo: Story
- Titulo sugerido: [TCD-XXXX] - Implementar consulta GraphQL de mercadorias para tracking
- Labels: `tracking`, `graphql`, `infra`
- Dependencia: Task 1

Descricao:
- Implementar cliente/repositorio para consulta GraphQL.
- Aplicar query enxuta da ADR-002.
- Tratar pagina e lote de SKUs com resiliencia basica.

Criterios de aceite:
- Query utiliza apenas campos/filtros necessarios para fase 1.
- Nao usa `search`, `operation` e `idKitLoja` na fase inicial.
- Logs de erro com correlationId em falhas de integracao.

Estimativa sugerida: 5 SP

### 3) Service de agregacao fase 1 (mapeamento PRD)

- Tipo: Story
- Titulo sugerido: [TCD-XXXX] - Mapear retorno GraphQL para colunas do PRD-002 na API Tracking
- Labels: `tracking`, `service`, `mapping`
- Dependencia: Task 2

Descricao:
- Mapear campos GraphQL para contrato da tabela.
- Popular `cadastro` (E01) com base na existencia do item.
- Retornar `null` para E02-E09 nesta fase.

Criterios de aceite:
- Mapeamento de campos validado em testes.
- `tipoNegociacao` normalizado conforme regra acordada.
- Nao existe inferencia indevida de `false` para etapas sem fonte.

Estimativa sugerida: 5 SP

### 4) Controller do endpoint de listagem tracking

- Tipo: Story
- Titulo sugerido: [TCD-XXXX] - Expor endpoint POST de listagem de SKUs tracking
- Labels: `tracking`, `controller`, `bff`
- Dependencia: Task 3

Descricao:
- Criar endpoint `POST /api/v1/tracking/skus/listar`.
- Aplicar validacao de entrada (lista de SKUs, pagina, take).
- Garantir retorno padrao da API e tratamento de erro.

Criterios de aceite:
- Endpoint responde com payload esperado em caso de sucesso.
- Erros de validacao e erro tecnico seguem padrao da API.
- Documentacao OpenAPI publicada.

Estimativa sugerida: 3 SP

### 5) Testes unitarios (controller, service, repositorio)

- Tipo: Task
- Titulo sugerido: [TCD-XXXX] - Cobrir API Tracking fase 1 com testes unitarios
- Labels: `tracking`, `tests`
- Dependencia: Tasks 2, 3, 4

Descricao:
- Criar testes para cenarios de sucesso e falha.
- Cobrir mapeamento de `null` nas etapas sem fonte.
- Cobrir validacao de entrada e propagacao de erros.

Criterios de aceite:
- Suite de testes executa sem falhas.
- Casos minimos cobertos: lote valido, lote vazio, SKU nao encontrado, erro GraphQL.

Estimativa sugerida: 5 SP

### 6) Hardening tecnico e observabilidade

- Tipo: Task
- Titulo sugerido: [TCD-XXXX] - Adicionar observabilidade e hardening no endpoint de tracking
- Labels: `tracking`, `observability`, `hardening`
- Dependencia: Task 4

Descricao:
- Padronizar logs com correlationId.
- Adicionar metricas basicas (latencia e taxa de erro).
- Revisar timeout/retry da chamada GraphQL.

Criterios de aceite:
- Logs de sucesso/falha rastreaveis por correlationId.
- Timeout/retry configurados e testados em cenarios de erro.

Estimativa sugerida: 3 SP

### 7) Documentacao tecnica da fase 1

- Tipo: Task
- Titulo sugerido: [TCD-XXXX] - Documentar endpoint tracking fase 1 e simplificacao GraphQL
- Labels: `tracking`, `docs`
- Dependencia: Tasks 1 a 4

Descricao:
- Consolidar documentacao de contrato e exemplos de request/response.
- Registrar lista de campos GraphQL nao utilizados na fase 1.
- Publicar orientacoes para fase 2 (services complementares).

Criterios de aceite:
- Documentacao revisada e versionada.
- Lista de lacunas E02-E09 explicitada para backlog da proxima ADR.

Estimativa sugerida: 2 SP

## Ordem sugerida de execucao

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7

## Backlog da proxima fase (nao criar agora como parte do Epic acima)

- ADR de composicao de services por etapa E02-E09.
- Tasks de integracao por fonte: fiscal, proposta comercial, estoque, produzido site, produzido loja, pricing, exibicao.

## Checklist operacional para criacao no Jira

- Projeto: TCD
- Board: 2291
- Criar Epic primeiro e depois vincular as 7 tasks.
- Preencher labels padronizadas (`tracking`, `api`, `graphql`).
- Ao mover para IN DEVELOPMENT, atribuir para Pedro Martins (pedro.martins@viavarejo.com.br).
- Branch sugerida ao iniciar implementacao: `feature/TCD-XXXX-tracking-api-fase-1-graphql`
