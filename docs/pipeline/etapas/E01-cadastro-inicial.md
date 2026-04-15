---
tags: [tracking, pipeline, etapa, cadastro, catalogo]
etapa: 1
titulo: Cadastro Inicial do Produto
status: integrado
origem: API Catálogo
updated: 2026-04-09
---

# E01 — Cadastro Inicial do Produto

> Primeira etapa do tracking de produtos. Um SKU nasce aqui — sem essa etapa, não existe nas etapas seguintes.

## Visão Geral

| Atributo             | Valor                                         |
| -------------------- | --------------------------------------------- |
| Etapa                | 1 de 9                                        |
| Sistema de Origem    | Portal GO / API Catálogo                      |
| Interface confirmada | ✅ `GET /api/v1/produto-sku/selecionar`        |
| Status do Mapeamento | **Integrado — endpoint e campos confirmados** |
| Próxima etapa        | [[E02-validacao-fiscal]]                      |

> A tela inicial do tracking é carregada com os **mesmos SKUs que já existem no portal GO**.
> Entenda a distinção 1P/3P e SKU ON/OFF antes de prosseguir: [[sku-on-off-1p-3p]].

---

## Como Obter os Dados

| Método                    | Detalhe                                                                                                                                                                                                                           |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sistema                   | Portal GO / Catálogo                                                                                                                                                                                                              |
| Interface                 | ✅ **API CATÁLOGO — confirmado**                                                                                                                                                                                                   |
| Endpoint                  | `GET https://gestaoproduto-catalogo-hlg.viavarejo.com.br/api/v1/produto-sku/selecionar`                                                                                                                                           |
| Autenticação              | Header `apikey: [API_KEY_ENV]`                                                                                                                                                                                                    |
| Parâmetro chave           | `idSkuSite={id_sku}` ou `idSkuLoja={id_sku}`                                                                                                                                                                                                              |
| Seleção de campos         | `composicao=Geral.Nome;Mercadorias.DadosBasicos.NomeTipoSku;Mercadorias.DadosBasicos.FlagCrossDocking;Mercadorias.DadosBasicos.FlagCompraBloqueada;Mercadorias.Controle.DataCadastro;Mercadorias.DadosBasicos.FlagContratoLiberado;Mercadorias.Geral.FlagSkuProduzido;Mercadorias.Geral.FlagSkuProduzidoLojaFisica` |
| Frequência de atualização | Por evento (quando SKU é cadastrado)                                                                                                                                                                                              |
| Chave de rastreamento     | `idSkuSite` ou `idSkuLoja`                                                                                                                                                                                                                       |

### Exemplo de Requisição (HLG)

```bash
curl --request GET \
  --url 'https://gestaoproduto-catalogo-hlg.viavarejo.com.br/api/v1/produto-sku/selecionar?composicao=Geral.Nome%3BMercadorias.DadosBasicos.NomeTipoSku%3BMercadorias.DadosBasicos.FlagCrossDocking%3BMercadorias.DadosBasicos.FlagCompraBloqueada%3BMercadorias.Controle.DataCadastro%3BMercadorias.DadosBasicos.FlagContratoLiberado%3BMercadorias.Geral.FlagSkuProduzido%3BMercadorias.Geral.FlagSkuProduzidoLojaFisica&idSkuSite={ID_SKU}' \
  --header 'Content-Type: application/json' \
  --header 'apikey: [API_KEY_HLG]'
```

> ℹ️ O parâmetro chave aceita tanto `idSkuSite` quanto `idSkuLoja`, dependendo do identificador disponível.

### Exemplo de Resposta

```json
{
  "Geral": {
    "Nome": "Smartphone Samsung Galaxy S26+ 5G Tela 6.7\" 512GB Câmera 50MP"
  },
  "Mercadorias": [
    {
      "DadosBasicos": {
        "FlagCrossDocking": 0,
        "FlagCompraBloqueada": 0,
        "NomeTipoSku": "NORMAL",
        "FlagContratoLiberado": null
      },
      "Geral": {
        "FlagSkuProduzido": 0,
        "FlagSkuProduzidoLojaFisica": 0
      },
      "Controle": {
        "DataCadastro": "2026-02-13T00:00:00"
      }
    }
  ]
}
```

> ℹ️ `Mercadorias` é um **array** — um SKU pode ter múltiplas mercadorias (ex: diferentes lojistas/sellers). No exemplo do SKU `55072185`, retornou 4 itens com dados idênticos.

---

## SKU ON vs SKU OFF nesta Etapa

> Ver conceito completo: [[sku-on-off-1p-3p]]
> **O tracking é exclusivo para produtos 1P.**

| Tipo   | Comportamento no Cadastro                                                          |
| ------ | ---------------------------------------------------------------------------------- |
| **1P** | SKU nasce como **SKU OFF** (backoffice); SKU ON é criado separadamente para o site |
| ~~3P~~ | ~~Fora do escopo do tracking~~                                                     |

- O tracking de produtos opera sobre o **SKU OFF** (backoffice / portal GO)
- A carga inicial do painel usa os SKUs já existentes no portal GO
- Para 1P: SKU OFF é o SKU do backoffice; SKU ON é o que aparece no site para o cliente

---

## Campos / Schema

| Campo API | Campo Interno | Tipo | Descrição | Obrigatório | Etapa |
|-----------|---------------|------|-----------|-------------|-------|
| `Geral.Nome` | `nome` | string | Nome do produto | Sim | E01 |
| `Mercadorias[].Controle.DataCadastro` | `data_cadastro` | datetime | Data/hora de criação no sistema | Sim | E01 |
| `Mercadorias[].DadosBasicos.NomeTipoSku` | `tipo_produto` | enum | Normal, Crossdocking, Digital/Download, Pré-Lançamento | Sim | E01 |
| `Mercadorias[].DadosBasicos.FlagCompraBloqueada` | `compra_bloqueada` | int (0/1) | `0` = liberado, `1` = bloqueado. Flag padrão ao nascer: `1` | Sim | E02 |
| `Mercadorias[].DadosBasicos.FlagCrossDocking` | `crossdocking` | int (0/1) | `0` = não, `1` = crossdocking | Sim | E01 |
| `Mercadorias[].DadosBasicos.FlagContratoLiberado` | `contrato_liberado` | boolean/null | `true` = contrato emitido, `null` = sem contrato | Sim | E03 |
| `Mercadorias[].Geral.FlagSkuProduzido` | `produzido_site` | int (0/1) | `0` = não produzido, `1` = produzido para o site | Sim | E06 |
| `Mercadorias[].Geral.FlagSkuProduzidoLojaFisica` | `produzido_loja_fisica` | int (0/1) | `0` = não produzido, `1` = produzido para loja física | Sim | E07 |

### Tipo Produto — Valores Possíveis

| Valor | Descrição |
|-------|-----------|
| `Normal` | Produto físico padrão |
| `Crossdocking` | Enviado direto do fornecedor |
| `Digital/Download` | Produto digital sem estoque físico |
| `Pre-lancamento` | Produto anunciado antes da disponibilidade |

---

## Para Que Esses Dados São Usados

- **Identificação do SKU** no painel de tracking — toda busca começa pelo `id_sku`
- **Tipo de produto** determina quais etapas subsequentes se aplicam (ex: Digital/Download pula Estoque físico)
- **Data de cadastro** é o marco zero para cálculo de lead-time total do SKU
- **Compra bloqueada** (E02) sinaliza que o SKU está travado antes mesmo de chegar à E03
- **Contrato liberado** (E03) indica se a proposta comercial foi concluída no LN
- **Produzido site** (E06) indica se o conteúdo do produto está pronto para publicação no site
- **Produzido loja física** (E07) indica se o conteúdo do produto está pronto para loja física

> ℹ️ Uma **única chamada** à API Catálogo retorna os dados necessários para as etapas E01, E02, E03, E06 e E07 do tracking. Isso simplifica a composição de dados no BFF.

---

## Regras de Negócio

- Todo SKU nasce com `compra_bloqueada = true`
- A flag só é alterada após conclusão da [[E02-validacao-fiscal]]
- SKUs do tipo `Digital/Download` podem ter fluxo diferenciado nas etapas de Estoque ([[E05-estoque]])
- SKUs em `Pre-lancamento` podem aparecer no site sem preço ou estoque ([[E09-exibicao-site-loja]])

---

## Gaps / Perguntas em Aberto

| # | Pergunta | Responsável | Status |
|---|----------|-------------|--------|
| 1 | ~~Qual API/endpoint do Catálogo retorna esses dados?~~ | Time Catálogo | ✅ Resolvido — `GET /api/v1/produto-sku/selecionar` |
| 2 | Existe evento Kafka publicado quando um SKU é cadastrado? | Time Plataforma | Aberto |
| 3 | O tipo de produto pode mudar após o cadastro? | Regra de negócio | Aberto |
| 4 | O que representa cada item do array `Mercadorias`? (múltiplos lojistas?) | Time Catálogo | Aberto |

---

## Referências

- [[sku-lifecycle]] — Pipeline completo
- [[PRD-001-tracking-sku-lifecycle]] — Requisitos do produto
- [[E02-validacao-fiscal]] — Próxima etapa
