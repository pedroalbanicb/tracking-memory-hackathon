---
tags: [tracking, pipeline, etapa, comercial, ln, infor, baan, catalogo]
etapa: 3
titulo: Proposta Comercial
status: integrado
origem: API Catálogo / LN (Infor)
escopo: 1P apenas
updated: 2026-04-15
fonte: curl testado em 2026-04-09; API Catálogo (campo FlagContratoLiberado)
---

# E03 — Proposta Comercial

> Etapa em que o contrato de compra é gerado no ERP LN (Infor). Marca o início do relacionamento comercial formal entre a empresa e o fornecedor para aquele SKU.

## Visão Geral

| Atributo | Valor |
|----------|-------|
| Etapa | 3 de 9 |
| Sistema de Origem | API Catálogo / LN (Infor) |
| Interface confirmada | ✅ `GET /api/v1/produto-sku/selecionar` — campo `Mercadorias[].DadosBasicos.FlagContratoLiberado` |
| Escopo | **1P apenas** |
| Status do Mapeamento | **Interface confirmada — campo null em SKUs novos (sem contrato)** |
| Etapa anterior | [[E02-validacao-fiscal]] |
| Próxima etapa | [[E04-agendamento]] |

---

## Como Obter os Dados

| Método | Detalhe |
|--------|---------|
| Sistema | API Catálogo (dado reflectido do LN) |
| Interface | ✅ **API CATÁLOGO** — mesmo endpoint das etapas 1 e 2 |
| Endpoint | `GET https://gestaoproduto-catalogo-hlg.viavarejo.com.br/api/v1/produto-sku/selecionar` |
| Autenticação | Header `apikey: [API_KEY_ENV]` |
| Parâmetro chave | `idSkuSite={id_sku}` ou `idSkuLoja={id_sku}` |
| Campo na composição | `Mercadorias.DadosBasicos.FlagContratoLiberado` |
| Origin no ERP | LN (Infor) — tabelas BAAN — Workbench: Mapa de Comercialização → Contrato de Compras |
| Frequência de atualização | Por evento — quando o contrato é emitido/alterado |
| Chave de rastreamento | `idSkuSite` ou `idSkuLoja` |

> ⚠️ **Observação (testado em 2026-04-09):** O campo `Mercadorias[].DadosBasicos.FlagContratoLiberado` foi solicitado via `composicao` mas **não apareceu na resposta** do SKU `55072185` (Samsung Galaxy S26+ 5G 512GB, cadastrado em 2026-02-13). Isso indica que o campo retorna `null` / ausente quando o contrato ainda não foi gerado no LN para aquele SKU. O campo **existe** na API, mas só é populado após a emissão do contrato.

> ℹ️ **Mapeamento para o Tracking (ADR-003):** Este campo é retornado na mesma chamada à API Catálogo que retorna dados de E01, E02, E06 e E07. O BFF mapeia `FlagContratoLiberado = true` → `propostaComercial: true`; `false` → `false`; `null/ausente` → `null`. Ver [[ADR-003-complementacao-dados-api-catalogo]].

---

## Campos / Schema

| Campo API | Campo Interno | Tipo | Descrição | Obrigatório |
|-----------|---------------|------|-----------|-------------|
| `Mercadorias[].DadosBasicos.FlagContratoLiberado` | `contrato_liberado` | boolean (null quando sem contrato) | Indica se o contrato de compra foi gerado no LN | Sim |
| `data_emissao_contrato` | `data_emissao_contrato` | datetime | Data/hora do primeiro contrato emitido | Sim |
| `id_mapa_comercializacao` | `id_mapa_comercializacao` | string | Referência ao mapa comercial no LN | Sim |
| `fornecedor` | `fornecedor` | string | Fornecedor vinculado ao contrato | Não |
| `marca` | `marca` | string | Marca do produto | Não |

> ⚠️ Os campos `data_emissao_contrato`, `id_mapa_comercializacao`, `fornecedor` e `marca` ainda não foram testados via API — pendente validação do `composicao` correto.

### Uso para Lead-Time

> A `data_emissao_contrato` é usada para calcular o lead-time comercial:
> 
> `lead_time_comercial = data_emissao_contrato - data_liberacao_fiscal (E02)`

---

## Para Que Esses Dados São Usados

- **Confirmar que o SKU tem um acordo comercial ativo** antes de prosseguir para agendamento e estoque
- **Cálculo de lead-time** entre liberação fiscal e contrato — métrica de eficiência comercial
- **Identificar SKUs sem contrato** — bloqueados nessa etapa por pendência comercial
- **Rastreabilidade de fornecedor** — qual fornecedor está associado ao SKU naquele ciclo comercial

---

## Regras de Negócio

- SKU sem `contrato_liberado = true` → tracking mostra estado "sem contrato" neste step
- O contrato pode envolver chamada de fornecedor ou de marca — ambos os casos são contemplados
- Dados ficam nas tabelas BAAN do LN — requer acesso ao Workbench ou integração específica
- O lead-time de emissão do primeiro contrato é uma **métrica chave** do domínio

---

## Gaps / Perguntas em Aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | ~~Existe API REST exposta pelo LN ou acesso é apenas via BAAN?~~ | Time Integração / LN | ✅ Parcialmente — API Catálogo exibe `ContratoLiberado` (dado do LN) |
| 2 | Qual o `composicao` path exato para `data_emissao_contrato` na API? | Time Catálogo | Aberto |
| 3 | Um SKU pode ter múltiplos contratos ativos simultaneamente? | Comercial | Aberto |
| 4 | O lead-time deve considerar o primeiro ou o último contrato? | GO / Produto | Aberto |
| 5 | Por que `ContratoLiberado` não aparece na resposta antes do contrato ser gerado? (null vs ausente) | Time Catálogo | Aberto |

---

## Referências

- [[sku-lifecycle]] — Pipeline completo
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [[E02-validacao-fiscal]] — Etapa anterior
- [[E04-agendamento]] — Próxima etapa
