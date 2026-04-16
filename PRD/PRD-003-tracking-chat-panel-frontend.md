---
tags: [prd, tracking, frontend, chat, ia, hackathon]
status: ready-for-dev
autor: Pedro Albani Martins
data: 2026-04-16
revisores: [Guilherme Maesta]
updated: 2026-04-16
prd-relacionado: "[[PRD-002-frontend-tracking]]"
adr-relacionada: "[[ADR-009-tracking-agent-mcp-context-chat-endpoint]]"
---

# PRD-003 — Tracking Chat Panel: Interface Conversacional com o Tracking Agent

**Status:** Ready for Dev  
**Autor:** Pedro Albani Martins  
**Data:** 2026-04-16  
**Revisores:** Guilherme Maesta

---

## 1. Problema

O operador de Gestão de Produto já conta com o painel `AnaliseIAPanel` que exibe um diagnóstico automático do SKU. Porém, o diagnóstico é estático — o operador não consegue fazer perguntas de acompanhamento, pedir mais detalhes ou explorar cenários específicos (ex: "qual time acionar?", "quando isso foi bloqueado?"). A interação é sempre unidirecional.

---

## 2. Objetivo

Adicionar um componente de chat conversacional (`TrackingChatPanel`) na página de detalhe do SKU, permitindo que o operador converse em linguagem natural com o Tracking Agent sobre o status daquele produto.

---

## 3. Usuários

| Persona | Necessidade |
|---------|-------------|
| Analista GO / Gestão de Produto | Entender por que um SKU está bloqueado e saber quem acionar, sem depender de pessoas específicas |
| Gestor de Categoria | Diagnóstico rápido durante reuniões ou atendimentos, sem abrir múltiplos sistemas |

---

## 4. Solução Proposta

### 4.1 Componente `TrackingChatPanel`

Um painel de chat dentro da página de detalhe do SKU com:

- **Campo de texto** para o operador digitar a mensagem
- **Histórico da conversa** exibido em balões (user / assistant)
- **Botão de envio** com estado de loading durante a chamada
- **Badge de etapas problemáticas** retornado pela API (reutilizar estilo do `AnaliseIAPanel`)
- **Mensagem inicial sugerida** pré-preenchida: `"Por que esse SKU não está aparecendo no site?"`

O painel é colapsável/expansível. Pode coexistir com o `AnaliseIAPanel` existente ou substituí-lo na aba de IA.

---

## 5. Endpoint da API

### Contrato

```
POST /api/v1/tracking/chat
Authorization: Bearer {token}
Content-Type: application/json
```

### Request Body

```json
{
  "idSkuSite": 55072185,
  "mensagem": "Por que esse SKU não está aparecendo no site?",
  "historico": [
    { "role": "user",      "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

> `historico` deve ser enviado em cada requisição — o backend é stateless. Manter o histórico no estado React (`useState`) e acumulá-lo a cada turno.

### Response

```json
{
  "isOk": true,
  "message": "Chat processado com sucesso",
  "data": {
    "resposta": "O SKU está bloqueado na etapa de Proposta Comercial...",
    "etapasComProblema": ["Proposta Comercial", "Estoque"],
    "analisadoEm": "2026-04-16T14:00:00Z"
  }
}
```

### Comportamento de erro

| Cenário | Comportamento esperado |
|---------|------------------------|
| `isOk: false` | Exibir mensagem de erro inline no chat: "Não foi possível processar sua pergunta. Tente novamente." |
| Timeout / rede | Idem, com botão "Tentar novamente" |
| SKU inválido | API retorna `isOk: false` com `message` — exibir ao usuário |

---

## 6. Interfaces TypeScript

```typescript
// src/interface/TrackingChat.ts

export interface TrackingChatHistoricoItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface TrackingChatRequest {
  idSkuSite: number;
  mensagem: string;
  historico: TrackingChatHistoricoItem[];
}

export interface TrackingChatData {
  resposta: string;
  etapasComProblema: string[];
  analisadoEm: string;
}

export interface TrackingChatApiResponse {
  isOk: boolean;
  message: string;
  data: TrackingChatData | null;
}
```

---

## 7. Service

```typescript
// src/services/trackingChatService.ts
import api from './api';
import { TrackingChatRequest, TrackingChatApiResponse } from '@/interface/TrackingChat';

export const postTrackingChat = async (
  request: TrackingChatRequest
): Promise<TrackingChatApiResponse> => {
  const { data } = await api.post<TrackingChatApiResponse>(
    '/api/v1/tracking/chat',
    request
  );
  return data;
};
```

---

## 8. Hook

```typescript
// src/hooks/useTrackingChat.ts
import { useState } from 'react';
import { postTrackingChat } from '@/services/trackingChatService';
import { TrackingChatHistoricoItem } from '@/interface/TrackingChat';

export const useTrackingChat = (idSkuSite: number) => {
  const [historico, setHistorico] = useState<TrackingChatHistoricoItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [erro, setErro]           = useState<string | null>(null);

  const enviar = async (mensagem: string) => {
    setLoading(true);
    setErro(null);

    const novoHistorico: TrackingChatHistoricoItem[] = [
      ...historico,
      { role: 'user', content: mensagem },
    ];

    try {
      const result = await postTrackingChat({ idSkuSite, mensagem, historico });

      if (!result.isOk || !result.data) {
        setErro(result.message ?? 'Erro ao processar mensagem');
        return;
      }

      setHistorico([
        ...novoHistorico,
        { role: 'assistant', content: result.data.resposta },
      ]);
    } catch {
      setErro('Não foi possível processar sua pergunta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const limpar = () => {
    setHistorico([]);
    setErro(null);
  };

  return { historico, loading, erro, enviar, limpar };
};
```

---

## 9. Componente

```tsx
// src/components/TrackingChatPanel/TrackingChatPanel.tsx
import React, { useState } from 'react';
import { useTrackingChat } from '@/hooks/useTrackingChat';

interface Props {
  idSkuSite: number;
}

const MENSAGEM_INICIAL = 'Por que esse SKU não está aparecendo no site?';

export const TrackingChatPanel: React.FC<Props> = ({ idSkuSite }) => {
  const { historico, loading, erro, enviar, limpar } = useTrackingChat(idSkuSite);
  const [input, setInput] = useState(MENSAGEM_INICIAL);

  const handleEnviar = () => {
    if (!input.trim() || loading) return;
    enviar(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  return (
    <div className="tracking-chat-panel">
      {/* Histórico */}
      <div className="historico">
        {historico.map((item, idx) => (
          <div key={idx} className={`mensagem mensagem--${item.role}`}>
            <span className="role">{item.role === 'user' ? 'Você' : 'Tracking Agent'}</span>
            <p>{item.content}</p>
          </div>
        ))}
        {loading && <div className="mensagem mensagem--loading">Analisando...</div>}
        {erro   && <div className="mensagem mensagem--erro">{erro}</div>}
      </div>

      {/* Input */}
      <div className="input-area">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Faça uma pergunta sobre o SKU..."
          disabled={loading}
          rows={2}
        />
        <button onClick={handleEnviar} disabled={loading || !input.trim()}>
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
        {historico.length > 0 && (
          <button onClick={limpar} disabled={loading}>
            Limpar
          </button>
        )}
      </div>
    </div>
  );
};
```

> **Importante:** usar componentes `@intcom/*` para estilização (loading, badges, typography) seguindo o padrão da plataforma. O código acima usa classes CSS genéricas como referência de estrutura.

---

## 10. Critérios de Aceite

- [ ] Componente `TrackingChatPanel` renderiza na página de detalhe do SKU
- [ ] Campo de texto pré-preenchido com a mensagem sugerida na primeira abertura
- [ ] Ao enviar, exibe estado de loading e desabilita o campo/botão
- [ ] Resposta da API é exibida no histórico como mensagem do "Tracking Agent"
- [ ] Histórico acumula corretamente em múltiplos turnos (multi-turno)
- [ ] Erro da API exibido inline sem quebrar o painel
- [ ] Botão "Limpar" reseta o histórico
- [ ] `Enter` envia a mensagem; `Shift+Enter` quebra linha
- [ ] Componente usa apenas componentes `@intcom/*` de UI (não criar custom desnecessário)
- [ ] Nenhuma chamada HTTP direta no componente — toda lógica via service + hook

---

## 11. Fora do Escopo

- Persistência do histórico entre sessões (stateless por design)
- Notificações push quando o SKU mudar de status
- Chat em tempo real (WebSocket) — requisição REST por turno é suficiente
- Geração de tickets de suporte automático a partir do chat

---

## 12. Referências

- [[ADR-009-tracking-agent-mcp-context-chat-endpoint]] — decisão de arquitetura do endpoint
- [[ADR-006-componente-frontend-analise-ia-tracking-sku]] — padrão do `AnaliseIAPanel` a ser seguido
- [[PRD-002-frontend-tracking]] — contexto geral do módulo de tracking
