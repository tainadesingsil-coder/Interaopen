import { cn } from '@/app/lib/utils';
import type {
  FeaturedProject,
  ProductOffer,
  ProjectScreen,
} from '@/app/data/portfolio';
import Link from 'next/link';

const AREA_COLOR: Record<ProductOffer['area'], string> = {
  Software: 'text-sky-300',
  Marketing: 'text-fuchsia-300',
  IA: 'text-lime-300',
};

export function ProjectCard({ project }: { project: FeaturedProject }) {
  return (
    <article
      className='group rounded-xl border border-white/10 bg-[#0b0b0f] p-5 transition duration-200 hover:border-[#C6FF2E] hover:shadow-[0_0_0_1px_rgba(198,255,46,0.18),0_8px_22px_rgba(198,255,46,0.09)]'
      id={project.id}
    >
      <div className='flex items-start justify-between gap-3'>
        <h3 className='text-base font-bold text-white md:text-lg'>{project.title}</h3>
        <span className='rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#9ca3af]'>
          {project.category}
        </span>
      </div>
      <p className='mt-3 text-sm leading-relaxed text-[#9ca3af]'>{project.summary}</p>

      <div className='mt-4 flex flex-wrap gap-2'>
        {project.tags.map((tag) => (
          <span
            key={tag}
            className='rounded-md border border-white/10 bg-black/30 px-2 py-1 font-mono text-[11px] text-[#9ca3af]'
          >
            {tag}
          </span>
        ))}
      </div>

      <Link
        href={project.caseHref}
        className='mt-5 inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-[#C6FF2E] hover:text-[#C6FF2E]'
      >
        Ver case
      </Link>
    </article>
  );
}

export function ProductCard({ offer }: { offer: ProductOffer }) {
  return (
    <article className='rounded-xl border border-white/10 bg-[#0b0b0f] p-4 transition hover:border-[#C6FF2E] hover:shadow-[0_0_18px_rgba(198,255,46,0.08)]'>
      <p
        className={cn(
          'text-[10px] font-semibold uppercase tracking-[0.18em]',
          AREA_COLOR[offer.area]
        )}
      >
        {offer.area}
      </p>
      <h4 className='mt-2 text-sm font-bold text-white md:text-base'>{offer.title}</h4>
      <p className='mt-2 text-sm leading-relaxed text-[#9ca3af]'>{offer.description}</p>
    </article>
  );
}

export function ScreenshotMockup({
  screen,
  projectTitle,
}: {
  screen: ProjectScreen;
  projectTitle: string;
}) {
  const isMobile = screen.device === 'mobile';

  return (
    <article className='rounded-xl border border-white/10 bg-[#0b0b0f] p-4'>
      <div className='mb-3 flex items-center justify-between'>
        <div>
          <p className='text-xs font-semibold text-white'>{screen.title}</p>
          <p className='text-[11px] text-[#9ca3af]'>{projectTitle}</p>
        </div>
        <span className='rounded-md border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#9ca3af]'>
          {screen.device}
        </span>
      </div>

      <div className='flex justify-center rounded-lg border border-white/10 bg-black/30 p-3'>
        <div
          className={cn(
            'relative overflow-hidden rounded-md border border-white/10 bg-[#060608]',
            isMobile ? 'aspect-[9/18] w-[150px]' : 'aspect-[16/10] w-full max-w-[460px]'
          )}
        >
          <div className='flex items-center gap-1 border-b border-white/10 px-3 py-2'>
            <span className='h-1.5 w-1.5 rounded-full bg-[#9ca3af]' />
            <span className='h-1.5 w-1.5 rounded-full bg-[#9ca3af]' />
            <span className='h-1.5 w-1.5 rounded-full bg-[#C6FF2E]' />
          </div>
          <div className='grid h-full grid-cols-6 gap-2 p-3 opacity-90'>
            <div className='col-span-2 rounded border border-white/10 bg-white/5' />
            <div className='col-span-4 rounded border border-white/10 bg-white/5' />
            <div className='col-span-6 rounded border border-white/10 bg-white/5' />
            <div className='col-span-3 rounded border border-white/10 bg-white/5' />
            <div className='col-span-3 rounded border border-white/10 bg-white/5' />
            <div className='col-span-6 rounded border border-[#C6FF2E]/40 bg-[#C6FF2E]/10' />
          </div>
        </div>
      </div>

      <p className='mt-3 text-sm text-[#9ca3af]'>{screen.description}</p>
    </article>
  );
}
