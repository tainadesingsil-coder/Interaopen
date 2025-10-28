import { useMemo, useState } from 'react';
import { Cpu, LineChart, Settings, ShoppingCart, Plus, Minus, Trash2, ChevronUp } from 'lucide-react';

type Service = {
  id: string;
  title: string;
  desc: string;
  price: number;
  Icon: React.ComponentType<any>;
};

function ServiceCard({ service, onAdd }: { service: Service; onAdd: () => void }) {
  const { title, desc, price, Icon } = service;
  const brl = useMemo(
    () => (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    []
  );
  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-transform hover:-translate-y-1 hover:shadow-soft">
      <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-tr from-white/10 to-transparent" />
      <div className="relative flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl border border-white/15 bg-black/60 flex items-center justify-center">
          <Icon className="h-6 w-6 text-chrome" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-softWhite truncate">{title}</h3>
          <p className="mt-1 text-sm text-softGray">{desc}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-softWhite/90 font-medium">{brl(price)}</span>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-softWhite hover:border-white/50 hover:shadow-soft transition"
        >
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>
    </div>
  );
}

export default function CodexionServices() {
  const catalog: Service[] = useMemo(
    () => [
      {
        id: 'landing-premium',
        title: 'Landing Page Premium',
        desc: 'Design de alta conversão + SEO técnico.',
        price: 2490,
        Icon: Settings,
      },
      {
        id: 'app-web',
        title: 'App Web sob Medida',
        desc: 'SaaS / Painel administrativo / Multi-usuário.',
        price: 14990,
        Icon: Cpu,
      },
      {
        id: 'api-integracoes',
        title: 'APIs e Integrações',
        desc: 'ERP, CRM, gateways de pagamento e automações.',
        price: 5990,
        Icon: Settings,
      },
      {
        id: 'ia-bots',
        title: 'IA: Automação e Bots',
        desc: 'Assistentes e fluxos inteligentes para operação.',
        price: 7990,
        Icon: Cpu,
      },
      {
        id: 'gestao-trafego',
        title: 'Gestão de Tráfego',
        desc: 'Meta/Google com estratégia e BI de performance.',
        price: 2490,
        Icon: LineChart,
      },
      {
        id: 'consultoria',
        title: 'Consultoria Estratégica',
        desc: 'Growth, posicionamento e roadmap de produto.',
        price: 1890,
        Icon: LineChart,
      },
    ],
    []
  );

  type CartItem = { service: Service; quantity: number };
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const totalItems = cart.reduce((sum, it) => sum + it.quantity, 0);
  const totalPrice = cart.reduce((sum, it) => sum + it.quantity * it.service.price, 0);
  const brl = useMemo(() => (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), []);

  const addToCart = (service: Service) => {
    setCart((prev) => {
      const next = [...prev];
      const idx = next.findIndex((x) => x.service.id === service.id);
      if (idx >= 0) next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
      else next.push({ service, quantity: 1 });
      return next;
    });
  };
  const inc = (id: string) => setCart((prev) => prev.map((x) => (x.service.id === id ? { ...x, quantity: x.quantity + 1 } : x)));
  const dec = (id: string) =>
    setCart((prev) =>
      prev
        .map((x) => (x.service.id === id ? { ...x, quantity: Math.max(0, x.quantity - 1) } : x))
        .filter((x) => x.quantity > 0)
    );
  const removeItem = (id: string) => setCart((prev) => prev.filter((x) => x.service.id !== id));

  const checkout = () => {
    const lines = cart.map((x) => `• ${x.service.title} x${x.quantity} — ${brl(x.service.price * x.quantity)}`).join('%0A');
    const msg = `Quero contratar os serviços:%0A${lines}%0A%0ATotal: ${brl(totalPrice)}`;
    const url = `https://wa.me/5538999266004?text=${msg}`;
    window.location.href = url;
  };

  return (
    <section id="servicos" className="relative py-16 md:py-24 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="section-title text-softWhite">Compre nossos serviços direto pelo painel.</h2>
        <p className="section-subtitle mt-2">Software sob medida + marketing estratégico.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {catalog.map((s) => (
            <ServiceCard key={s.id} service={s} onAdd={() => addToCart(s)} />
          ))}
        </div>
      </div>

      {/* Floating cart */}
      <div className="fixed right-4 bottom-4 z-50">
        <button
          type="button"
          onClick={() => setCartOpen((v) => !v)}
          className="relative inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-softWhite backdrop-blur hover:border-white/50 hover:shadow-soft transition"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="text-sm">Carrinho</span>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-white text-black text-xs px-1">
              {totalItems}
            </span>
          )}
        </button>

        {cartOpen && (
          <div className="mt-2 w-[320px] rounded-2xl border border-white/10 bg-black/80 text-softWhite backdrop-blur p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Seu carrinho</h4>
              <button onClick={() => setCartOpen(false)} className="opacity-70 hover:opacity-100" aria-label="Fechar">
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 max-h-64 overflow-auto grid gap-3 pr-1">
              {cart.length === 0 && (
                <div className="text-sm text-softGray">Seu carrinho está vazio.</div>
              )}
              {cart.map((x) => (
                <div key={x.service.id} className="grid grid-cols-[1fr_auto] gap-2 items-center">
                  <div>
                    <div className="text-sm font-medium">{x.service.title}</div>
                    <div className="text-xs text-softGray">{brl(x.service.price)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="rounded-full border border-white/20 p-1" onClick={() => dec(x.service.id)} aria-label="Diminuir">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-sm w-6 text-center">{x.quantity}</span>
                    <button className="rounded-full border border-white/20 p-1" onClick={() => inc(x.service.id)} aria-label="Aumentar">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button className="rounded-full border border-white/20 p-1" onClick={() => removeItem(x.service.id)} aria-label="Remover">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-softGray">Total</span>
              <span className="text-base font-semibold">{brl(totalPrice)}</span>
            </div>
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={checkout}
              className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-black px-5 py-2.5 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-soft transition"
            >
              <ShoppingCart className="h-4 w-4" /> Finalizar via WhatsApp
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
