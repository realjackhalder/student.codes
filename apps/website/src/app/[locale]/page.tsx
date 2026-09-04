import { Button } from '@evaluate/components/button';
import { Say } from '@sayable/react';
import { ArrowRightIcon, BotIcon, BrainCircuitIcon, CheckCircle2Icon, Code2Icon, CpuIcon, GraduationCapIcon, LaptopIcon, PlayIcon, PuzzleIcon, SearchIcon, SparklesIcon, UsersIcon } from 'lucide-react';
import Link from 'next/link';
import say from '~/i18n';
import { generateBaseMetadata } from './metadata';

export async function generateMetadata({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  return generateBaseMetadata(say.activate(locale), '/');
}

const paths = [
  { title: 'Programming', text: 'Write, run, and understand code through hands-on practice.', meta: '70+ languages', icon: Code2Icon, colour: 'from-emerald-400 to-teal-500', href: '/playgrounds' },
  { title: 'ICT Essentials', text: 'Build practical skills in networks, systems, security, and data.', meta: 'Career-ready skills', icon: CpuIcon, colour: 'from-blue-400 to-indigo-500', href: '#how-it-works' },
  { title: 'Artificial Intelligence', text: 'Explore AI concepts, tools, prompting, and responsible use.', meta: 'Learn the future', icon: BrainCircuitIcon, colour: 'from-violet-400 to-fuchsia-500', href: '#featured-tools' },
];

const products = [
  { title: 'Online Playgrounds', text: 'Experiment with real code in your browser—no setup required.', badge: 'Most popular', action: 'Start coding', icon: LaptopIcon, href: '/playgrounds' },
  { title: 'Browser Extension', text: 'Run snippets instantly while reading tutorials or documentation.', badge: 'Free', action: 'Get the extension', icon: PuzzleIcon, href: '/products/browser-extension' },
  { title: 'Discord Coding Bot', text: 'Learn, test, and share code together inside your community.', badge: 'For communities', action: 'Add to Discord', icon: BotIcon, href: '/products/discord-bot' },
];

export default function HomePage() {
  return <main className="overflow-hidden">
    <section className="relative border-y border-border/50 bg-gradient-to-br from-primary/10 via-background to-violet-500/10">
      <div className="pointer-events-none absolute -top-32 right-[-10%] size-[30rem] rounded-full bg-primary/15 blur-3xl" />
      <div className="container relative grid min-h-[36rem] items-center gap-12 py-16 lg:grid-cols-[1.1fr_.9fr] lg:py-20">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-background/80 px-3 py-1.5 font-medium text-primary text-xs shadow-sm backdrop-blur"><SparklesIcon className="size-3.5" /><Say>Built for curious students everywhere</Say></div>
          <h1 className="text-balance font-black text-5xl tracking-[-0.045em] sm:text-6xl lg:text-7xl"><Say>Learn the skills that</Say>{' '}<span className="bg-gradient-to-r from-primary via-emerald-400 to-cyan-400 bg-clip-text text-transparent"><Say>build the future.</Say></span></h1>
          <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground leading-8 sm:text-xl"><Say>One student-friendly place to explore programming, ICT, and artificial intelligence through practical tools and projects.</Say></p>
          <div className="mt-8 flex max-w-2xl items-center rounded-2xl border bg-background p-2 shadow-xl shadow-primary/10"><SearchIcon className="ml-3 size-5 shrink-0 text-muted-foreground" /><span className="min-w-0 flex-1 px-3 text-left text-muted-foreground text-sm sm:text-base"><Say>What do you want to learn today?</Say></span><Button className="rounded-xl px-5" asChild><Link href="/playgrounds"><span className="hidden sm:inline"><Say>Explore</Say></span><ArrowRightIcon className="size-4" /></Link></Button></div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground text-sm">{['Free to start', 'No installation', 'Learn by doing'].map(x => <span key={x} className="flex items-center gap-2"><CheckCircle2Icon className="size-4 text-primary" /><Say>{x}</Say></span>)}</div>
        </div>
        <div className="relative mx-auto hidden w-full max-w-md lg:block">
          <div className="rotate-2 rounded-[2rem] border bg-card p-4 shadow-2xl"><div className="rounded-2xl bg-zinc-950 p-5 text-left text-sm text-zinc-300"><div className="mb-5 flex items-center gap-2 border-zinc-800 border-b pb-3"><span className="size-2.5 rounded-full bg-red-400" /><span className="size-2.5 rounded-full bg-amber-400" /><span className="size-2.5 rounded-full bg-emerald-400" /><span className="ml-auto text-zinc-500 text-xs">hello_future.py</span></div><pre className="overflow-hidden font-mono leading-7"><code><span className="text-fuchsia-400">def</span> <span className="text-cyan-300">start_learning</span>():{`\n`}  skills = [<span className="text-amber-300">&quot;Code&quot;</span>, <span className="text-amber-300">&quot;ICT&quot;</span>, <span className="text-amber-300">&quot;AI&quot;</span>]{`\n`}  <span className="text-fuchsia-400">return</span> <span className="text-emerald-300">&quot;Your future starts here&quot;</span></code></pre><div className="mt-5 flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-emerald-300"><PlayIcon className="size-4 fill-current" />Your future starts here</div></div></div>
          <div className="absolute -right-8 -bottom-8 -rotate-3 rounded-2xl border bg-card p-4 shadow-xl"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-500"><BrainCircuitIcon className="size-5" /></span><div className="text-left"><p className="font-bold text-sm"><Say>AI learning path</Say></p><p className="text-muted-foreground text-xs"><Say>Ready when you are</Say></p></div></div></div>
        </div>
      </div>
    </section>

    <section className="container py-20">
      <div className="mb-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="font-semibold text-primary text-sm"><Say>CHOOSE YOUR PATH</Say></p><h2 className="mt-2 font-bold text-3xl tracking-tight sm:text-4xl"><Say>What will you build next?</Say></h2></div><p className="max-w-md text-muted-foreground"><Say>Start with the topic that excites you. Every path is designed for learning through practice.</Say></p></div>
      <div className="grid gap-5 md:grid-cols-3">{paths.map(p => { const Icon=p.icon; return <Link key={p.title} href={p.href} className="group overflow-hidden rounded-3xl border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"><div className={`h-2 bg-gradient-to-r ${p.colour}`} /><div className="p-7"><Icon className="size-9 text-primary" /><h3 className="mt-8 font-bold text-2xl"><Say>{p.title}</Say></h3><p className="mt-3 min-h-12 text-muted-foreground"><Say>{p.text}</Say></p><div className="mt-7 flex items-center justify-between border-t pt-5 font-semibold text-sm"><span className="text-muted-foreground"><Say>{p.meta}</Say></span><ArrowRightIcon className="size-5 text-primary transition-transform group-hover:translate-x-1" /></div></div></Link>; })}</div>
    </section>

    <section id="featured-tools" className="border-y bg-muted/35 py-20"><div className="container"><div className="text-center"><p className="font-semibold text-primary text-sm"><Say>FEATURED TOOLS</Say></p><h2 className="mt-2 font-bold text-3xl tracking-tight sm:text-4xl"><Say>Turn learning into something real</Say></h2><p className="mx-auto mt-4 max-w-2xl text-muted-foreground"><Say>Useful tools for solo practice, classroom work, and learning with friends.</Say></p></div><div className="mt-12 grid gap-5 lg:grid-cols-3">{products.map(p => { const Icon=p.icon; return <Link key={p.title} href={p.href} className="group rounded-3xl border bg-background p-7 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg"><div className="flex items-start justify-between"><span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-6" /></span><span className="rounded-full bg-muted px-3 py-1 font-medium text-xs"><Say>{p.badge}</Say></span></div><h3 className="mt-8 font-bold text-xl"><Say>{p.title}</Say></h3><p className="mt-2 min-h-12 text-muted-foreground text-sm leading-6"><Say>{p.text}</Say></p><span className="mt-6 flex items-center gap-2 font-semibold text-primary text-sm"><Say>{p.action}</Say><ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" /></span></Link>; })}</div></div></section>

    <section id="how-it-works" className="container py-20"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="font-semibold text-primary text-sm"><Say>HOW IT WORKS</Say></p><h2 className="mt-2 text-balance font-bold text-3xl tracking-tight sm:text-4xl"><Say>A clearer way to learn technology</Say></h2><p className="mt-4 text-muted-foreground leading-7"><Say>Go from curiosity to confidence with a simple learning loop you can repeat at your own pace.</Say></p><Button className="mt-7 rounded-full" asChild><Link href="/playgrounds"><Say>Try it now</Say><ArrowRightIcon className="size-4" /></Link></Button></div><div className="grid gap-4 sm:grid-cols-3">{[
      { n:'01', title:'Choose', text:'Pick a language, ICT skill, or AI topic.', icon:GraduationCapIcon },
      { n:'02', title:'Practice', text:'Learn by writing, running, and improving.', icon:Code2Icon },
      { n:'03', title:'Share', text:'Show your work and grow with others.', icon:UsersIcon },
    ].map(x => { const Icon=x.icon; return <div key={x.n} className="rounded-3xl border bg-card p-6"><span className="font-black text-4xl text-primary/20">{x.n}</span><Icon className="mt-8 size-7 text-primary" /><h3 className="mt-4 font-bold text-lg"><Say>{x.title}</Say></h3><p className="mt-2 text-muted-foreground text-sm leading-6"><Say>{x.text}</Say></p></div>; })}</div></div></section>

    <section className="container pb-20"><div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-14 text-center text-white sm:px-12"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,.32),transparent_42%)]" /><div className="relative mx-auto max-w-2xl"><h2 className="text-balance font-bold text-3xl sm:text-4xl"><Say>Your next skill starts with one line of code.</Say></h2><p className="mt-4 text-zinc-400"><Say>Open a playground and start creating in seconds. No complicated setup, no pressure.</Say></p><Button size="lg" className="mt-8 rounded-full px-7" asChild><Link href="/playgrounds"><Say>Start learning for free</Say><ArrowRightIcon className="size-4" /></Link></Button></div></div></section>
  </main>;
}
