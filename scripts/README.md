# Scripts — Tracking GraphQL Tests

Pasta de scripts para testes rápidos de GraphQL queries e mutations.

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

## Próximos passos

- [ ] Integrar com `@apollo/client` ou `graphql-request`
- [ ] Conectar a endpoint real da API Tracking
- [ ] Adicionar testes de performance (n8n queries)
- [ ] Subscription tests (WebSocket)
