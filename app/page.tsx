'use client';

import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from '@/app/components/Sidebar';
import {
  ProductCard,
  ProjectCard,
  ScreenshotMockup,
} from '@/app/components/portfolio/PortfolioBlocks';
import {
  featuredProjects,
  productOffers,
} from '@/app/data/portfolio';
import {
  GalleryVerticalEnd,
  Home,
  LayoutGrid,
  Layers3,
  Mail,
  Rocket,
} from 'lucide-react';
import { useState } from 'react';

const portfolioLinks = [
  {
    label: 'Início',
    href: '#inicio',
    icon: <Home className='h-4 w-4 text-[#9ca3af]' />,
  },
  {
    label: 'Destaques',
    href: '#projetos',
    icon: <GalleryVerticalEnd className='h-4 w-4 text-[#9ca3af]' />,
  },
  {
    label: 'Produtos',
    href: '#produtos',
    icon: <LayoutGrid className='h-4 w-4 text-[#9ca3af]' />,
  },
  {
    label: 'Telas',
    href: '#telas',
    icon: <Layers3 className='h-4 w-4 text-[#9ca3af]' />,
  },
  {
    label: 'CTA',
    href: '#contato',
    icon: <Mail className='h-4 w-4 text-[#9ca3af]' />,
  },
];

export default function HomePage() {
  const [open, setOpen] = useState(false);

  return (
    <main className='min-h-screen bg-[#060608] text-white'>
      <Sidebar open={open} setOpen={setOpen} animate>
        <div className='flex min-h-screen w-full flex-col bg-[#060608] md:flex-row'>
          <SidebarBody className='overflow-hidden border-r border-white/10 bg-[#0b0b0f]'>
            <div className='flex h-full flex-col justify-between gap-5 overflow-hidden'>
              <div className='space-y-5 overflow-hidden'>
                <div className='pt-3'>
                  <p className='truncate text-[10px] uppercase tracking-[0.18em] text-[#9ca3af]'>
                    {open ? 'Portfólio' : 'PF'}
                  </p>
                  <h1 className='mt-1 truncate text-base font-extrabold tracking-[0.12em] text-white'>
                    {open ? 'CODEXION' : 'CX'}
                  </h1>
                </div>
                <nav className='space-y-1'>
                  {portfolioLinks.map((link) => (
                    <SidebarLink
                      key={link.label}
                      link={link}
                      className='rounded-md px-2 hover:border hover:border-[#C6FF2E] hover:bg-[#C6FF2E]/5'
                    />
                  ))}
                </nav>
              </div>
              <div className='rounded-lg border border-white/10 bg-white/[0.02] p-2'>
                <p className='text-[10px] leading-tight text-[#9ca3af]'>{open ? 'Status' : '•'}</p>
                <p className='break-words text-[11px] font-semibold leading-tight text-white'>
                  {open ? 'Disponível para novos projetos' : 'ON'}
                </p>
              </div>
            </div>
          </SidebarBody>

          <section className='w-full px-5 py-8 md:px-9 md:py-10'>
            <div className='mx-auto flex w-full max-w-6xl flex-col gap-8'>
              <article id='inicio' className='rounded-xl border border-white/10 bg-[#0b0b0f] p-6 md:p-8'>
                <p className='text-xs uppercase tracking-[0.2em] text-[#9ca3af]'>Codexion Studio</p>
                <h2 className='mt-3 text-3xl font-extrabold tracking-tight text-white md:text-5xl'>
                  Portfólio Codexion
                </h2>
                <p className='mt-4 max-w-3xl text-sm leading-relaxed text-[#9ca3af] md:text-base'>
                  Produtos digitais com estética técnica, execução sólida e foco em conversão.
                  Interface limpa, organização clara e padrão premium para venda consultiva.
                </p>
                <div className='mt-5 inline-flex items-center gap-2 rounded-md border border-[#C6FF2E]/40 bg-[#C6FF2E]/10 px-3 py-1 text-xs font-semibold text-[#C6FF2E]'>
                  <Rocket className='h-3.5 w-3.5' />
                  Design GitHub-like com DNA Codexion
                </div>
              </article>

              <article id='projetos' className='space-y-4'>
                <header className='space-y-1'>
                  <p className='text-xs uppercase tracking-[0.18em] text-[#9ca3af]'>Cases comerciais</p>
                  <h3 className='text-xl font-bold text-white md:text-2xl'>Projetos em destaque</h3>
                </header>
                <div className='grid gap-4 lg:grid-cols-3'>
                  {featuredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </article>

              <article id='produtos' className='space-y-4'>
                <span id='servicos' className='sr-only'>
                  serviços
                </span>
                <header className='space-y-1'>
                  <p className='text-xs uppercase tracking-[0.18em] text-[#9ca3af]'>Oferta Codexion</p>
                  <h3 className='text-xl font-bold text-white md:text-2xl'>
                    Produtos que entregamos
                  </h3>
                </header>
                <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                  {productOffers.map((offer) => (
                    <ProductCard key={offer.id} offer={offer} />
                  ))}
                </div>
              </article>

              <article id='telas' className='space-y-4'>
                <span id='diferenciais' className='sr-only'>
                  diferenciais
                </span>
                <header className='space-y-1'>
                  <p className='text-xs uppercase tracking-[0.18em] text-[#9ca3af]'>Visual de produto</p>
                  <h3 className='text-xl font-bold text-white md:text-2xl'>Telas dos produtos</h3>
                </header>

                <div className='space-y-5'>
                  {featuredProjects.map((project) => (
                    <section
                      key={project.id}
                      id={`case-${project.id}`}
                      className='rounded-xl border border-white/10 bg-[#0b0b0f] p-5'
                    >
                      <div className='mb-4 border-b border-white/10 pb-4'>
                        <h4 className='text-lg font-semibold text-white'>{project.title}</h4>
                        <p className='mt-1 text-sm text-[#9ca3af]'>{project.summary}</p>
                      </div>
                      <div className='grid gap-4 xl:grid-cols-2'>
                        {project.screens.map((screen) => (
                          <ScreenshotMockup
                            key={screen.id}
                            projectTitle={project.title}
                            screen={screen}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </article>

              <article
                id='contato'
                className='rounded-xl border border-white/10 bg-gradient-to-b from-[#0b0b0f] to-[#060608] p-6'
              >
                <p className='text-xs uppercase tracking-[0.2em] text-[#9ca3af]'>Próximo passo</p>
                <h3 className='mt-2 text-2xl font-bold text-white'>Vamos construir seu próximo case?</h3>
                <p className='mt-2 max-w-2xl text-sm text-[#9ca3af]'>
                  Estruturamos produto, design e aquisição para transformar operação em resultado.
                </p>
                <div className='mt-5 flex flex-wrap gap-3'>
                  <a
                    href='#projetos'
                    className='inline-flex items-center rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-[#C6FF2E] hover:text-[#C6FF2E]'
                  >
                    Ver portfólio completo
                  </a>
                  <a
                    href='mailto:contato@codexion.com.br'
                    className='inline-flex items-center rounded-md border border-[#C6FF2E]/45 bg-[#C6FF2E]/10 px-4 py-2 text-sm font-semibold text-[#C6FF2E] transition hover:shadow-[0_0_20px_rgba(198,255,46,0.14)]'
                  >
                    Falar com especialista
                  </a>
                </div>
              </article>
            </div>
          </section>
        </div>
      </Sidebar>
    </main>
  );
}
