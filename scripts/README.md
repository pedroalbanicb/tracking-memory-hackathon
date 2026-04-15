# Scripts — Tracking GraphQL Tests

Pasta de scripts para testes rápidos de GraphQL queries e mutations.

## Scripts auxiliares para mocks do tracking

Os scripts abaixo existem para apoiar a futura estratégia de mocks em larga escala sem alterar a API/BFF agora.

### `inspect-produto-collection.js`

Inspeciona a collection `produto` no MongoDB para descobrir caminhos de campos relacionados a SKU e descrição.

```bash
npm run inspect:produto -- --uri "mongodb://..." --db db_prd_casasbahia --collection produto --limit 3
```

### `capture-tracking-mock-inputs.js`

Lê os SKUs reais de `db_oferta_disponibilidade.DisponibilidadeSkuListaRegiao.json`, consulta serviços reais configurados por env/argumentos e gera uma base consolidada para mock.

Suportes opcionais:

- GraphQL de mercadorias
- API Oferta
- MongoDB (`collection produto`)

```bash
npm run capture:tracking-mock-inputs -- --uri "mongodb://..." --db db_prd_casasbahia --collection produto --limit 50
```

### `generate-tracking-mock-payload.js`

Gera centenas de registros mockados a partir do snapshot consolidado e já documenta as feature flags candidatas para o futuro consumo.

```bash
npm run generate:tracking-mocks -- --count 300
```

Flags desenhadas no payload gerado:

- `TRACKING_USE_BIG_MOCKS`
- `TRACKING_MOCK_MODE`
- `TRACKING_MOCK_SOURCE_PATH`

## Rodando os testes

### JavaScript
```bash
node test-graphql.js
```

### Python
```bash
python test-graphql.py
```

## O que testa

- ✅ GraphQL query builder
- ✅ Request structure validation
- ✅ Response mock structures
- ✅ Mutation examples
- ✅ Schema validation basics
- ✅ Discovery técnico para mocks em larga escala

## Próximos passos

- [ ] Conectar o snapshot consolidado a um interceptor real no frontend/BFF
- [ ] Refinar regras por endpoint antes da implementação dos mocks
- [ ] Adicionar versionamento de datasets mockados por cenário
