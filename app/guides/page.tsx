import type { Metadata } from 'next'
import Link from 'next/link'
import { Zap, ArrowRight } from 'lucide-react'
import { GUIDES } from '@/lib/guides'

export const metadata: Metadata = {
  title: 'Campervan Electrical Guides | VanSpark 12V Pro',
  description: 'Practical campervan electrical guides: cable size charts, leisure battery sizing, inverter selection and 12V wiring — with a live calculator for each.',
}

export default function GuidesIndex() {
  return (
    <main className="min-h-screen bg-[#090d13] text-slate-100">
      <div className="mx-auto max-w-2xl px-5 py-14">
        <Link href="/" className="mb-10 flex items-center gap-3" aria-label="Back to VanSpark">
          <span className="grid size-9 place-items-center rounded-xl bg-amber-400 text-slate-950"><Zap className="size-5 fill-current" /></span>
          <span className="text-sm font-bold tracking-tight">VanSpark <span className="text-amber-400">12V Pro</span></span>
        </Link>
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">VanSpark guides</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Campervan electrics, explained properly.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">Every guide ends with a live, pre-configured calculator so you can check the numbers against your own build.</p>
        <div className="mt-10 grid gap-4">
          {GUIDES.map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="group rounded-xl border border-white/[0.08] bg-[#111822] p-5 transition hover:-translate-y-0.5 hover:border-amber-400/30 hover:bg-[#141e2a]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-100 group-hover:text-amber-300">{g.title}</h2>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">{g.description}</p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-slate-600 transition group-hover:text-amber-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
