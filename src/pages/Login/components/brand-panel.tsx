import { BrandLogo } from "@/components/layout/brand-logo"

/** Sisi kiri halaman Login: gradient + branding (disembunyikan di layar sempit). */
export function BrandPanel() {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.32),transparent_34%),linear-gradient(160deg,#0f172a_0%,#1d4ed8_55%,#0f172a_100%)] lg:flex lg:flex-col lg:justify-between"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
      <DecorativeCircles />
      <div className="relative z-10 p-10">
        <BrandLogo className="[&_p]:text-white [&_p:last-child]:text-blue-100/80" />
      </div>
      <div className="relative z-10 max-w-lg p-10 text-white">
        <h2 className="text-4xl font-semibold leading-tight tracking-tight">
          Satu workspace untuk operasi yang rapi, cepat, dan aman.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-blue-100/80 md:text-base">
          Kelola akses, ringkasan aktivitas, dan panel kerja dalam antarmuka yang terasa modern
          tanpa kehilangan kesan resmi.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <StatCard label="Akses" value="RBAC" />
          <StatCard label="Respons" value="< 1s" />
          <StatCard label="Audit" value="On" />
        </div>
      </div>
    </aside>
  )
}

function DecorativeCircles() {
  return (
    <>
      <div className="absolute -top-24 -right-24 size-96 rounded-full border border-white/10 bg-white/5 blur-2xl" />
      <div className="absolute -bottom-32 -left-16 size-[28rem] rounded-full border border-white/10 bg-gradient-to-tr from-cyan-400/20 to-transparent blur-3xl" />
      <div className="absolute top-1/3 right-1/4 size-40 rounded-full bg-cyan-300/10 blur-xl" />
    </>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-white/10 bg-white/10 p-4 backdrop-blur-md">
      <p className="text-[11px] uppercase tracking-[0.22em] text-blue-100/70">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  )
}

export function FeaturePill({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-sm border border-border/70 bg-muted/40 p-4">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
    </div>
  )
}