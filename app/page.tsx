'use client';

import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from '@/app/components/Sidebar';
import {
  BriefcaseBusiness,
  FolderKanban,
  Home,
  Mail,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

const portfolioLinks = [
  {
    label: 'Início',
    href: '#inicio',
    icon: <Home className='h-4 w-4 text-neutral-600 dark:text-neutral-300' />,
  },
  {
    label: 'Projetos',
    href: '#projetos',
    icon: <FolderKanban className='h-4 w-4 text-neutral-600 dark:text-neutral-300' />,
  },
  {
    label: 'Serviços',
    href: '#servicos',
    icon: <BriefcaseBusiness className='h-4 w-4 text-neutral-600 dark:text-neutral-300' />,
  },
  {
    label: 'Diferenciais',
    href: '#diferenciais',
    icon: <Sparkles className='h-4 w-4 text-neutral-600 dark:text-neutral-300' />,
  },
  {
    label: 'Contato',
    href: '#contato',
    icon: <Mail className='h-4 w-4 text-neutral-600 dark:text-neutral-300' />,
  },
];

const projectCards = [
  {
    title: 'ENIGMA Voice Core',
    description: 'Assistente de voz inteligente com fluxo conversacional natural.',
  },
  {
    title: 'Painel Analytics',
    description: 'Dashboard moderno para métricas de negócio em tempo real.',
  },
  {
    title: 'App Nativo NATICVA',
    description: 'Experiência mobile com foco em performance e estabilidade.',
  },
];

export default function HomePage() {
  const [open, setOpen] = useState(false);

  return (
    <main className='min-h-screen bg-neutral-950 text-neutral-100'>
      <Sidebar open={open} setOpen={setOpen} animate>
        <div className='flex min-h-screen w-full flex-col md:flex-row'>
          <SidebarBody className='overflow-hidden border-r border-white/10'>
            <div className='flex h-full flex-col justify-between gap-4 overflow-hidden'>
              <div className='space-y-4 overflow-hidden'>
                <div className='pt-3'>
                  <p className='truncate text-[10px] uppercase tracking-[0.16em] text-neutral-500'>
                    {open ? 'Portfolio' : 'PF'}
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
                      className='rounded-md px-2 hover:bg-white/10'
                    />
                  ))}
                </nav>
              </div>
              <div className='rounded-lg border border-white/10 bg-white/5 p-2'>
                <p className='text-[10px] leading-tight text-neutral-400'>{open ? 'Status' : '•'}</p>
                <p className='break-words text-[11px] font-semibold leading-tight text-white'>
                  {open ? 'Disponível para novos projetos' : 'ON'}
                </p>
              </div>
            </div>
          </SidebarBody>

          <section className='w-full px-5 py-8 md:px-10 md:py-12'>
            <div className='mx-auto flex w-full max-w-5xl flex-col gap-6'>
              <article
                id='inicio'
                className='rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-6 md:p-8'
              >
                <p className='text-xs uppercase tracking-[0.24em] text-cyan-300'>
                  Interface Nova
                </p>
                <h2 className='mt-3 text-3xl font-black tracking-tight text-white md:text-5xl'>
                  Portfólio CODEXION
                </h2>
                <p className='mt-4 max-w-2xl text-sm text-neutral-300 md:text-base'>
                  Soluções digitais com visual premium, foco em experiência e tecnologia de ponta.
                  Uma base pronta para apresentar projetos, serviços e autoridade da marca.
                </p>
              </article>

              <article id='projetos' className='space-y-3'>
                <h3 className='text-lg font-bold text-white md:text-xl'>Projetos em destaque</h3>
                <div className='grid gap-3 md:grid-cols-3'>
                  {projectCards.map((project) => (
                    <div
                      key={project.title}
                      className='rounded-xl border border-white/10 bg-white/5 p-4'
                    >
                      <p className='text-sm font-semibold text-white'>{project.title}</p>
                      <p className='mt-2 text-sm text-neutral-300'>{project.description}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article id='servicos' className='rounded-xl border border-white/10 bg-white/5 p-5'>
                <h3 className='text-lg font-bold text-white'>Serviços</h3>
                <p className='mt-2 text-sm text-neutral-300'>
                  Desenvolvimento Front-end, aplicações com IA, arquitetura de interfaces e
                  experiência visual de alto impacto.
                </p>
              </article>

              <article
                id='diferenciais'
                className='rounded-xl border border-white/10 bg-white/5 p-5'
              >
                <h3 className='text-lg font-bold text-white'>Diferenciais</h3>
                <p className='mt-2 text-sm text-neutral-300'>
                  Design estratégico, performance otimizada e implementação orientada a resultado.
                </p>
              </article>

              <article id='contato' className='rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-5'>
                <h3 className='text-lg font-bold text-cyan-200'>Contato</h3>
                <p className='mt-2 text-sm text-cyan-100'>
                  Vamos construir sua próxima experiência digital. Fale com a CODEXION.
                </p>
              </article>
            </div>
          </section>
        </div>
      </Sidebar>
    </main>
  );
}
