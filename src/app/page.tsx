import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, MapPin, ClipboardCheck, ArrowUpRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans selection:bg-brand-surface selection:text-brand">
      {/* Header Institucional */}
      <header className="border-b border-border-soft bg-paper-raised sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo_uagrm_activo_fijo.svg" alt="Escudo UAGRM" width={36} height={36} className="w-9 h-9" />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-ink text-sm leading-tight tracking-wide">
                UAGRM
              </span>
              <span className="text-[10px] font-semibold text-ink-secondary uppercase tracking-wider">
                Activo Fijo
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="https://www.uagrm.edu.bo/" 
              target="_blank"
              className="text-xs font-semibold text-ink-secondary hover:text-ink transition-colors hidden sm:block"
            >
              Portal UAGRM
            </Link>
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded text-xs font-semibold hover:bg-brand-strong transition-colors shadow-sm"
            >
              Iniciar Sesión
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Subtle grid background to look like paper/ledger */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] pointer-events-none mix-blend-multiply"></div>
        <div className="absolute -top-32 -right-32 w-600px h-600px bg-brand-surface rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

        <section className="relative pt-24 pb-32 px-6">
          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
            
            <Image src="/logo_uagrm_activo_fijo.svg" alt="UAGRM" width={120} height={120} className="w-24 h-24 mb-6 opacity-90 drop-shadow-sm" />
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface border border-brand/20 mb-8">
              <div className="h-2 w-2 rounded-full bg-brand animate-pulse"></div>
              <span className="text-[11px] font-semibold text-brand tracking-wide uppercase">
                Sistema Oficial de Control Patrimonial
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-ink tracking-tight leading-[1.1] mb-6 font-serif">
              Trazabilidad y control inmutable para la Universidad.
            </h1>
            
            <p className="text-lg text-ink-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
              La plataforma institucional de la Universidad Autónoma Gabriel René Moreno para la asignación, auditoría y custodia de los bienes patrimoniales en todas sus facultades.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/login" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-md text-sm font-semibold hover:bg-brand-strong transition-colors shadow-sm"
              >
                Acceder al Sistema
              </Link>
              <Link 
                href="https://www.uagrm.edu.bo/unidades-administrativas/activo-fijo" 
                target="_blank"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-paper-raised border border-border text-ink px-6 py-3 rounded-md text-sm font-semibold hover:bg-border-soft transition-colors"
              >
                Información Normativa
                <ArrowUpRight className="h-4 w-4 text-ink-tertiary" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-paper-raised border-y border-border-soft py-24 px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-12">
              
              <div className="flex flex-col group">
                <div className="h-10 w-10 flex items-center justify-center rounded bg-paper border border-border-soft mb-5 group-hover:border-brand/40 group-hover:bg-brand-surface transition-colors">
                  <ShieldCheck className="h-5 w-5 text-ink group-hover:text-brand transition-colors" />
                </div>
                <h3 className="text-base font-bold text-ink mb-3">Custodia Segura</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Registro detallado de asignaciones (Formulario PB-14). Historial inmutable de cada funcionario responsable del resguardo de los equipos.
                </p>
              </div>

              <div className="flex flex-col group">
                <div className="h-10 w-10 flex items-center justify-center rounded bg-paper border border-border-soft mb-5 group-hover:border-brand/40 group-hover:bg-brand-surface transition-colors">
                  <MapPin className="h-5 w-5 text-ink group-hover:text-brand transition-colors" />
                </div>
                <h3 className="text-base font-bold text-ink mb-3">Auditoría en Campo</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Interfaz móvil optimizada para fiscalización in situ. Escaneo, validación y reposición de etiquetas patrimoniales sin depender de papel.
                </p>
              </div>

              <div className="flex flex-col group">
                <div className="h-10 w-10 flex items-center justify-center rounded bg-paper border border-border-soft mb-5 group-hover:border-brand/40 group-hover:bg-brand-surface transition-colors">
                  <ClipboardCheck className="h-5 w-5 text-ink group-hover:text-brand transition-colors" />
                </div>
                <h3 className="text-base font-bold text-ink mb-3">Cuadros Valorados</h3>
                <p className="text-sm text-ink-secondary leading-relaxed">
                  Generación automática de cuadros valorados, actas de alta, baja y traspaso. Trazabilidad financiera con reportes aptos para contraloría.
                </p>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-paper py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all">
            <Image src="/logo_uagrm_activo_fijo.svg" alt="UAGRM" width={24} height={24} className="w-6 h-6" />
            <span className="font-serif font-bold text-ink text-xs">UAGRM</span>
            <span className="text-[10px] text-ink-secondary uppercase tracking-wider">Activo Fijo &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="text-[11px] text-ink-tertiary">
            Universidad Autónoma Gabriel René Moreno - Santa Cruz, Bolivia
          </div>
        </div>
      </footer>
    </div>
  );
}
