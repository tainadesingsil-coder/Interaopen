import { useEffect } from 'react';
import './index.css';

const whatsappNumber = '5571999999999';
const whatsappMessage = encodeURIComponent(
  'Ola! Quero entender mais sobre o Bella Vista Beach Residence.'
);
const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

const heroImage =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80';
const contextImages = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=80',
];
const empreendimentoImages = [
  'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
];
const experienceImage =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80';

const empreendimentoCards = [
  {
    title: 'Studios funcionais',
    description:
      'Plantas inteligentes com metragem otimizada para morar bem ou rentabilizar com temporada.',
    image: empreendimentoImages[0],
  },
  {
    title: 'Projeto moderno',
    description:
      'Arquitetura contemporanea, linguagem clean e ambientes pensados para o estilo de vida do litoral.',
    image: empreendimentoImages[1],
  },
  {
    title: 'Regiao em crescimento',
    description:
      'Fluxo turistico em alta, novos investimentos e demanda constante por hospedagem qualificada.',
    image: empreendimentoImages[2],
  },
];

const perfilList = [
  'Investidores patrimoniais',
  'Compradores de segunda residencia',
  'Renda com temporada',
  'Visao de longo prazo',
];

const destaqueList = [
  'Studios funcionais',
  'Projeto moderno',
  'Regiao em crescimento',
  'Ideal para morar ou investir',
];

function useLandingEffects() {
  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealElements.forEach((el) => revealObserver.observe(el));

    const mapSection = document.querySelector<HTMLElement>('[data-map-section]');
    let mapObserver: IntersectionObserver | null = null;
    if (mapSection) {
      mapObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              mapSection.classList.add('map-active');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );
      mapObserver.observe(mapSection);
    }

    const parallaxItems = Array.from(
      document.querySelectorAll<HTMLElement>('[data-parallax]')
    );
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;
    let frame = 0;

    const updateParallax = () => {
      frame = 0;
      const windowHeight = window.innerHeight;
      parallaxItems.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const progress =
          (rect.top + rect.height / 2 - windowHeight / 2) / windowHeight;
        const intensity = Number(el.dataset.parallax ?? 1);
        const offset = Math.max(
          Math.min(progress * -32 * intensity, 32 * intensity),
          -32 * intensity
        );
        el.style.setProperty('--parallax-offset', `${offset}px`);
      });
    };

    const onScroll = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(updateParallax);
      }
    };

    if (!prefersReducedMotion && !isSmallScreen && parallaxItems.length) {
      updateParallax();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
    }

    return () => {
      revealObserver.disconnect();
      mapObserver?.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
}

export default function App() {
  useLandingEffects();

  return (
    <div className='page'>
      <header className='site-header'>
        <div className='container-section header-inner'>
          <div className='brand'>
            <span className='brand-title'>Bella Vista</span>
            <span className='brand-subtitle'>Beach Residence • Bahia</span>
          </div>
          <a
            className='header-cta'
            href={whatsappLink}
            target='_blank'
            rel='noreferrer'
          >
            WhatsApp consultivo
          </a>
        </div>
      </header>

      <main>
        <section id='inicio' className='hero'>
          <div
            className='hero-media'
            style={{ backgroundImage: `url(${heroImage})` }}
          />
          <div className='hero-overlay' />
          <div className='container-section hero-content'>
            <span className='hero-eyebrow' data-reveal>
              BR-367 • Litoral sul da Bahia
            </span>
            <h1 data-reveal>
              Viva perto do mar.
              <br />
              Invista onde o futuro passa.
            </h1>
            <p data-reveal>
              Studios e apartamentos em uma das regioes mais desejadas da Bahia,
              com localizacao estrategica e alto potencial de valorizacao.
            </p>
            <div className='hero-actions' data-reveal>
              <a
                className='cta-primary cta-pulse'
                href={whatsappLink}
                target='_blank'
                rel='noreferrer'
              >
                Falar com um especialista no WhatsApp
              </a>
              <span className='cta-note'>
                Atendimento consultivo, reservado e sem pressao.
              </span>
            </div>
          </div>
          <div className='hero-scroll' data-reveal>
            Role para descobrir
          </div>
        </section>

        <section id='bahia' className='section context-section'>
          <div className='container-section split-grid'>
            <div className='context-copy' data-reveal>
              <span className='section-tag'>Contexto da Bahia</span>
              <h2>A Bahia vive uma explosao turistica.</h2>
              <p>
                Quando o mundo deseja um lugar, o mercado responde. A combinacao
                de turismo, infraestrutura e mobilidade cria um ciclo natural de
                valorizacao imobiliaria.
              </p>
              <p className='context-highlight'>
                Bella Vista nasce nesse encontro entre desejo e estrategia.
              </p>
            </div>
            <div className='context-media'>
              <div className='image-card' data-reveal>
                <img
                  src={contextImages[0]}
                  alt='Praia na Bahia'
                  className='parallax-image'
                  data-parallax='0.2'
                  loading='lazy'
                />
              </div>
              <div className='image-card offset' data-reveal>
                <img
                  src={contextImages[1]}
                  alt='Por do sol no litoral'
                  className='parallax-image'
                  data-parallax='0.15'
                  loading='lazy'
                />
              </div>
            </div>
          </div>
        </section>

        <section
          id='localizacao'
          className='section location-section'
          data-map-section
        >
          <div className='container-section location-grid'>
            <div className='location-copy' data-reveal>
              <span className='section-tag'>Localizacao estrategica</span>
              <h2>
                Entre a BR-367 e o azul do mar, nasce uma decisao bem posicionada.
              </h2>
              <p>
                Acesso facil, visibilidade alta e proximidade com os polos
                turisticos mais procurados do estado. Um ponto de equilibrio
                entre fluxo e privacidade.
              </p>
            </div>
            <div className='map-card' data-reveal>
              <div className='map-surface'>
                <svg
                  className='map-svg'
                  viewBox='0 0 520 260'
                  aria-hidden='true'
                >
                  <path
                    className='map-line'
                    d='M30 210 C110 140 190 170 250 120 C310 70 380 40 490 30'
                  />
                </svg>
                <div className='map-pin' aria-hidden='true' />
                <div className='map-label'>BR-367</div>
                <div className='map-hint'>Bella Vista Beach Residence</div>
              </div>
            </div>
          </div>
        </section>

        <section id='empreendimento' className='section empreendimento-section'>
          <div className='container-section'>
            <div className='section-intro' data-reveal>
              <span className='section-tag'>O empreendimento</span>
              <h2>
                O Bella Vista Beach Residence foi pensado para quem entende que
                investir bem comeca pela localizacao certa.
              </h2>
            </div>
            <div className='feature-cards'>
              {empreendimentoCards.map((card) => (
                <article key={card.title} className='feature-card' data-reveal>
                  <div className='feature-media'>
                    <img src={card.image} alt={card.title} loading='lazy' />
                  </div>
                  <div className='feature-body'>
                    <span className='feature-pill'>{card.title}</span>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                </article>
              ))}
            </div>
            <ul className='feature-list' data-reveal>
              {destaqueList.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section id='perfil' className='section audience-section'>
          <div className='container-section'>
            <div className='audience-card' data-reveal>
              <span className='section-tag'>Para quem e</span>
              <h2>Este projeto e ideal para quem busca patrimonio, nao impulso.</h2>
              <p>
                Uma escolha racional, mas com carga emocional clara: praia,
                liquidez e valorizacao. Sem promessas vazias.
              </p>
              <ul className='audience-list'>
                {perfilList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id='experiencia' className='experience-section'>
          <div
            className='experience-media'
            style={{ backgroundImage: `url(${experienceImage})` }}
          />
          <div className='experience-overlay' />
          <div className='container-section experience-content' data-reveal>
            <span className='section-tag light'>Experiencia e futuro</span>
            <h2>Alguns lugares voce entende. Outros voce sente.</h2>
            <p>
              O Bella Vista equilibra desejo e previsibilidade. Um convite para
              desacelerar, mas com retorno claro para quem pensa no longo prazo.
            </p>
          </div>
        </section>

        <section id='cta' className='final-cta'>
          <div className='container-section final-cta-inner' data-reveal>
            <h2>Quando fizer sentido, voce vai saber.</h2>
            <p>
              Converse com um especialista e avalie o Bella Vista como ativo
              imobiliario estrategico. Sem formularios. Sem pressa.
            </p>
            <a
              className='cta-primary cta-glow'
              href={whatsappLink}
              target='_blank'
              rel='noreferrer'
            >
              Conversar agora no WhatsApp
            </a>
          </div>
        </section>
      </main>

      <footer className='site-footer'>
        <div className='container-section footer-inner'>
          <div>
            <span className='brand-title'>Bella Vista</span>
            <span className='brand-subtitle'>Beach Residence • Bahia</span>
          </div>
          <p>
            Empreendimento imobiliario voltado para investimento patrimonial e
            segunda residencia. Atendimento consultivo via WhatsApp.
          </p>
        </div>
      </footer>

      <a
        className='mobile-cta'
        href={whatsappLink}
        target='_blank'
        rel='noreferrer'
      >
        Conversar no WhatsApp
      </a>
    </div>
  );
}
