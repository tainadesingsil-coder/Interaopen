'use client';

import type { ProductOffer } from '@/app/data/portfolio';
import { Bot, SendHorizonal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface ServiceMessage {
  role: 'user' | 'assistant';
  text: string;
}

const MAX_MESSAGE_SIZE = 280;

const sanitizeInput = (value: string) =>
  value
    .replace(/[^\p{L}\p{N}\s.,!?()\-_:;/]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_MESSAGE_SIZE);

export function ServiceAdvisor({ offers }: { offers: ProductOffer[] }) {
  const [selectedServiceId, setSelectedServiceId] = useState(offers[0]?.id ?? '');
  const [messagesByService, setMessagesByService] = useState<Record<string, ServiceMessage[]>>({});
  const [draft, setDraft] = useState('');
  const [loadingServiceId, setLoadingServiceId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const selectedOffer = useMemo(
    () => offers.find((offer) => offer.id === selectedServiceId) ?? offers[0],
    [offers, selectedServiceId]
  );

  const selectedMessages = messagesByService[selectedOffer?.id ?? ''] ?? [];

  const appendMessage = useCallback((serviceId: string, message: ServiceMessage) => {
    setMessagesByService((prev) => ({
      ...prev,
      [serviceId]: [...(prev[serviceId] ?? []), message],
    }));
  }, []);

  const sendToAdvisor = useCallback(
    async (service: ProductOffer, question: string, mode: 'chat' | 'explain') => {
      const normalizedQuestion = sanitizeInput(question);
      if (!service?.id || (!normalizedQuestion && mode === 'chat')) {
        return;
      }

      if (mode === 'chat') {
        appendMessage(service.id, { role: 'user', text: normalizedQuestion });
      }

      setLoadingServiceId(service.id);
      setErrorMessage('');
      try {
        const history = (messagesByService[service.id] ?? []).slice(-8);
        const response = await fetch('/api/service-advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service,
            question: normalizedQuestion,
            mode,
            history,
          }),
        });

        if (!response.ok) {
          throw new Error('service_advisor_failed');
        }

        const payload = (await response.json()) as { answer?: string };
        const answer = sanitizeInput(payload?.answer ?? '');
        if (!answer) {
          throw new Error('empty_answer');
        }

        appendMessage(service.id, { role: 'assistant', text: answer });
      } catch {
        appendMessage(service.id, {
          role: 'assistant',
          text: `No serviço "${service.title}", nosso foco é resultado com execução clara. Posso detalhar passo a passo para o seu cenário.`,
        });
        setErrorMessage('Instabilidade no assistente agora. Tente novamente em seguida.');
      } finally {
        setLoadingServiceId('');
      }
    },
    [appendMessage, messagesByService]
  );

  useEffect(() => {
    if (!selectedOffer?.id) {
      return;
    }
    const existing = messagesByService[selectedOffer.id] ?? [];
    if (existing.length === 0 && loadingServiceId !== selectedOffer.id) {
      void sendToAdvisor(
        selectedOffer,
        `Explique o serviço ${selectedOffer.title} para eu apresentar para cliente.`,
        'explain'
      );
    }
  }, [loadingServiceId, messagesByService, selectedOffer, sendToAdvisor]);

  return (
    <section className='rounded-xl border border-white/10 bg-[#0b0b0f] p-4 md:p-5'>
      <header className='mb-4'>
        <p className='text-xs uppercase tracking-[0.18em] text-[#9ca3af]'>Inteligência comercial</p>
        <h4 className='mt-1 text-lg font-bold text-white md:text-xl'>Assistente IA dos serviços</h4>
        <p className='mt-2 text-sm text-[#9ca3af]'>
          Selecione um serviço e converse com a IA para explicar proposta, escopo e diferenciais.
        </p>
      </header>

      <div className='mb-4 flex flex-wrap gap-2'>
        {offers.map((offer) => (
          <button
            key={offer.id}
            type='button'
            onClick={() => setSelectedServiceId(offer.id)}
            className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
              selectedOffer?.id === offer.id
                ? 'border-[#C6FF2E] bg-[#C6FF2E]/10 text-[#C6FF2E]'
                : 'border-white/10 bg-white/5 text-[#9ca3af] hover:border-[#C6FF2E] hover:text-[#C6FF2E]'
            }`}
          >
            {offer.title}
          </button>
        ))}
      </div>

      <div className='rounded-lg border border-white/10 bg-black/20 p-3 md:p-4'>
        <div className='mb-3 flex items-center gap-2'>
          <Bot className='h-4 w-4 text-[#C6FF2E]' />
          <p className='text-sm font-semibold text-white'>{selectedOffer?.title}</p>
        </div>

        <div className='max-h-[280px] space-y-2 overflow-y-auto pr-1'>
          {selectedMessages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`rounded-md border px-3 py-2 text-sm ${
                message.role === 'assistant'
                  ? 'border-[#C6FF2E]/30 bg-[#C6FF2E]/8 text-[#d9ff8a]'
                  : 'border-white/10 bg-white/5 text-white'
              }`}
            >
              {message.text}
            </div>
          ))}
          {loadingServiceId === selectedOffer?.id ? (
            <div className='rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-[#9ca3af]'>
              IA analisando o serviço...
            </div>
          ) : null}
        </div>

        <div className='mt-3 flex gap-2'>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && selectedOffer) {
                void sendToAdvisor(selectedOffer, draft, 'chat');
                setDraft('');
              }
            }}
            placeholder='Pergunte sobre este serviço...'
            className='w-full rounded-md border border-white/10 bg-[#060608] px-3 py-2 text-sm text-white outline-none transition placeholder:text-[#6b7280] focus:border-[#C6FF2E]'
          />
          <button
            type='button'
            onClick={() => {
              if (selectedOffer) {
                void sendToAdvisor(selectedOffer, draft, 'chat');
                setDraft('');
              }
            }}
            className='inline-flex items-center gap-1 rounded-md border border-[#C6FF2E]/45 bg-[#C6FF2E]/10 px-3 py-2 text-xs font-semibold text-[#C6FF2E] transition hover:shadow-[0_0_18px_rgba(198,255,46,0.16)]'
          >
            Enviar
            <SendHorizonal className='h-3.5 w-3.5' />
          </button>
        </div>

        {errorMessage ? <p className='mt-2 text-xs text-[#fda4af]'>{errorMessage}</p> : null}
      </div>
    </section>
  );
}
