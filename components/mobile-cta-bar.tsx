'use client'

import { ArrowRight, Gauge } from 'lucide-react'

type Props = {
  ready: boolean
  summary: string
  onAction: () => void
}

// Sticky bottom purchase bar for small viewports — the #download checkout
// section sits far down the page, so this keeps the £7.99 blueprint one tap
// away on mobile. Hidden on lg+ where the in-page CTAs are already visible,
// and print-protected so it never lands in a printout.
export default function MobileCtaBar({ ready, summary, onAction }: Props) {
  return (
    <div className="print-protected fixed inset-x-0 bottom-0 z-40 border-t border-amber-400/25 bg-[#0b0f16]/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-xl lg:hidden">
      <div className="mx-auto max-w-md">
        <button
          onClick={onAction}
          className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold transition ${
            ready
              ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-300'
              : 'border border-amber-400/30 bg-amber-400/[0.08] text-amber-300 hover:bg-amber-400/[0.14]'
          }`}
        >
          {ready ? 'Get your blueprint · £7.99' : 'Configure your 12V system…'}
          <ArrowRight className="size-4 shrink-0" />
        </button>
        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-center text-[10px] text-slate-500">
          {ready && <Gauge className="size-3 shrink-0 text-amber-400" />}
          {summary}
        </p>
      </div>
    </div>
  )
}
