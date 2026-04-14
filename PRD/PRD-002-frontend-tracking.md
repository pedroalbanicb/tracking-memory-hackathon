---
tags: [prd, tracking, frontend, ux, go]
status: draft
autor: Lucas Rocha
data: 2026-04-14
revisores: [Pedro Albani, Douglas Wolff]
updated: 2026-04-14
prd-relacionado: "[[PRD-001-tracking-sku-lifecycle]]"
---

# PRD-002 — Interface de Tracking de Produtos GO

**Status:** Draft  
**Autor:** Lucas Rocha  
**Data:** 2026-04-14  
**Revisores:** Pedro Albani, Douglas Wolff

---

## 1. Problema

Os analistas GO e gestores de categoria não possuem uma interface visual centralizada para acompanhar o ciclo de vida de um SKU 1P. O status de cada etapa do pipeline — fiscal, estoque, produção, pricing e exibição — está fragmentado em múltiplos sistemas (GO, TAX-WEB, LN, ADMIN, SQL), exigindo consultas manuais e dependência de pessoas específicas para diagnóstico.

Ver contexto de negócio completo em [[PRD-001-tracking-sku-lifecycle]].

## 2. Objetivo

Entregar um módulo de interface integrado ao sistema GO que permita:

- Consultar e filtrar SKUs 1P pelo status de cada etapa do pipeline de forma unificada
- Identificar rapidamente quais etapas estão bloqueando um SKU
- Acessar o detalhamento completo de um SKU com sua ficha cadastral e resumo visual de etapas

## 3. Usuários

| Persona              | Necessidade                                                                         |
| -------------------- | ----------------------------------------------------------------------------------- |
| Analista GO          | Ver em qual etapa um SKU específico está bloqueado e quais campos causam o bloqueio |
| Gerente de Categoria | Acompanhar o status de múltiplos SKUs de uma categoria de forma visual              |
| TI / Suporte         | Identificar padrões de falha sistêmica por etapa do pipeline                        |

## 4. Contexto

Este PRD cobre exclusivamente os **requisitos de interface** do Tracking. Os requisitos de negócio, fontes de dados e regras do pipeline estão documentados em:

- [[PRD-001-tracking-sku-lifecycle]] — visão geral do produto
- [[sku-lifecycle]] — pipeline de 9 etapas com fontes e campos por etapa
- [[regras-exibicao-sku]] — regras de flags de exibição (E08–E09)

> **Escopo restrito a produtos 1P.** Ver [[sku-on-off-1p-3p]].

O sistema é **multi-bandeira**: Casas Bahia (CB), Extra (EX) e Ponto Frio (PF).

## 5. Solução Proposta

### 5.1 Navegação

O módulo é integrado ao sistema **GO** como uma nova entrada na sidebar:

```
Sidebar GO
└── 📊 Tracking          ← novo item
```

Ao clicar no item, o usuário é direcionado à tela de lista de produtos (§ 5.2).

---

### 5.2 Tela 1 — Lista de Produtos

Tela principal do módulo. Exibe a lista de SKUs com o status de cada etapa do pipeline visível diretamente na tabela.

#### 5.2.1 Toolbar

| Elemento         | Tipo           | Comportamento                                                                |
| ---------------- | -------------- | ---------------------------------------------------------------------------- |
| Campo de busca   | Input de texto | Filtra a tabela por SKU OFF, SKU ON, Mercadoria ou Categoria (busca reativa) |
| Reload Data      | Botão          | Recarrega os dados da tabela a partir das fontes                             |
| Expandir Filtros | Botão          | Abre/colapsa o painel de filtros avançados                                   |

#### 5.2.2 Filtros Avançados (painel expansível)

Critérios disponíveis ao expandir o painel: 🟡 a confirmar — ver [Perguntas em Aberto](#10-perguntas-em-aberto).

#### 5.2.3 Tabela — Colunas

A tabela exibe as seguintes colunas, nesta ordem:

| #   | Coluna             | Tipo     | Valores possíveis / Notas                                                          |
| --- | ------------------ | -------- | ---------------------------------------------------------------------------------- |
| 1   | SKU OFF            | Texto    | Identificador backoffice do SKU                                                    |
| 2   | SKU ON             | Texto    | Identificador do SKU no site                                                       |
| 3   | Mercadoria         | Texto    | Descrição do SKU                                                                   |
| 4   | Tipo Negociação    | Texto    | `N/A`, `Crossdocking`, `Estoque Físico`, `Estoque Virtual`, `Pré-Lançamento`, etc. |
| 5   | Cadastro           | Ícone    | `✓` verde (E01)                                                                    |
| 6   | Validação Fiscal   | Ícone    | `✓` verde · `✗` vermelho (E02)                                                     |
| 7   | Proposta Comercial | Ícone    | `✓` verde · `✗` vermelho (E03)                                                     |
| 8   | Estoque            | Ícone    | `✓` verde · `✗` vermelho (E05)                                                     |
| 9   | Produzido Site     | Ícone    | `✓` verde · `✗` vermelho (E06)                                                     |
| 10  | Produzido LF       | Ícone    | `✓` verde · `✗` vermelho (E07 — Loja Física)                                       |
| 11  | Ativação Pricing   | Ícone    | `✓` verde · `✗` vermelho (E08)                                                     |
| 12  | Exibição Site      | Ícone    | `✓` verde · `✗` vermelho (E09)                                                     |
| 13  | Detalhes           | Ícone 👁 | Abre a tela de detalhe do SKU (§ 5.3)                                              |

> **E04 (Agendamento) não é exibido como coluna da tabela** — omitido do design conforme [Figma IC-Table](https://www.figma.com/design/QNFpM0akFGXYC2gfcjkHba/Tracking?node-id=122-5896).  
> As colunas **Cadastro** a **Exibição Site** representam as etapas exibidas do pipeline [[sku-lifecycle]].  
> Ver sistema de ícones em § 6.1.

#### 5.2.4 Contrato de API — Listagem da Tabela

Para suportar a renderização da tabela de listagem, o backend deve expor um contrato único de leitura.

**Endpoint sugerido:** `GET /api/tracking/skus`

##### Parâmetros de request

| Parâmetro              | Tipo     | Obrigatório | Descrição                                          |
| ---------------------- | -------- | ----------- | -------------------------------------------------- |
| `sku`                  | string   | Não         | Busca por SKU OFF, SKU ON, Mercadoria ou Categoria |
| `pagina`               | integer  | Não         | Página atual (default: 1)                          |
| `filtroEtapa`          | string[] | Não         | Etapas para filtrar por bloqueio/conclusão         |
| `filtroTipoNegociacao` | string[] | Não         | Ex.: `N_A`, `CROSSDOCKING`, `ESTOQUE_FISICO`       |
| `filtroCategoria`      | string[] | Não         | Categoria/subcategoria                             |

> Os parâmetros de filtro permanecem sob validação funcional (ver § 10).

##### Response ideal (listagem)

```json
{
  "data": {
    "items": [
      {
        "id": "5163847",
        "skuOff": "5163847",
        "skuOn": "55052266",
        "mercadoria": "BATATA PRINGLES QUEIJO CHEDDAR",
        "tipoNegociacao": "NORMAL",
        "cadastro": true,
        "validacaoFiscal": false,
        "propostaComercial": true,
        "estoque": true,
        "produzidoSite": true,
        "produzidoLf": true,
        "ativacaoPricing": true,
        "exibicaoSite": true
      }
    ],
    "total": 2847
  }
}
```

##### Regras de payload para colunas de etapa

- As colunas de etapa (Cadastro até Exibição Site) devem ser booleanas (`true`/`false`)
- O frontend é responsável por mapear:
  - `true` → `✓` verde
  - `false` → `✗` vermelho
- Não retornar objeto de apresentação por etapa (`status`, `icon`, `color`)

##### Mapeamento campo API → coluna da tabela

| Coluna UI                | Campo API           | Tipo    |
| ------------------------ | ------------------- | ------- |
| SKU OFF                  | `skuOff`            | string  |
| SKU ON                   | `skuOn`             | string  |
| Mercadoria               | `mercadoria`        | string  |
| Tipo Negociação          | `tipoNegociacao`    | string  |
| Cadastro (E01)           | `cadastro`          | boolean |
| Validação Fiscal (E02)   | `validacaoFiscal`   | boolean |
| Proposta Comercial (E03) | `propostaComercial` | boolean |
| Estoque (E05)            | `estoque`           | boolean |
| Produzido Site (E06)     | `produzidoSite`     | boolean |
| Produzido LF (E07)       | `produzidoLf`       | boolean |
| Ativação Pricing (E08)   | `ativacaoPricing`   | boolean |
| Exibição Site (E09)      | `exibicaoSite`      | boolean |
| Detalhes                 | `id`                | string  |

---

### 5.3 Tela 2 — Detalhe do SKU

Acessada ao clicar no ícone 👁 na tabela da lista. Exibe a ficha completa do SKU.

**Navegação:** breadcrumb com link de retorno para a lista + botão "← Voltar".

#### 5.3.1 Badge Geral do Pipeline

Badge exibido no topo da tela, ao lado do título:

| Condição                 | Badge                             | Cor      |
| ------------------------ | --------------------------------- | -------- |
| Nenhuma etapa bloqueada  | `✓ SKU ATIVO — Pipeline Completo` | Verde    |
| 1 ou mais etapas com `✗` | `⚠ N etapa(s) bloqueada(s)`       | Vermelho |

#### 5.3.2 Seção — Dados Gerais

| Campo              | Fonte                     |
| ------------------ | ------------------------- |
| SKU OFF            | GO / API Catálogo (E01)   |
| SKU ON             | GO / API Catálogo (E01)   |
| Tipo de Mercadoria | GO / API Catálogo (E01)   |
| Descrição do SKU   | GO / API Catálogo (E01)   |
| EAN Tributário     | GO / API Catálogo (E01)   |
| EAN Master         | GO / API Catálogo (E01)   |
| EAN Operacional    | GO / API Catálogo (E01)   |
| Situação Cadastral | GO (ex: `OK`, `DEFASADO`) |

Ver detalhamento dos campos em [[E01-cadastro-inicial]].

#### 5.3.3 Seção — Categorização

| Campo         |
| ------------- |
| Diretoria     |
| Categoria     |
| Sub Categoria |
| Espécie       |
| Sub Espécie   |

#### 5.3.4 Seção — Dados Fabricante

| Campo                           |
| ------------------------------- |
| CNPJ Fornecedor                 |
| Nome Fornecedor                 |
| Marca Comercial                 |
| Garantia Fabricante (meses)     |
| Modelo                          |
| Descrição Modelo                |
| Código Produto Fornecedor (SKU) |

#### 5.3.5 Seção — Status das Etapas do Pipeline

Seção exibida após os dados do fabricante, listando as 9 etapas do pipeline. Cada etapa é apresentada como um **card/linha com background colorido** conforme seu estado:

| Estado    | Background | Ícone | Significado      |
| --------- | ---------- | ----- | ---------------- |
| Concluído | Verde      | `✓`   | Etapa satisfeita |
| Bloqueado | Vermelho   | `✗`   | Etapa com falha  |

Cada card/linha exibe:

- Nome da etapa (ex: `Validação Fiscal`)
- Referência da etapa (ex: `E02`)
- Sistema de origem (ex: `TAX-WEB`)
- Ícone de estado (`✓` ou `✗`)

O badge de contagem de etapas bloqueadas (§ 5.3.1) resume o total de etapas com estado `✗`.

Referência de etapas: [[sku-lifecycle]].

## 6. Componentes Visuais

### 6.1 Ícones e Backgrounds de Etapa

Usados tanto nas colunas da tabela da lista (§ 5.2.3) quanto nos cards de etapa do detalhe (§ 5.3.5):

| Estado    | Ícone | Background do card (detalhe) | Significado      |
| --------- | ----- | ---------------------------- | ---------------- |
| Concluído | `✓`   | Verde                        | Etapa satisfeita |
| Bloqueado | `✗`   | Vermelho                     | Etapa com falha  |

### 6.2 Cabeçalho da Aplicação (Topbar)

O módulo herda a topbar do sistema GO, que inclui:

- Logo da bandeira ativa (CB, EX ou PF)
- Nome da aplicação `GO — Gestão de Operações`
- Nome do usuário logado e avatar

## 7. Comportamentos e Interações

> 🟡 **TO-DO** — Fase 3 a ser detalhada.
>
> Tópicos previstos: navegação lista ↔ detalhe, busca reativa, estado de loading, empty states, scroll-to-top ao abrir detalhe, comportamento do painel de filtros.

## 8. Critérios de Aceite

- [ ] O item "Tracking" aparece na sidebar do GO e navega para a tela de lista
- [ ] A busca filtra a tabela por SKU OFF, SKU ON, Mercadoria e Categoria
- [ ] A tabela exibe as 13 colunas na ordem definida em § 5.2.3
- [ ] As colunas de pipeline (Cadastro a Exibição Site) exibem `✓` verde ou `✗` vermelho conforme o status de cada etapa
- [ ] O ícone 👁 na coluna "Detalhes" navega para a tela de detalhe do SKU correspondente
- [ ] O badge geral exibe corretamente "SKU Ativo" ou "N etapa(s) bloqueada(s)" com a contagem correta
- [ ] Na tela de detalhe, cada etapa do pipeline é exibida com background verde (concluída) ou vermelho (bloqueada)
- [ ] O sistema exibe dados das bandeiras CB, EX e PF (multi-bandeira)
- [ ] O botão "Reload Data" recarrega os dados da tabela
- [ ] O botão "Expandir Filtros" abre e fecha o painel de filtros avançados

## 9. Fora do Escopo

- Pipeline visual estilo stepper (círculos conectados por linha horizontal)
- Exportação de dados (CSV, Excel ou qualquer formato)
- Alteração de dados — o módulo é somente leitura (observabilidade)
- Produtos **3P** (marketplace) — ver [[sku-on-off-1p-3p]]
- Gestão de cadastro de produtos (já existe no GO)

## 10. Perguntas em Aberto

| #   | Pergunta                                                                                                                                                        | Responsável           | Status         |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------- |
| 1   | Quais parâmetros de filtros avançados da API de listagem serão oficialmente suportados e validados? (ex: etapa bloqueada, categoria, bandeira, tipo negociação) | Lucas Rocha / Juliana | 🔴 Não mapeado |
| 2   | A seleção de bandeira (CB/EX/PF) é feita na topbar global do GO ou dentro da tela de Tracking?                                                                  | Lucas Rocha           | 🔴 Não mapeado |
| 3   | O botão "Reload Data" exibe indicador de "última atualização" (timestamp)?                                                                                      | Lucas Rocha           | 🟡 A confirmar |
| 4   | Existem restrições de permissão por persona? (ex: TI/Suporte vs. Analista GO)                                                                                   | Pedro Albani          | 🔴 Não mapeado |
| 5   | Qual o comportamento de empty state quando a busca não retorna resultados?                                                                                      | Lucas Rocha           | 🟡 A confirmar |
