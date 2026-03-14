'use client';

import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from '@/app/components/Sidebar';
import {
  ProductCard,
  ProjectCard,
} from '@/app/components/portfolio/PortfolioBlocks';
import { RadarIaSection } from '@/app/components/radar-ia/RadarIaSection';
import {
  featuredProjects,
  productOffers,
} from '@/app/data/portfolio';
import {
  GalleryVerticalEnd,
  Home,
  LayoutGrid,
  RadioTower,
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
    label: 'Radar IA',
    href: '#radar-ia',
    icon: <RadioTower className='h-4 w-4 text-[#9ca3af]' />,
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
                <h2 className='text-2xl font-extrabold uppercase tracking-[0.18em] text-white md:text-4xl'>
                  CODEXION STUDIO
                </h2>
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

              <RadarIaSection />

            </div>
          </section>
        </div>
      </Sidebar>
    </main>
  );
}
