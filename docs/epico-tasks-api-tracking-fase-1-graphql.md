---
tags: [tracking, jira, backlog, api, graphql, hackathon]
tipo: planejamento-jira
status: draft
updated: 2026-04-15
autor: GitHub Copilot
fonte: "Baseado em [[PRD-002-frontend-tracking]], [[ADR-002-contrato-api-tracking-skus-fase-1-graphql]], [[ADR-003-complementacao-dados-api-catalogo]] e [[ADR-004-integracao-api-oferta-e05-e08]]"
---

# Preparacao Jira — Epico e Tasks (API Tracking Fase 1 GraphQL)

## Objetivo

Preparar os itens para criacao no Jira (projeto TCD, board 2291) da fase 1 da API de Tracking, com fonte inicial unica em GraphQL, conforme [[ADR-002-contrato-api-tracking-skus-fase-1-graphql]].

## Epic

- Tipo: Epic
- Jira: **TCD-9934** — API Tracking de SKUs fase 1 com fonte GraphQL
- Labels: `tracking`, `api`, `graphql`, `fase-1`
- Componentes sugeridos: `gestaoproduto-plataforma-api`
- Status: Backlog

### Descricao (sincronizada com Jira)

Implementar o endpoint de listagem de Tracking de SKUs para suportar a tela de lista do GO, com cobertura faseada.

Escopo desta fase:
- receber lista de SKUs para consulta em lote **ou** nome/descricao para busca textual (discriminador `tipoBusca`);
- consultar fonte GraphQL de mercadorias com query dinamica conforme tipo de busca;
- retornar payload no contrato definido no PRD-002 para a tabela;
- preencher E01 (cadastro) com dados do GraphQL;
- retornar `null` para etapas sem fonte nesta fase (E02, E03, E05, E06, E07, E08, E09), sem inferir `false`.

Modos de busca (ADR-002 atualizada):
- `tipoBusca = "sku"`: campo `skus` (long[], 1-50 valores, aceita SKU ON e OFF)
- `tipoBusca = "nome"`: campo `nome` (string, min. 3 chars, busca por `contains`)

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

- Jira: **TCD-9945** (Tarefa) / **TCD-9938** (Historia)
- Titulo: Definir contrato do endpoint de listagem tracking (SKU + nome)
- Labels: `tracking`, `api-contract`
- Dependencia: nenhuma

Descricao:
- Definir request/response com discriminador `tipoBusca` (`sku` | `nome`).
- Campo `skus` (long[], 1-50) quando `tipoBusca = sku`; campo `nome` (string, min. 3 chars) quando `tipoBusca = nome`.
- Campos mutuamente exclusivos — validacao no backend.
- Garantir alinhamento com colunas do PRD-002.
- Formalizar politica de `null` para etapas sem fonte.

Criterios de aceite:
- Request com `tipoBusca`, `skus`, `nome`, `pagina`, `take` documentado.
- Response com campos `id`, `skuOff`, `skuOn`, `mercadoria`, `tipoNegociacao`, `cadastro`, `validacaoFiscal`, `propostaComercial`, `estoque`, `produzidoSite`, `produzidoLf`, `ativacaoPricing`, `exibicaoSite`.
- Swagger atualizado com ambos os modos de busca.

Estimativa sugerida: 3 SP

### 2) Integracao GraphQL no repositorio de tracking

- Jira: **TCD-9942** (Tarefa)
- Titulo: Implementar consulta GraphQL de mercadorias para tracking (SKU + nome)
- Labels: `tracking`, `graphql`, `infra`
- Dependencia: Task 1

Descricao:
- Implementar 2 queries GraphQL enxutas (ADR-002 § 2.1 e § 2.2):
  - Por SKU: filtro `dePara.idSkuLoja eq` / `dePara.idSkuOn eq` (1 chamada por SKU).
  - Por nome: filtro `nome: { contains: $search }` (1 chamada unica com paginacao).
- Selecao da query conforme `tipoBusca` recebido do service.
- Remover uso de `operation` e `idKitLoja` na fase inicial.
- Tratar erros e logs com correlationId.

Criterios de aceite:
- Ambas as queries usam apenas campos necessarios para fase 1.
- Nao usa `operation`/`idKitLoja` na fase inicial.
- Variavel `$search` utilizada corretamente na busca por nome.
- Logs de erro com correlationId em falhas de integracao.

Estimativa sugerida: 5 SP

### 3) Service de agregacao fase 1 (mapeamento PRD)

- Jira: **TCD-9943** (Tarefa) / **TCD-9937** (Historia)
- Titulo: Mapear retorno GraphQL para colunas do PRD-002 na API Tracking
- Labels: `tracking`, `service`, `mapping`
- Dependencia: Task 2

Descricao:
- Mapear campos GraphQL para contrato da tabela (identico para ambos os modos de busca).
- Popular `cadastro` (E01) com base na existencia do item.
- Retornar `null` para E02-E09 nesta fase.

Criterios de aceite:
- Mapeamento validado para resultados de ambas as queries (por SKU e por nome).
- `tipoNegociacao` normalizado (uppercase).
- Nao existe inferencia indevida de `false` para etapas sem fonte.

Estimativa sugerida: 5 SP

### 4) Controller do endpoint de listagem tracking

- Jira: **TCD-9944** (Tarefa) / **TCD-9936** (Historia)
- Titulo: Expor endpoint POST de listagem tracking (SKU + nome)
- Labels: `tracking`, `controller`, `bff`
- Dependencia: Task 3

Descricao:
- Criar endpoint `POST /api/v1/tracking/skus/listar`.
- Receber body com discriminador `tipoBusca` (`sku` | `nome`).
- Validar campos mutuamente exclusivos (`skus` vs `nome`) conforme `tipoBusca`.
- Validar limites: `skus` max 50, `nome` min 3 chars, `take` max 100.
- Garantir retorno padrao da API e tratamento de erro.

Criterios de aceite:
- Endpoint responde payload esperado para busca por SKU e por nome.
- Erros de validacao retornam `BadRequest` com mensagem descritiva.
- `tipoBusca` invalido ou campos inconsistentes retornam erro claro.
- Documentacao OpenAPI publicada com exemplos de ambos os modos.

Estimativa sugerida: 3 SP

### 5) Testes unitarios (controller, service, repositorio)

- Jira: **TCD-9941** (Tarefa)
- Titulo: Cobrir API Tracking fase 1 com testes unitarios
- Labels: `tracking`, `tests`
- Dependencia: Tasks 2, 3, 4

Descricao:
- Criar testes para cenarios de sucesso e falha para ambos os modos de busca.
- Cobrir mapeamento de `null` nas etapas sem fonte.
- Cobrir validacao: `tipoBusca` invalido, `skus` vazio, `nome` < 3 chars, campos mutuamente exclusivos.
- Cobrir propagacao de erros GraphQL.

Criterios de aceite:
- Suite executa sem falhas.
- Casos minimos: lote SKU valido, busca nome valida, lote vazio, nome curto, `tipoBusca` invalido, SKU nao encontrado, nome sem resultados, erro GraphQL.
- Naming: `{Metodo}_Deve{Resultado}_{Condicao}`.

Estimativa sugerida: 5 SP

### 6) Hardening tecnico e observabilidade

- Jira: **TCD-9939** (Tarefa)
- Titulo: Adicionar observabilidade e hardening no endpoint de tracking
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

- Jira: **TCD-9940** (Tarefa)
- Titulo: Documentar endpoint tracking fase 1 e simplificacao GraphQL
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

---

## Tasks — Integração API Oferta (E05 Estoque + E08 Pricing) — ADR-004

### 8) Repositório de integração com API Oferta

- Jira: **TCD-10009** (Tarefa)
- Titulo: Implementar TrackingOfertaRepositorio para E05/E08 via API Oferta
- Labels: `tracking`, `api-oferta`, `infra`, `hackathon`
- Dependencia: Task 1 (contrato)

Descricao:
- Implementar `ITrackingOfertaRepositorio` no domain/Contracts.
- Implementar `TrackingOfertaRepositorio` na infra usando `IHttpClient`.
- Endpoint: `GET /v1/Preco/Sku/PrecoVenda?IdsSku={idSku}`.
- Base URL via `IConfiguration` (por bandeira — iniciar com CB).
- Modelo de resposta: `PrecoSkuResponse` com `Valido` (raiz) e `PrecoSkus[*].PrecoVenda.DisponibilidadeEstoque`.
- Tratar erros HTTP (4xx/5xx) e timeout — retornar `null` sem bloquear a listagem.
- Logs de erro com correlationId.

Criterios de aceite:
- Repositório chama API Oferta e deserializa resposta corretamente.
- `DisponibilidadeEstoque` extraído de `PrecoSkus[0].PrecoVenda.DisponibilidadeEstoque`.
- `Valido` extraído da raiz da resposta.
- Erro na API Oferta retorna `null` (degradação graceful) com log.
- URL da API configurável via `IConfiguration`.

Estimativa sugerida: 5 SP

### 9) Composição E05/E08 no TrackingSkuListaService

- Jira: **TCD-10010** (Tarefa)
- Titulo: Compor estoque e pricing na listagem tracking via API Oferta
- Labels: `tracking`, `api-oferta`, `service`, `hackathon`
- Dependencia: Task 8

Descricao:
- Injetar `ITrackingOfertaRepositorio` no `TrackingSkuListaService`.
- No método `MapearParaItemAsync`, após a chamada à API Catálogo, chamar `ObterPrecoSkuAsync(skuOn)`.
- Mapear `PrecoSkus[0].PrecoVenda.DisponibilidadeEstoque` → `Estoque` (E05).
- Mapear `Valido` (raiz) → `AtivacaoPricing` (E08).
- Em caso de erro na API Oferta, manter `Estoque = null` e `AtivacaoPricing = null`.

Criterios de aceite:
- `Estoque` e `AtivacaoPricing` preenchidos com `true`/`false` quando API Oferta responde com sucesso.
- `Estoque` e `AtivacaoPricing` retornam `null` quando API Oferta falha (sem bloquear a listagem).
- Mapeamento correto: `DisponibilidadeEstoque` → `Estoque`, `Valido` → `AtivacaoPricing`.

Estimativa sugerida: 3 SP

### 10) Testes unitários da integração API Oferta

- Jira: **TCD-10011** (Tarefa)
- Titulo: Cobrir integração API Oferta (E05/E08) com testes unitários
- Labels: `tracking`, `api-oferta`, `tests`, `hackathon`
- Dependencia: Tasks 8, 9

Descricao:
- Testes do `TrackingOfertaRepositorio`: sucesso, erro HTTP, timeout, resposta vazia.
- Testes do `TrackingSkuListaService`: composição com API Oferta ativa, API Oferta em erro (degradação graceful).
- Verificar mapeamento: `DisponibilidadeEstoque = true` → `Estoque = true`; `Valido = false` → `AtivacaoPricing = false`.
- Naming: `{Metodo}_Deve{Resultado}_{Condicao}`.

Criterios de aceite:
- Suite executa sem falhas.
- Casos minimos: API Oferta sucesso, API Oferta erro 500, API Oferta timeout, SKU sem preço (`Valido = false`), SKU com estoque (`DisponibilidadeEstoque = true`), SKU sem estoque (`DisponibilidadeEstoque = false`).
- Naming seguindo convenção `{Metodo}_Deve{Resultado}_{Condicao}`.

Estimativa sugerida: 5 SP

### 11) Documentação técnica da integração API Oferta

- Jira: **TCD-10012** (Tarefa)
- Titulo: Documentar integração API Oferta para E05/E08 no tracking
- Labels: `tracking`, `api-oferta`, `docs`, `hackathon`
- Dependencia: Tasks 8, 9

Descricao:
- Atualizar Swagger com exemplos mostrando `estoque` e `ativacaoPricing` preenchidos.
- Consolidar ADR-004 no vault Obsidian.
- Atualizar ADR-002 e ADR-003 com referências cruzadas.
- Documentar URLs da API Oferta por ambiente no ConfigMap.

Criterios de aceite:
- Swagger reflete `estoque` e `ativacaoPricing` com valores booleanos (não mais `null`).
- ADR-004 publicada e referenciada nas ADRs anteriores.
- ConfigMap documentado com URL da API Oferta.

Estimativa sugerida: 2 SP

## Ordem sugerida de execucao

1. Task 1
2. Task 2
3. Task 3
4. Task 4
5. Task 5
6. Task 6
7. Task 7

---

## Tasks adicionais — ADR-003 (Complementacao API Catalogo)

> Tasks criadas a partir da [[ADR-003-complementacao-dados-api-catalogo]], que define a complementacao de dados via API Catalogo para E01, E02, E03, E06 e E07, e a inclusao do campo `agendamento` (E04) no contrato.

### 8) Atualizar composicao API Catalogo — novos campos E03/E06/E07

- Jira: **TCD-9947** (Tarefa)
- Labels: `tracking`, `hackathon`, `api-catalogo`
- Dependencia: nenhuma

Descricao:
- Atualizar composicao com `FlagContratoLiberado`, `FlagSkuProduzido`, `FlagSkuProduzidoLojaFisica`
- Remover `FlagVendaBloqueada` (nao utilizada)
- Aceitar `idSkuSite` ou `idSkuLoja` como parametro chave

Estimativa sugerida: 2 SP

### 9) Implementar complementacao de dados via API Catalogo no service

- Jira: **TCD-9948** (Tarefa)
- Labels: `tracking`, `hackathon`, `service`
- Dependencia: TCD-9947

Descricao:
- Chamar API Catalogo para cada item do GraphQL
- Mapear flags para booleanos do contrato (E01=true, E02=FlagCompraBloqueada, E03=FlagContratoLiberado, E06=FlagSkuProduzido, E07=FlagSkuProduzidoLojaFisica)

Estimativa sugerida: 5 SP

### 10) Adicionar campo agendamento (E04) ao contrato de saida

- Jira: **TCD-9949** (Tarefa)
- Labels: `tracking`, `hackathon`, `contract`
- Dependencia: nenhuma

Descricao:
- Adicionar campo `agendamento` (boolean/null) ao response model
- Valor fixo `null` nesta fase

Estimativa sugerida: 1 SP

### 11) Atualizar testes unitarios para complementacao e agendamento

- Jira: **TCD-9950** (Tarefa)
- Labels: `tracking`, `hackathon`, `tests`
- Dependencia: TCD-9948, TCD-9949

Descricao:
- Cobrir mapeamento E02/E03/E06/E07 via API Catalogo
- Cenarios de erro (API indisponivel, timeout)
- Campo `agendamento` sempre `null`

Estimativa sugerida: 3 SP

### 12) Adicionar coluna Agendamento e ajustar tracking no frontend

- Jira: **TCD-9951** (Tarefa)
- Labels: `tracking`, `hackathon`, `frontend`
- Dependencia: TCD-9949

Descricao:
- Renderizar coluna Agendamento (E04) na tabela
- Tratar `null` como icone cinza
- Confirmar mapeamento de icones para E02/E03/E06/E07

Estimativa sugerida: 3 SP

## Backlog da proxima fase (nao criar agora como parte do Epic acima)

- ADR de composicao de services por etapa E02-E09.
- Tasks de integracao por fonte: fiscal, proposta comercial, estoque, produzido site, produzido loja, pricing, exibicao.

## Checklist operacional para criacao no Jira

- Projeto: TCD
- Board: 2291
- Criar Epic primeiro e depois vincular as 7 tasks.
- Preencher labels padronizadas (`tracking`, `api`, `graphql`).
- Ao mover para IN DEVELOPMENT, atribuir para Pedro Martins (pedro.martins@viavarejo.com.br).
- Branch sugerida ao iniciar implementacao: `feature/TCD-9934-tracking-api-fase-1-graphql`
