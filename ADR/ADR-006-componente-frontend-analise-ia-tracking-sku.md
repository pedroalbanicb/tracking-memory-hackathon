---
tags: [adr, tracking, ia, frontend, gemini, hackathon]
status: proposed
data: 2026-04-15
autores: [guilherme.thomaz@viavarejo.com.br]
rfc-relacionada: 
updated: 2026-04-15
---

# ADR-006 — Componente Front-end de Análise IA no Detalhe do SKU

**Status:** Proposed  
**Data:** 2026-04-15  
**Autores:** Guilherme Maesta Domke de Thomaz  
**RFC relacionada:** *(nenhuma)*  
**ADR relacionada:** [[ADR-005-analise-ia-gemini-vertex-tracking-sku]]

---

## Contexto

O endpoint `GET /api/v1/tracking/analise-ia/{idSkuSite}` foi implementado no backend e está funcional (ver ADR-005). Ele retorna uma análise em linguagem natural gerada pelo Gemini 2.5 Flash, consolidando as 9 etapas do pipeline de tracking.

Atualmente, o operador de gestão de produto não tem acesso a essa análise via interface — ela só pode ser consumida via chamada direta à API. Esta ADR documenta a decisão de design e implementação do componente front-end que expõe essa funcionalidade na página de detalhe do SKU (`gestaoproduto-plataforma-web`).

---

## Decisão

**Decidimos:** implementar um componente React chamado `AnaliseIAPanel` na página de detalhe do SKU, acionado por botão explícito (não carregamento automático), que exibe o badge de diagnóstico local e o texto completo gerado pelo Gemini.

---

## Especificação técnica

### Endpoint consumido

```
GET /api/v1/tracking/analise-ia/{idSkuSite}
Authorization: Bearer {token}
```

### Response esperada

```json
{
  "isOk": true,
  "data": {
    "idSkuSite": 19,
    "diagnostico": "Offline — bloqueadores: exibição indisponível.",
    "analise": "## Análise do SKU 19\n\nO SKU está bloqueado porque...",
    "geradoEm": "2026-04-15T17:09:32Z",
    "modelo": "gemini-2.5-flash"
  }
}
```

### Interface TypeScript

```typescript
// src/interface/TrackingAnaliseIA.ts
export interface TrackingAnaliseIAResponse {
  idSkuSite: number;
  diagnostico: string;
  analise: string;
  geradoEm: string;
  modelo: string;
}

export interface TrackingAnaliseIAApiResponse {
  isOk: boolean;
  message: string;
  data: TrackingAnaliseIAResponse | null;
}
```

### Service

```typescript
// src/services/trackingAnaliseIAService.ts
import api from './api'; // instância axios configurada
import { TrackingAnaliseIAApiResponse } from '@/interface/TrackingAnaliseIA';

export const getAnaliseIA = async (
  idSkuSite: number
): Promise<TrackingAnaliseIAApiResponse> => {
  const { data } = await api.get<TrackingAnaliseIAApiResponse>(
    `/api/v1/tracking/analise-ia/${idSkuSite}`
  );
  return data;
};
```

### Hook

```typescript
// src/hooks/useAnaliseIA.ts
import { useQuery } from 'react-query';
import { getAnaliseIA } from '@/services/trackingAnaliseIAService';

export const useAnaliseIA = (idSkuSite: number, enabled: boolean) =>
  useQuery(
    ['analise-ia', idSkuSite],
    () => getAnaliseIA(idSkuSite),
    {
      enabled,          // só dispara quando o botão for clicado
      staleTime: 5 * 60 * 1000, // 5 minutos de cache no cliente
      retry: 1,
    }
  );
```

### Componente

```tsx
// src/components/AnaliseIAPanel/AnaliseIAPanel.tsx
import React, { useState } from 'react';
import { useAnaliseIA } from '@/hooks/useAnaliseIA';
// Usar componentes @intcom/* para loading, badge, typography

interface Props {
  idSkuSite: number;
}

export const AnaliseIAPanel: React.FC<Props> = ({ idSkuSite }) => {
  const [enabled, setEnabled] = useState(false);
  const { data, isLoading, isError } = useAnaliseIA(idSkuSite, enabled);

  return (
    <div>
      {!enabled && (
        <button onClick={() => setEnabled(true)}>
          Analisar com IA ✨
        </button>
      )}

      {isLoading && <p>Analisando o SKU com Gemini...</p>}

      {isError && <p>Erro ao obter análise. Tente novamente.</p>}

      {data?.isOk && data.data && (
        <div>
          {/* Badge local — determinístico */}
          <span className="badge">{data.data.diagnostico}</span>

          {/* Análise completa do Gemini — renderizar como markdown */}
          <div className="analise-texto">
            {data.data.analise}
          </div>

          <small>
            Modelo: {data.data.modelo} ·
            Gerado em: {new Date(data.data.geradoEm).toLocaleString('pt-BR')}
          </small>
        </div>
      )}
    </div>
  );
};
```

---

## UX — Fluxo esperado

```
Operador abre detalhe do SKU
  │
  └─ Vê botão "Analisar com IA ✨"
       │
       └─ Clica no botão
            │
            ├─ Loading state (~5-10s — chamada ao Gemini)
            │
            └─ Resultado:
                 ├─ Badge: "Offline — bloqueadores: ..."  (diagnóstico local, instantâneo)
                 └─ Texto longo com análise completa do Gemini (markdown)
```

**Por que botão explícito e não carregamento automático?**
- A chamada demora 5-10 segundos (LLM + 9 etapas paralelas) — não pode bloquear o carregamento da página
- Cada chamada tem custo de inferência no Vertex AI — acionar só quando o operador precisar
- Evita sobrecarga desnecessária na API em listas com muitos SKUs

---

## Consequências

### Positivas
- Reutiliza toda a infraestrutura existente do BFF sem alterações
- O operador tem acesso à análise IA sem sair da tela de detalhe
- O `staleTime` de 5min no React Query evita chamadas repetidas desnecessárias

### Negativas / Trade-offs
- Latência percebida de ~5-10s após o clique — mitigável com bom feedback visual de loading
- Sem streaming da resposta — o texto aparece completo de uma vez só

### Neutras
- O componente não sabe nada sobre o Gemini — consome apenas a API REST do BFF
- A renderização do markdown gerado pelo Gemini pode requerer biblioteca adicional (ex: `react-markdown`)

---

## Alternativas Rejeitadas

| Alternativa | Motivo de rejeição |
|---|---|
| Carregamento automático ao abrir o detalhe | Latência de 5-10s inaceitável; custo por visualização de página |
| Streaming da resposta (SSE / WebSocket) | Requer mudanças no BFF; complexidade desnecessária no hackathon |
| Exibir análise em modal separado | Quebra o fluxo — o operador precisa ver a análise junto com os dados do SKU |

---

## Referências

- [[ADR-005-analise-ia-gemini-vertex-tracking-sku]]
- Endpoint: `GET /api/v1/tracking/analise-ia/{idSkuSite}` — BFF `gestaoproduto-plataforma-api`
- Repo front-end: `gestaoproduto-plataforma-web`
- Stack: React 18 + Vite + TypeScript + Tailwind + React Query v3 + `@intcom/*`
