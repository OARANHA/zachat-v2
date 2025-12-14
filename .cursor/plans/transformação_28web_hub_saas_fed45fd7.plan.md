---
name: Transformação 28web Hub SaaS - Estratégia Otimizada
overview: Transformar zaap.izing.open.io em SaaS proprietário "28web Hub" usando estratégia de MVP rápido + extração gradual (Strangler Fig Pattern) para maximizar time-to-market e minimizar risco, priorizando validação de mercado antes de escalar arquitetura.
todos:
  - id: fase1-mvp-rebranding
    content: "Fase 1 (Semanas 1-2): MVP Rápido - Rebranding completo, remover AGPL, criar interfaces de abstração (IChannelProvider), sistema básico de billing com Redis counters"
    status: completed
  - id: fase2-whatsapp-gateway
    content: "Fase 2 (Semanas 3-4): Extrair WhatsApp Gateway - Microserviço isolado substituindo whatsapp-web.js, API REST limpa, webhooks para app principal"
    status: pending
  - id: fase3-billing-robusto
    content: "Fase 3 (Semanas 5-6): Billing Robusto - Sistema completo de planos, tracking de uso, limites por tenant, dashboard de billing, integração com gateway de pagamento"
    status: pending
  - id: fase4-validacao-mercado
    content: "Fase 4 (Semana 7): Validação de Mercado - Deploy, coleta de métricas (tenants, canais mais usados, gargalos), decisão data-driven para próximos passos"
    status: pending
  - id: fase5-abstracoes-interface
    content: "Fase 5 (Paralelo): Interfaces de Abstração - Criar IChannelProvider para todos os canais, wrappers sobre serviços existentes (Instagram, Telegram, Messenger)"
    status: pending
  - id: fase6-evolucao-organica
    content: "Fase 6 (Conforme demanda): Evolução Orgânica - Extrair outros canais como microserviços apenas se houver necessidade comprovada (Storage, Instagram Gateway, etc)"
    status: pending
---

