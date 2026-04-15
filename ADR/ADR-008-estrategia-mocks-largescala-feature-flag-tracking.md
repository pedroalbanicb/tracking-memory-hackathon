---
tags: [adr, tracking, mocks, feature-flag, javascript, hackathon]
status: proposed
data: 2026-04-15
autores: [Pedro Albani Martins]
rfc-relacionada:
updated: 2026-04-15
---

# ADR-008 — Estratégia de Mocks em Larga Escala com Feature Flag para Tracking

**Status:** Proposed  
**Data:** 2026-04-15  
**Autores:** Pedro Albani Martins  
**RFC relacionada:** N/A  
**ADRs relacionadas:** [[ADR-002-contrato-api-tracking-skus-fase-1-graphql]], [[ADR-004-integracao-api-oferta-e05-e08]], [[ADR-007-agendamento-espelha-estoque]]

---

## Contexto

O módulo de tracking precisa de um modo **temporário de apresentação** com **centenas de registros**, preservando o comportamento atual dos serviços reais.

As restrições desta decisão são explícitas:

- **não implementar os mocks na API agora**
- **não comprometer o funcionamento do que já existe**
- **usar um artifício técnico em JavaScript** para preparar a futura camada de mocks
- aproveitar dados reais de SKU do arquivo `docs/db_oferta_disponibilidade.DisponibilidadeSkuListaRegiao.json`
- usar a collection `produto` do MongoDB informado para tentar enriquecer os SKUs com descrição real

O contrato atual da fase 1 do tracking já está documentado em [[ADR-002-contrato-api-tracking-skus-fase-1-graphql]] e expõe principalmente:

- `POST /api/v1/tracking/skus/listar`
- `GET /api/v1/tracking/oferta/{idSku}`

Qualquer solução de mock para apresentação precisa respeitar esse contrato e manter o modo real como padrão absoluto.

---

## Problema

Hoje existem apenas mocks pequenos e estáticos no vault (`mock/data.js`, `mock/data.json`), adequados para protótipo visual, mas insuficientes para cenários como:

- paginação realista com centenas de linhas
- filtros e ordenações com volume maior
- validação visual de estados mistos (`true`, `false`, `null`)
- apresentações controladas sem depender da disponibilidade de todos os sistemas reais

Ao mesmo tempo, ligar mocks diretamente no BFF ou no frontend sem isolamento aumentaria o risco de:

- regressão funcional no fluxo atual
- contaminação do código de produção com atalhos temporários
- dificuldade de rollback caso a simulação introduza inconsistências

---

## Descobertas Técnicas Observadas

Durante esta ADR foram criados e executados scripts auxiliares em `tracking-memory-hackathon/scripts` para levantar evidências reais antes de propor a estratégia.

### 1. Fonte inicial de SKUs reais

O arquivo `docs/db_oferta_disponibilidade.DisponibilidadeSkuListaRegiao.json` contém múltiplos `IdSku` reais, com metadados úteis para geração de cenários:

- `Nacional`
- `Regioes`
- `RegioesRetira`
- `DataAlteracaoSku`

Essa fonte é adequada para gerar massa de teste sem inventar SKUs arbitrários logo na primeira camada.

### 2. Collection `produto` no MongoDB

Foi possível conectar com sucesso ao MongoDB informado e inspecionar a collection `produto`.

Campos observados na amostra consultada:

- `idSku`
- `descricaoSku`
- `skuExibicao`
- `idSkuOrigemKit`

Exemplo de evidência observada:

```json
{
  "idSku": 55028559,
  "descricaoSku": "Cômoda Palumóveis Master Plus com 2 Portas, 6 Gavetas, Espelho e Espaço para TV de até 32 polegadas Carvalho Grife/Off White",
  "skuExibicao": 55028559
}
```

### 3. Limitação encontrada no enrichment

Foi gerado um snapshot com **120 SKUs** provenientes do JSON de disponibilidade e tentado o enriquecimento pela collection `produto`.

Resultado observado nessa primeira passada:

- `120` SKUs capturados do JSON de disponibilidade
- `0` matches diretos por `idSku`/`skuExibicao` na collection `produto`

Conclusão prática:

- a collection `produto` é **válida como fonte de schema e possível enriquecimento**
- mas **não pode ser tratada como join garantido** para os SKUs vindos do JSON de disponibilidade
- a futura estratégia de mocks deve prever fallback para descrição sintética quando o enrichment real não fechar

Essa evidência evita uma decisão frágil baseada na suposição incorreta de que toda massa de disponibilidade possui espelho 1:1 nessa collection.

---

## Decisão

**Decidimos:** criar uma **camada auxiliar em JavaScript, fora da API e fora do frontend produtivo**, composta por scripts de captura e geração de dataset, e padronizar uma **configuração temporária simples**, com **uma única flag booleana** para ligar ou desligar o mock de apresentação.

Em termos práticos, a decisão tem quatro partes:

1. gerar massa a partir de fontes reais já disponíveis
2. materializar um dataset grande e repetível fora da aplicação
3. documentar uma flag simples que só ative o mock explicitamente
4. adiar a integração dos mocks na API/BFF ou no frontend até uma decisão posterior

### O que esta ADR resolve agora

Esta ADR resolve o necessário para a apresentação:

- cria a massa de dados temporária
- deixa claro que o fluxo real continua como padrão
- define uma configuração simples de liga/desliga para uso opcional na demo

### O que esta ADR não resolve agora

Esta ADR não implementa o uso do mock dentro da aplicação. Ela prepara o artefato e a regra simples de ativação para uma integração posterior e controlada.

---

## Escopo da Decisão

### Incluído

- scripts JS auxiliares em `scripts/`
- conexão exploratória com MongoDB para discovery de schema
- geração de snapshot intermediário de insumos reais
- geração de dataset mockado com centenas de registros
- definição da convenção simples de ativação para futura integração

### Fora de Escopo

- alterar `gestaoproduto-plataforma-api`
- alterar `gestaoproduto-plataforma-web`
- trocar chamadas reais por mocks neste momento
- introduzir interceptors, MSW, proxy, middleware ou controller fake em produção

---

## Artefatos Criados

Os artefatos desta ADR foram criados no diretório `scripts/` do vault.

### Scripts

| Script | Objetivo |
|---|---|
| `inspect-produto-collection.js` | inspeciona a collection `produto` e identifica caminhos candidatos de SKU/descrição |
| `capture-tracking-mock-inputs.js` | consolida SKUs reais do JSON de disponibilidade e tenta enriquecimento por integrações reais |
| `generate-tracking-mock-payload.js` | gera um dataset mockado com centenas de registros e metadados de flag |

### Outputs gerados

| Arquivo | Objetivo |
|---|---|
| `scripts/output/produto-inspection.json` | evidência do schema observado na collection `produto` |
| `scripts/output/tracking-mock-inputs.json` | snapshot intermediário dos SKUs reais coletados |
| `scripts/output/tracking-large-mock.generated.json` | dataset final mockado em larga escala |

### Volume gerado

O dataset final foi gerado com **360 registros**.

---

## Arquitetura Proposta

### Visão lógica

```text
JSON real de disponibilidade
        |
        v
capture-tracking-mock-inputs.js
        |
        +--> tentativa de enrichment por Mongo / GraphQL / Oferta
        |
        v
snapshot intermediario (tracking-mock-inputs.json)
        |
        v
generate-tracking-mock-payload.js
        |
        v
dataset grande e deterministico
        |
        v
futura camada opcional de mock (nao implementada nesta ADR)
```

### Princípio central

O consumidor futuro dos mocks deverá seguir esta regra:

```text
sem flag ativa -> chama servicos reais
com flag ativa -> pode responder do dataset mockado
```

Ou seja, o mock não substitui o fluxo normal por padrão; ele só entra por ativação explícita.

---

## Configuração Simples

O dataset gerado já carrega a convenção proposta para orientar a futura implementação do mock temporário.

### Flag proposta

| Flag | Papel | Default |
|---|---|---|
| `TRACKING_PRESENTATION_MOCK_ENABLED` | liga/desliga o mock temporário de apresentação | `false` |

### Regra obrigatória

#### `TRACKING_PRESENTATION_MOCK_ENABLED=false`

Comportamento esperado:

- nenhum mock deve ser aplicado
- todas as chamadas seguem para os serviços reais
- comportamento funcional atual permanece intacto

#### `TRACKING_PRESENTATION_MOCK_ENABLED=true`

Comportamento esperado:

- respostas podem vir do dataset mockado
- uso recomendado apenas para demonstração/local/dev controlado
- desligar a flag volta o sistema para o comportamento real

---

## Contrato de Integração Futura

Quando a camada de mock for implementada de fato, ela deverá respeitar o contrato dos serviços já documentados.

### Endpoints-alvo da primeira integração

| Endpoint | Motivo |
|---|---|
| `POST /api/v1/tracking/skus/listar` | principal fonte de volume para tabela/paginação/filtros |
| `GET /api/v1/tracking/oferta/{idSku}` | útil para detalhe/composição dos estágios E05 e E08 |

### Requisito obrigatório de segurança funcional

A regra de resolução futura deverá ser equivalente a:

```javascript
if (!TRACKING_PRESENTATION_MOCK_ENABLED) {
  return callRealService();
}

return readFromMockDataset();
```

Ou seja: uma única chave decide tudo. Desligado = real. Ligado = mock temporário.

---

## Estrutura do Dataset Gerado

O dataset final foi desenhado para permitir variedade de estados por SKU.

### Campos principais

- `skuOn`
- `skuOff`
- `mercadoria`
- `tipoNegociacao`
- `cadastro`
- `validacaoFiscal`
- `propostaComercial`
- `agendamento`
- `estoque`
- `produzidoSite`
- `produzidoLf`
- `ativacaoPricing`
- `exibicaoSite`
- `disponibilidade`
- `mockControl`
- `origemReal`

### Cenários inseridos

O gerador alterna cenários de forma determinística:

- `full-happy-path`
- `fiscal-blocked`
- `pricing-disabled`
- `stockout`
- `unknown-downstream`

Isso garante diversidade visual e funcional sem depender de sorte ou aleatoriedade irreproduzível.

---

## Por Que JavaScript e Não Implementação Direta na API Agora

### Motivos para usar JS auxiliar agora

- o objetivo imediato é **gerar massa e documentar a estratégia**, não alterar runtime produtivo
- scripts Node são rápidos de iterar e fáceis de executar no ambiente atual
- permitem capturar insumos reais e gerar artefatos versionáveis sem mexer em controller/service/repository
- a configuração para apresentação fica simples o suficiente para explicar e operar

### Motivos para não colocar mocks na API neste momento

- aumentaria o risco de regressão em endpoints já implementados
- misturaria código transitório de demonstração com código de entrega funcional
- exigiria definição prematura do ponto de interceptação ideal

---

## Ponto de Interceptação Futuro

Esta ADR **não decide** ainda onde os mocks serão plugados, mas deixa o comportamento desejado simples: um mock temporário de apresentação, com uma única chave de ativação.

### Opções aceitáveis para decisão futura

| Opção | Avaliação inicial |
|---|---|
| interceptor no frontend | boa para demos locais; menor impacto no backend |
| serviço mock paralelo no frontend | aceitável se encapsulado atrás de factory/adapter |
| proxy local/BFF fake fora da aplicação principal | bom isolamento, mas maior custo operacional |

### Opções rejeitadas desde já

| Opção | Motivo |
|---|---|
| if/else espalhado em controller produtivo | alto risco de acoplamento e regressão |
| sobrescrever retorno real silenciosamente sem flag | viola o requisito principal de segurança |
| alterar contrato do endpoint para acomodar mock | quebra consumidores e foge do objetivo |

---

## Consequências

### Positivas

- preserva o comportamento atual dos serviços reais
- cria massa mockada reproduzível com centenas de registros
- deixa a futura integração orientada por uma única flag e por contrato
- separa claramente discovery, preparação de dados e ativação runtime

### Negativas / Trade-offs

- ainda não existe consumo real desses mocks pela aplicação
- parte dos campos segue sintética quando o enrichment real não encontra match
- haverá uma segunda decisão arquitetural para escolher o ponto de interceptação futuro

### Neutras

- os scripts vivem no vault de tracking, não na API nem no frontend
- o dataset gerado é um artefato técnico de apoio, não uma API oficial

---

## Alternativas Rejeitadas

| Alternativa | Motivo de rejeição |
|---|---|
| Implementar mock diretamente na API agora | contraria a restrição explícita de não mexer na API neste momento |
| Gerar centenas de registros totalmente fictícios | perde vínculo com dados reais e reduz confiança nos cenários |
| Depender exclusivamente da collection `produto` para descrições | evidência observada mostrou `0/120` matches diretos na amostra atual |
| Substituir automaticamente chamadas reais por mocks em dev | risco de mascarar problemas reais sem ativação explícita |

---

## Plano de Evolução Recomendado

### Etapa 1 — concluída nesta ADR

- discovery de fontes
- captura de insumos reais
- geração de dataset em larga escala
- padronização das feature flags

### Etapa 2 — próxima ADR ou RFC

- escolher ponto de interceptação real
- definir como paginação, filtro e busca serão simulados

### Etapa 3 — implementação controlada

- integrar a flag no consumidor escolhido
- garantir fallback real para qualquer configuração inválida
- validar com smoke tests de modo real e modo mock

---

## Referências

- [[ADR-002-contrato-api-tracking-skus-fase-1-graphql]]
- [[ADR-004-integracao-api-oferta-e05-e08]]
- [[ADR-007-agendamento-espelha-estoque]]
- `docs/db_oferta_disponibilidade.DisponibilidadeSkuListaRegiao.json`
- `scripts/inspect-produto-collection.js`
- `scripts/capture-tracking-mock-inputs.js`
- `scripts/generate-tracking-mock-payload.js`
- `scripts/output/produto-inspection.json`
- `scripts/output/tracking-mock-inputs.json`
- `scripts/output/tracking-large-mock.generated.json`