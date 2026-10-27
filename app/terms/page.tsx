import type { Metadata } from 'next'
import { Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | VanSpark 12V Pro',
  description: 'Terms of use for the VanSpark 12V Pro campervan electrical design tool.',
}

const sections: [string, string][] = [
  [
    'Guidance, not installation advice',
    'VanSpark 12V Pro provides sizing estimates and reference schedules for self-build campervan electrical systems. Output is indicative guidance only and is not a substitute for design, installation, inspection, or testing by a qualified electrician. You are responsible for verifying every calculation, cable size, fuse rating, and connection before energising any system.',
  ],
  [
    'Limitation of liability',
    'To the fullest extent permitted by UK law, we accept no liability for loss, damage, injury, or non-compliance arising from use of this tool or its generated documents. Electrical work in vehicles must comply with applicable regulations including BS 7671 section 721.',
  ],
  [
    'Digital product purchases',
    'The £7.99 blueprint PDF is a digital download. Under UK Consumer Contracts Regulations, by starting an immediate download you acknowledge you lose the 14-day cancellation right once delivery begins. If a file is faulty, contact us and we will re-issue or refund it.',
  ],
  [
    'Acceptable use',
    'Do not scrape, resell, or misrepresent generated output as certified engineering documentation. Shared build links may be posted publicly at your discretion — they contain only your configuration, no personal data.',
  ],
  [
    'Changes',
    'We may update these terms as the product evolves; material changes will be noted on this page with a revised date.',
  ],
  [
    'Contact',
    'support@vanspark.co.uk',
  ],
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#090d13] text-slate-100">
      <div className="mx-auto max-w-2xl px-5 py-14">
        <a href="/" className="mb-10 flex items-center gap-3" aria-label="Back to VanSpark">
          <span className="grid size-9 place-items-center rounded-xl bg-amber-400 text-slate-950"><Zap className="size-5 fill-current" /></span>
          <span className="text-sm font-bold tracking-tight">VanSpark <span className="text-amber-400">12V Pro</span></span>
        </a>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Terms of Service</h1>
        <p className="mt-3 text-xs leading-5 text-slate-500">Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · Template — insert your registered company details before launch.</p>
        <div className="mt-10 grid gap-8">
          {sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-300">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{body}</p>
            </section>
          ))}
        </div>
        <a href="/" className="mt-12 inline-block text-xs text-amber-300 hover:text-amber-200">← Back to the estimator</a>
      </div>
    </main>
  )
}
