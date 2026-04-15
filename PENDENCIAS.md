---
tags: [tracking, pendencias, consolidado]
status: ativo
updated: 2026-04-15
autor: Pedro Martins
---

# Pendências — Tracking GO

> Arquivo único e objetivo com tudo que falta. Atualizado em 10/04/2026.

---

## 🔴 SME — Precisam de resposta de alguém

| # | O que precisa | Pendência específica | Arquivo | Quem | Status |
|---|---------------|----------------------|---------|------|--------|
| ~~S1~~ | ~~API/tabela do Admin (site)~~ | ~~`FlagSkuProduzido` endpoint?~~ | [[E06-produzido]] | ~~Juliana~~ | ✅ Resolvido: `Mercadorias[].Geral.FlagSkuProduzido` via API Catálogo (ADR-003) |
| ~~S2~~ | ~~API/tabela do Admin (loja)~~ | ~~`FlagSkuProduzidoLojaFisica` endpoint?~~ | [[E07-produzido-loja]] | ~~Juliana~~ | ✅ Resolvido: `Mercadorias[].Geral.FlagSkuProduzidoLojaFisica` via API Catálogo (ADR-003) |
| ~~S3~~ | ~~Evento Kafka de conteúdo~~ | ~~Topic Kafka quando SKU produzido?~~ | [[E06-produzido]], [[E07-produzido-loja]] | ~~Juliana~~ | ✅ Não necessário: dados via API Catálogo (leitura) |
| S4 | Nome oficial do ERP | BAAN, LN e Infor — qual é o nome que o time usa? | [[E03-proposta-comercial]] | Ricardo | 🔴 Aberta |
| S5 | Workbench é módulo ou sistema? | Citado como "Mapa de Comercialização → Contrato de Compras" — é tela dentro do LN ou app separado? | [[E04-agendamento]] | Ricardo | 🔴 Aberta |
| S6 | Tabela de FlagSkuSaldoDisponivel | Douglas atribui ao `Sku`, query SQL sugere `SkuLojista` — qual tabela é a real? | [[E09-exibicao-site-loja]] | Douglas Wolff | 🔴 Aberta |
| S7 | Valores EstoqueRestricao.Tipo | Só `'BT'` (bloqueio total) ou existem outros? `'BP'` (parcial) existe? | [[E05-estoque]] | Douglas Wolff | 🟡 Nice-to-have (E05 implementado via API Oferta) |
| S8 | Marca = tabela real? | Tabela `Marca` é realmente a origem da flag na query E09? | [[E09-exibicao-site-loja]] | Douglas Wolff | 🔴 Aberta |

---

## 🟡 Nós — Podemos resolver sem depender de ninguém

| # | O que precisa | Pendência específica | Arquivo | Status |
|---|---------------|----------------------|---------|--------|
| N1 | Script Python — consultas SQL/API | Criar ferramenta CLI para validar conexões e consultar dados reais (ver seção abaixo) | [[PENDENCIAS]] | Planejado |

---

## 🟠 Backlog — Baixa prioridade

| # | O que precisa | Pendência específica | Arquivo | Quem |
|---|---------------|----------------------|---------|------|
| B1 | Qual ERP da FlagAtivaERP | `FlagAtivaERP` — é o LN/BAAN que seta? Ou outro sistema? | [[E09-exibicao-site-loja]] | Ricardo |
| B2 | CategoriaNeto — nome oficial? | `CategoriaNeto` — é nome oficial da hierarquia (2º nível de Categoria) ou apelido informal? | [[E09-exibicao-site-loja]], [[regras-exibicao-sku]] | Time Catálogo |
| B3 | Pulso de estoque — mecanismo | É job agendado, trigger de banco ou evento Kafka? Qual frequência? | [[E09-exibicao-site-loja]], [[regras-exibicao-sku]] | Ricardo |
| B4 | Tax Web — o que é? | Sistema interno, vendor (Thomson Reuters, Avalara etc) ou nome de time? | [[E02-validacao-fiscal]] | Juliana / Time Fiscal |
| B5 | Admin — mesmo sistema? | É o mesmo sistema em E06, E07 e E08 ou são módulos/apps diferentes? | [[E06-produzido]], [[E07-produzido-loja]], [[E08-ativacao-pricing]] | Juliana |
| B6 | Manhattan WMS — relação | É o sistema de logística que popula o Banco Inventário (`DB_SIT_OMS_INVENTARIO`)? | [[E05-estoque]] | Time Abastecimento |
| B7 | OMS — qual sistema? | `DB_SIT_OMS_FULFILLMENT` encontrado no cluster — é o OMS citado em E05? Qual produto (Sterling, interno)? | [[E05-estoque]] | Time OMS |

---

## 🔧 Script Python — Plano de Ferramentas

### Objetivo

Script CLI simples para consultas diretas nos bancos e APIs do pipeline. Permite validar o que está documentado com dados reais.

### O que já temos documentado (pronto para codificar)

| Fonte | Tipo | Detalhes conhecidos | Etapas |
|-------|------|---------------------|--------|
| API Catálogo | REST GET | Endpoint, composição, autenticação por `apikey`, curl testado em HLG | E01, E02, E03 |
| Banco Inventário | SQL Server | Schema `Inventario`, 11 tabelas, JOINs, aliases, linked server `CORP_PRD` | E05 |
| SQL Corp | SQL Server | Tabelas `SkuLojista`, `SkuLojistaPreço`, `Sku`, `Produto`, `Marca`, `Categoria` (4 níveis) | E08, E09 |
| MONGOS | MongoDB | MongoDB de Pricing — serve flags para o site. Collection/host desconhecidos | E09 |

### Scripts planejados

```
tools/
├── requirements.txt          # pyodbc/pymssql, pymongo, requests, python-dotenv
├── .env.example              # Template de credenciais
├── check_connections.py      # Valida conexões (SQL Corp, Inventário, MongoDB, API Catálogo)
├── query_catalogo.py         # GET API Catálogo — E01/E02/E03 por IdSkuSite
├── query_estoque.py          # SQL Inventário — E05 por IdSku
├── query_flags_exibicao.py   # SQL Corp — E09 flags (14+ flags, 6 tabelas)
├── query_mongos.py           # MongoDB MONGOS — flags replicadas
└── compare_sql_mongo.py      # Compara SQL Corp vs MONGOS por SKU (V2)
```

### O que preciso para começar

| Item | Quem fornece | Status |
|------|-------------|--------|
| Connection string SQL Corp (SIT/HLG) | Pedro (10/04) | ✅ Pronto — 3 bandeiras × 2 ambientes |
| Connection string MONGOS (SIT/HLG) | Pedro (10/04) | ✅ Pronto — 3 bandeiras × 2 ambientes |
| Connection string Banco Inventário | Pedro (10/04) | ✅ Pronto — `DB_SIT_OMS_INVENTARIO` no cluster HSQLECOM01 |
| Cluster HSQLECOM (VDI) | Pedro (10/04) | ✅ Mapeado — 2 servers, 13 databases |
| API Key Catálogo HLG | Já temos (testada 09/04) | ✅ Pronto |
| VPN ativa para acessar bancos internos | Pedro | ✅ Configurado |
| Python 3.11+ instalado | Pedro | ✅ Disponível |

> Credenciais salvas em `workspace/sources/credenciais-bancos-oferta.md` (não versionado).
> Cluster: `CL-HSQLECOM01.dc.nova\HSQLECOM01, 1001` e `CL-HSQLECOM10.dc.nova\HSQLECOM10, 1010`

### Query E09 — Pronta para codificar

```sql
SELECT
    sl.FlagAtiva        AS SkuLojista_FlagAtiva,
    -- slp.FlagAtiva    AS SkuLojistaPreco_FlagAtiva,  -- tabela SkuLojistaPreço
    s.FlagAtiva         AS Sku_FlagAtiva,
    s.FlagAtivaERP      AS Sku_FlagAtivaERP,
    s.FlagSkuProduzido  AS Sku_FlagSkuProduzido,
    s.FlagSkuSaldoDisponivel AS Sku_FlagSkuSaldoDisponivel,  -- ⚠️ tabela real a confirmar (S6)
    -- s.FlagSkuProduzidoLojaFisica  -- comentada/legada
    p.FlagAtiva         AS Produto_FlagAtiva,
    p.FlagExibe         AS Produto_FlagExibe,
    p2.FlagAtiva        AS Marca_FlagAtiva,    -- ⚠️ alias p2 a confirmar (S8)
    c.FlagAtiva         AS Categoria_FlagAtiva,
    c1.FlagAtiva        AS CategoriaPai_FlagAtiva,
    c2.FlagAtiva        AS CategoriaNeto_FlagAtiva,
    c3.FlagAtiva        AS Departamento_FlagAtiva
FROM SkuLojista sl
    -- JOINs a confirmar com query real do Douglas Souza Wolff
WHERE sl.IdSku = @IdSku
```

### Query E05 — Pronta para codificar

```sql
SELECT
    ser.QuantidadeDisponivel,
    ser.QuantidadeReservada,
    ser.QuantidadeTotal,
    er.Tipo AS RestricaoTipo,
    te.Tipo AS TipoEstoque,
    te.Nome AS NomeTipoEstoque,
    ste.PrazoDias,
    m.DataPrevisaoChegada,
    f.Ativa AS FilialAtiva,
    f.RetiraEmLoja,
    f.CentroDistribuicao,
    FCORP.EntregaNacional
FROM Inventario.SaldoEstoqueRestricao ser
    JOIN Inventario.EstoqueRestricao er ON ser.IdRestricao = er.IdRestricao
    LEFT JOIN Inventario.SaldoTipoEstoque ste ON ser.IdSaldoTipoEstoque = ste.IdSaldoTipoEstoque
    JOIN Inventario.TipoEstoque te ON ste.IdTipoEstoque = te.IdTipoEstoque
    LEFT JOIN Inventario.SaldoSkuFilial sf ON ste.IdSaldoSkuFilial = sf.IdSaldoSkuFilial
    JOIN Inventario.Modalidade m ON sf.IdSku = m.IdModalidadeSku
    LEFT JOIN Inventario.Filial f ON sf.IdFilial = f.IdFilial
    JOIN [CORP_PRD].[dbo].[Filial] FCORP ON f.CNPJ = FCORP.CNPJ
WHERE m.IdSkuOrigem = @IdSku
  AND ser.QuantidadeDisponivel > 0
```

### API Catálogo — Pronta para codificar

```python
# E01 + E02 + E03 numa única chamada
GET https://gestaoproduto-catalogo-hlg.viavarejo.com.br/api/v1/produto-sku/selecionar
  ?IdSkuSite={id_sku}
  &composicao=Geral.Nome;
    Mercadorias.DadosBasicos.NomeTipoSku;
    Mercadorias.DadosBasicos.FlagCrossDocking;
    Mercadorias.DadosBasicos.FlagCompraBloqueada;
    Mercadorias.DadosBasicos.FlagVendaBloqueada;
    Mercadorias.DadosBasicos.ContratoLiberado;
    Mercadorias.Controle.DataCadastro
Headers: apikey: [API_KEY_ENV]
```

---

## ✅ Resolvido em 10/04/2026

| Item | Resolução |
|------|-----------|
| `ok_fiscal` → campos reais | `FlagCompraBloqueada` / `FlagVendaBloqueada` (int 0/1) |
| `SKLogista` → nome real | `SkuLojista` (48 ocorrências corrigidas) |
| Corp → definição | SQL Server corporativo (banco compartilhado) |
| MONGOS → definição | MongoDB de Pricing (Mongo Pricing) |
| FLAVIA → erro STT | "flag atualiza" — flag atualizada via pulso de estoque |
| P3 quick fixes (11 itens) | rundeck, fonte E03, RFC stubs, mapeamento, overview, mock |
| Dois Douglas → desambiguação | Nomes completos + papel em todas as citações |
| Modelo de steps | Corrigido: cada step é consulta de estado independente, não dependência sequencial |
| Redundância vault | PLANO-AMANHA, RESUMO-EXECUTIVO e detail stubs vazios removidos |
