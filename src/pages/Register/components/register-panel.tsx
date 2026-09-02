import { BrandLogo } from "@/components/layout/brand-logo"

/** Sisi kiri halaman Register: gradient + branding (disembunyikan di layar sempit). */
export function RegisterPanel() {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.32),transparent_34%),linear-gradient(160deg,#0f172a_0%,#1d4ed8_55%,#0f172a_100%)] lg:flex lg:flex-col lg:justify-between"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
      <div className="absolute -top-24 -right-24 size-96 rounded-full border border-white/10 bg-white/5 blur-2xl" />
      <div className="absolute -bottom-32 -left-16 size-[28rem] rounded-full border border-white/10 bg-gradient-to-tr from-cyan-400/20 to-transparent blur-3xl" />
      <div className="relative z-10 p-10">
        <BrandLogo className="[&_p]:text-white [&_p:last-child]:text-blue-100/80" />
      </div>
      <div className="relative z-10 max-w-lg p-10 text-white">
        <h2 className="text-4xl font-semibold leading-tight tracking-tight">
          Satu akun, akses yang terkendali.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-blue-100/80 md:text-base">
          Pendaftaran langsung memberi peran USER. Permissions diberikan oleh
          administrator melalui panel Akses &amp; Izin.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <RegisterStat value="USER" label="Peran awal" />
          <RegisterStat value="RBAC" label="Kontrol akses" />
          <RegisterStat value="7 hari" label="Sesi login" />
        </div>
      </div>
    </aside>
  )
}

function RegisterStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-sm border border-white/10 bg-white/10 p-4 backdrop-blur-md">
      <p className="text-[11px] uppercase tracking-[0.22em] text-blue-100/70">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  )
}