import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Zap, ArrowRight, ChevronDown } from 'lucide-react'
import { GUIDES, buildLink } from '@/lib/guides'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const g = GUIDES.find((g) => g.slug === slug)
  if (!g) return {}
  return {
    title: g.metaTitle,
    description: g.description,
    openGraph: { title: g.metaTitle, description: g.description, type: 'article' },
  }
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const guide = GUIDES.find((g) => g.slug === slug)
  if (!guide) notFound()

  const others = GUIDES.filter((g) => g.slug !== slug)

  return (
    <main className="min-h-screen bg-[#090d13] text-slate-100">
      <div className="mx-auto max-w-3xl px-5 py-14">
        <Link href="/" className="mb-10 flex items-center gap-3" aria-label="Back to VanSpark">
          <span className="grid size-9 place-items-center rounded-xl bg-amber-400 text-slate-950"><Zap className="size-5 fill-current" /></span>
          <span className="text-sm font-bold tracking-tight">VanSpark <span className="text-amber-400">12V Pro</span></span>
        </Link>

        <nav className="text-[10px] font-bold uppercase tracking-wider text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-amber-300">Calculator</Link>
          <span className="mx-2 text-slate-700">/</span>
          <Link href="/guides" className="hover:text-amber-300">Guides</Link>
          <span className="mx-2 text-slate-700">/</span>
          <span className="text-amber-300">{guide.slug.replace(/-/g, ' ')}</span>
        </nav>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{guide.title}</h1>
        <p className="mt-4 text-sm leading-6 text-slate-400">{guide.intro}</p>

        <Link
          href={buildLink(guide.buildIds)}
          className="mt-8 flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/[0.08] p-5 transition hover:border-amber-400/60 hover:bg-amber-400/[0.12]"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-amber-400">Try it live</p>
            <p className="mt-1 text-sm font-semibold text-white">{guide.ctaLabel} — calculator opens pre-configured for this setup</p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-amber-300" />
        </Link>

        <div className="mt-12 grid gap-10">
          {guide.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold text-white">{section.heading}</h2>
              {section.body?.map((p, i) => (
                <p key={i} className="mt-3 text-sm leading-6 text-slate-400">{p}</p>
              ))}
              {section.table && (
                <div className="mt-4 overflow-x-auto rounded-xl border border-white/[0.08]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 text-[10px] uppercase tracking-wider text-slate-500">
                      <tr>{section.table.head.map((h) => <th key={h} className="px-4 py-2.5">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06] text-slate-300">
                      {section.table.rows.map((row, i) => (
                        <tr key={i}>{row.map((cell, j) => <td key={j} className="px-4 py-2.5">{cell}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {section.list && (
                <ul className="mt-4 space-y-2">
                  {section.list.map((item, i) => (
                    <li key={i} className="flex gap-2.5 text-sm leading-6 text-slate-400">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-amber-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <section className="mt-14">
          <h2 className="text-lg font-semibold text-white">Common questions</h2>
          <div className="mt-4 grid gap-3">
            {guide.faqs.map(([q, a]) => (
              <details key={q} className="group rounded-xl border border-white/[0.08] bg-[#111822] px-5 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-slate-200 [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown className="size-4 shrink-0 text-slate-500 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-xs leading-5 text-slate-400">{a}</p>
              </details>
            ))}
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: guide.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
              }),
            }}
          />
        </section>

        <Link
          href={buildLink(guide.buildIds)}
          className="mt-12 flex items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/[0.08] p-5 transition hover:border-amber-400/60 hover:bg-amber-400/[0.12]"
        >
          <p className="text-sm font-semibold text-white">{guide.ctaLabel}</p>
          <ArrowRight className="size-5 shrink-0 text-amber-300" />
        </Link>

        <nav className="mt-10 border-t border-white/[0.07] pt-8" aria-label="More guides">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">More guides</p>
          <ul className="mt-3 grid gap-2">
            {others.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="text-sm text-amber-300 hover:text-amber-200">{g.title}</Link>
              </li>
            ))}
            <li><Link href="/" className="text-sm text-slate-400 hover:text-slate-200">← Back to the calculator</Link></li>
          </ul>
        </nav>
      </div>
    </main>
  )
}
