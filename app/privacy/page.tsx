import type { Metadata } from 'next'
import { Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | VanSpark 12V Pro',
  description: 'How VanSpark 12V Pro handles your data.',
}

const sections: [string, string][] = [
  [
    'What we collect',
    'Your build configuration (appliance selections and sizing inputs) is stored in your browser\u2019s localStorage and encoded into shareable URLs. This data never leaves your device unless you share a build link yourself. If analytics are enabled, we collect anonymous usage events such as page views and feature interactions.',
  ],
  [
    'Cookies & storage',
    'We use localStorage to remember your build between visits. If Google Analytics or Google Ads tags are enabled, those services may set their own cookies subject to Google\u2019s privacy policy.',
  ],
  [
    'Payments',
    'Purchases of the PDF blueprint are processed by Stripe. We never see or store your card details — Stripe handles payment data under their own PCI-DSS compliant privacy practices.',
  ],
  [
    'What we never do',
    'We do not sell personal data, we do not run advertising trackers beyond declared analytics tags, and we do not store your electrical designs on our servers.',
  ],
  [
    'Your rights',
    'Under UK GDPR you may request access, correction, or deletion of any personal data we hold. Since configurations live only in your browser, clearing site data removes them entirely.',
  ],
  [
    'Contact',
    'Questions about this policy: privacy@vanspark.example — update this address before launch.',
  ],
]

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#090d13] text-slate-100">
      <div className="mx-auto max-w-2xl px-5 py-14">
        <a href="/" className="mb-10 flex items-center gap-3" aria-label="Back to VanSpark">
          <span className="grid size-9 place-items-center rounded-xl bg-amber-400 text-slate-950"><Zap className="size-5 fill-current" /></span>
          <span className="text-sm font-bold tracking-tight">VanSpark <span className="text-amber-400">12V Pro</span></span>
        </a>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Privacy Policy</h1>
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
