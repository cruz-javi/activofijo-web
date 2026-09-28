'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { LoginModal } from '@/components/auth/LoginModal';

function LoginAutoOpener({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get('login') === 'true' || searchParams.get('login') === '1') {
      onOpen();
    }
  }, [searchParams, onOpen]);
  return null;
}
import { 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  Target, 
  Boxes, 
  Laptop, 
  Building2, 
  FileCheck2, 
  Clock, 
  Coins, 
  TrendingDown, 
  MessageCircle, 
  Share2, 
  CheckCircle2,
  LucideIcon
} from 'lucide-react';

interface CharacteristicItem {
  icon: LucideIcon;
  title: string;
  description: string;
  tone: 'brand' | 'navy' | 'accent';
}

interface ClassificationDetail {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface StrategicPillar {
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  tone: 'brand' | 'navy';
}

interface Authority {
  name: string;
  role: string;
  isPrimary?: boolean;
}

// CTNAC (1994) y NB-SABS D.S. 0181: Bienes de uso institucional con vida útil superior a un año.
const CHARACTERISTICS: CharacteristicItem[] = [
  {
    icon: Clock,
    title: 'Durabilidad',
    description: 'Bienes concebidos para un servicio prolongado en el tiempo, con vida útil estimada superior a un año calendario.',
    tone: 'brand',
  },
  {
    icon: Boxes,
    title: 'Uso Operativo',
    description: 'Bienes indispensables para la formación académica, laboratorios científicos y la gestión administrativa.',
    tone: 'navy',
  },
  {
    icon: Coins,
    title: 'No Liquidez Inmediata',
    description: 'Su objetivo es garantizar el funcionamiento institucional de la UAGRM y no su conversión inmediata en efectivo.',
    tone: 'accent',
  },
  {
    icon: TrendingDown,
    title: 'Depreciación',
    description: 'Reconocimiento contable y periódico de la pérdida paulatina de valor por uso, desgaste natural u obsolescencia técnica.',
    tone: 'brand',
  },
];

const TANGIBLE_ITEMS: ClassificationDetail[] = [
  {
    icon: Boxes,
    title: 'Muebles y Enseres',
    description: 'Mobiliario de equipamiento de oficinas, aulas, laboratorios, vehículos y maquinarias operativas.',
  },
  {
    icon: Building2,
    title: 'Bienes Inmuebles',
    description: 'Derecho propietario de terrenos universitarios, edificios académicos, campus y propiedades agro-forestales.',
  },
];

const INTANGIBLE_ITEMS: ClassificationDetail[] = [
  {
    icon: Laptop,
    title: 'Software y Sistemas',
    description: 'Plataformas tecnológicas, licencias informáticas y sistemas de gestión institucional desarrollados o adquiridos.',
  },
  {
    icon: CheckCircle2,
    title: 'Derechos y Propiedad Intelectual',
    description: 'Derechos de autor, patentes, investigaciones científicas registradas y normativas institucionales protegidas.',
  },
];

// Pilares estratégicos del Departamento de Activo Fijo UAGRM según Plan Estratégico Institucional.
const STRATEGIC_PILLARS: StrategicPillar[] = [
  {
    icon: ShieldCheck,
    badge: 'Misión',
    title: 'Control y Salvaguarda',
    description: 'Controlar y salvaguardar los activos fijos de nuestra universidad, a través de una adecuada administración, disposición, conservación y resguardo, coadyuvando con el desarrollo y logro de objetivos institucionales.',
    tone: 'brand',
  },
  {
    icon: Eye,
    badge: 'Visión',
    title: 'Eficiencia y Modernidad',
    description: 'Ser ejemplo institucional haciendo gestión con eficiencia, eficacia y economía en la administración de bienes muebles, enseres e inmuebles, mediante la aplicación de tecnologías y normativas legales relacionadas con el manejo de activos fijos en la UAGRM.',
    tone: 'navy',
  },
  {
    icon: Target,
    badge: 'Objetivo',
    title: 'Planificación y Optimización',
    description: 'Establecer lineamientos de trabajo mediante un Plan Estratégico Institucional, que permite realizar una administración adecuada y actualizada de los bienes a través de mecanismos y políticas administrativas para el manejo, uso, disposición, conservación y resguardo de los activos fijos propiedad de la UAGRM.',
    tone: 'brand',
  },
];

const AUTHORITIES: Authority[] = [
  {
    name: 'Ing. José Miguel Justiniano M.',
    role: 'Jefe Dpto. Activo Fijo',
    isPrimary: true,
  },
  {
    name: 'MSc. Juana Borja',
    role: 'Vicerrectora',
  },
  {
    name: 'Dr. Reinerio Vargas',
    role: 'Rector',
    isPrimary: true,
  },
];

const NAV_LINKS = [
  { href: '#definicion', label: '¿Qué es?' },
  { href: '#clasificacion', label: 'Clasificación' },
  { href: '#direccionamiento', label: 'Direccionamiento' },
  { href: '#contacto', label: 'Contacto' },
];

export default function LandingPage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper flex flex-col font-sans selection:bg-brand-surface selection:text-brand scroll-smooth">
      <header className="sticky top-0 z-50 bg-paper-raised/95 backdrop-blur-md border-b border-border-soft transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 shrink-0 flex items-center justify-center p-1 bg-white rounded-lg border border-border-soft shadow-xs group-hover:border-brand/40 group-hover:shadow-sm transition-all duration-300">
              <Image 
                src="/logo_uagrm_activo_fijo.svg" 
                alt="Logotipo Activo Fijo UAGRM" 
                width={36} 
                height={36} 
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                priority 
              />
            </div>
            
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-0.5 bg-brand rounded-full hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="font-sans font-bold text-ink text-sm sm:text-base tracking-tight leading-none group-hover:text-brand transition-colors duration-200">
                  ACTIVO FIJO
                </span>
                <span className="text-xs font-semibold text-ink-secondary tracking-wider uppercase leading-snug">
                  Universidad Autónoma Gabriel René Moreno
                </span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-ink-secondary">
              {NAV_LINKS.map((item) => (
                <a 
                  key={item.href} 
                  href={item.href} 
                  className="hover:text-ink transition-colors duration-150 py-1"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <button 
              type="button"
              onClick={() => setLoginModalOpen(true)}
              className="inline-flex items-center gap-2 bg-brand text-white px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-brand-strong transition-all duration-200 shadow-xs hover:shadow-md active:scale-95 cursor-pointer"
            >
              Iniciar Sesión
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <section className="relative pt-16 sm:pt-24 pb-20 sm:pb-28 px-4 sm:px-6 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-surface border border-brand/20 mb-6 sm:mb-8 shadow-xs hover:border-brand/40 transition-colors duration-200">
              <span className="h-2 w-2 rounded-full bg-brand animate-pulse"></span>
              <span className="text-xs font-semibold text-brand tracking-wide">
                Dirección Administrativa y Financiera • UAGRM
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-ink tracking-tight font-serif leading-tight mb-6">
              Custodia y transparencia del patrimonio universitario.
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-ink-secondary max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-sans">
              El Departamento de Activo Fijo vela por la preservación, control y administración responsable de todos los bienes tangibles e intangibles de la UAGRM, al servicio de la docencia, la investigación y la comunidad universitaria.
            </p>

            <div className="flex flex-col items-center justify-center gap-3">
              <button 
                type="button"
                onClick={() => setLoginModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-brand text-white px-8 py-3.5 rounded-xl text-sm sm:text-base font-semibold hover:bg-brand-strong transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              >
                Iniciar Sesión
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="text-xs text-ink-tertiary">
                Acceso exclusivo para funcionarios y custodios autorizados
              </span>
            </div>
          </div>
        </section>

        <section id="definicion" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
          <div className="bg-paper-raised border border-border-soft rounded-2xl p-6 sm:p-10 md:p-12 shadow-xs transition-shadow duration-300 hover:shadow-sm">
            <div className="max-w-3xl mb-10">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-wider mb-2">
                <FileCheck2 className="h-4 w-4 text-brand" />
                Definición Normativa
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ink font-serif tracking-tight mb-4">
                ¿Qué es un Activo Fijo?
              </h2>
              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
                De acuerdo a la normativa técnica contable (<strong className="text-ink font-semibold">CTNAC, 1994</strong>), un Activo Fijo es un bien tangible o intangible, duradero y necesario para la operación de la institución, que no está destinado a la venta inmediata y posee una vida útil superior a un año.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-border-soft">
              {CHARACTERISTICS.map((item) => {
                const IconComponent = item.icon;
                const toneClasses = {
                  brand: 'bg-brand-surface text-brand',
                  navy: 'bg-brand-navy-surface text-ink',
                  accent: 'bg-accent-surface text-accent-strong',
                }[item.tone];

                return (
                  <div 
                    key={item.title} 
                    className="group flex flex-col p-3 -m-3 rounded-xl transition-all duration-200 hover:bg-paper"
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-110 ${toneClasses}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-ink text-sm sm:text-base mb-1 group-hover:text-brand transition-colors duration-200">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="clasificacion" className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ink font-serif tracking-tight mb-3">
              Clasificación de Bienes
            </h2>
            <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
              Estructura reglamentaria para el inventario, catalogación y resguardo del patrimonio universitario.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group bg-paper-raised border border-border-soft rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs transition-all duration-300 hover:shadow-md hover:border-border hover:-translate-y-1">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-navy-surface text-ink">
                    <Boxes className="h-4 w-4" />
                    Categoría Física
                  </span>
                  <span className="text-xs font-semibold text-ink-tertiary">Verificables</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-ink font-serif mb-2">
                  Activos Tangibles
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary mb-6 leading-relaxed">
                  Bienes que físicamente pueden ser verificados e inspeccionados, y que ocupan un espacio físico determinado en los predios de la universidad.
                </p>

                <div className="space-y-4 pt-4 border-t border-border-soft">
                  {TANGIBLE_ITEMS.map((subItem) => {
                    const SubIcon = subItem.icon;
                    return (
                      <div key={subItem.title} className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded bg-paper flex items-center justify-center text-ink shrink-0 mt-0.5 border border-border-soft transition-colors duration-200 group-hover:border-border">
                          <SubIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-ink text-sm">{subItem.title}</h4>
                          <p className="text-xs text-ink-secondary leading-relaxed">
                            {subItem.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="group bg-paper-raised border border-border-soft rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs transition-all duration-300 hover:shadow-md hover:border-brand/30 hover:-translate-y-1">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-surface text-brand">
                    <Laptop className="h-4 w-4" />
                    Categoría Digital y Legal
                  </span>
                  <span className="text-xs font-semibold text-ink-tertiary">Inmateriales</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-ink font-serif mb-2">
                  Activos Intangibles
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary mb-6 leading-relaxed">
                  Bienes que no pueden ser verificados materialmente y que no ocupan un espacio físico, pero aportan alto valor técnico e intelectual a la institución.
                </p>

                <div className="space-y-4 pt-4 border-t border-border-soft">
                  {INTANGIBLE_ITEMS.map((subItem) => {
                    const SubIcon = subItem.icon;
                    return (
                      <div key={subItem.title} className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded bg-paper flex items-center justify-center text-brand shrink-0 mt-0.5 border border-border-soft transition-colors duration-200 group-hover:border-brand/20">
                          <SubIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-ink text-sm">{subItem.title}</h4>
                          <p className="text-xs text-ink-secondary leading-relaxed">
                            {subItem.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="direccionamiento" className="py-16 sm:py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ink font-serif tracking-tight mb-3">
              Direccionamiento Institucional
            </h2>
            <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
              Pilares estratégicos que guían la gestión, resguardo y custodia del patrimonio en la UAGRM.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STRATEGIC_PILLARS.map((pillar) => {
              const PillarIcon = pillar.icon;
              const isBrand = pillar.tone === 'brand';
              const iconWrapperClass = isBrand
                ? 'bg-brand-surface text-brand'
                : 'bg-brand-navy-surface text-ink';
              const badgeClass = isBrand ? 'text-brand' : 'text-ink';

              return (
                <div 
                  key={pillar.badge}
                  className="group bg-paper-raised border border-border-soft rounded-2xl p-6 sm:p-8 flex flex-col shadow-xs relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-brand/30 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${iconWrapperClass}`}>
                    <PillarIcon className="h-6 w-6" />
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider mb-2 ${badgeClass}`}>
                    {pillar.badge}
                  </span>
                  <h3 className="text-lg font-bold text-ink mb-3 font-serif group-hover:text-brand transition-colors duration-200">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full">
          <div className="bg-paper-raised border border-border-soft rounded-2xl p-6 sm:p-8 shadow-xs transition-shadow duration-300 hover:shadow-sm">
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-ink-tertiary uppercase tracking-wider">
                Autoridades Universitarias
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {AUTHORITIES.map((auth) => (
                <div key={auth.name} className="flex flex-col items-center">
                  <span className="font-bold text-ink text-sm sm:text-base">
                    {auth.name}
                  </span>
                  <span className={`text-xs font-semibold uppercase tracking-wider mt-1 ${auth.isPrimary ? 'text-brand' : 'text-ink-secondary'}`}>
                    {auth.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="contacto" className="px-4 sm:px-6 pb-8 pt-12 max-w-7xl mx-auto w-full">
        <div className="bg-paper-raised border border-border-soft rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 shadow-xs transition-shadow duration-300 hover:shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2 flex flex-col items-start">
              <div className="flex items-center gap-3 mb-4 group">
                <div className="w-10 h-10 p-1 bg-white rounded-lg border border-border-soft shadow-xs flex items-center justify-center shrink-0">
                  <Image 
                    src="/logo_uagrm_activo_fijo.svg" 
                    alt="Logo UAGRM" 
                    width={32} 
                    height={32} 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-ink text-base tracking-tight leading-none">
                    ACTIVO FIJO
                  </span>
                  <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mt-1">
                    Universidad Autónoma Gabriel René Moreno
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-ink-secondary max-w-sm leading-relaxed mb-4">
                Unidad administrativa responsable del registro, control físico, inventariación y custodia del patrimonio universitario en todas las unidades académicas y administrativas.
              </p>
              <span className="text-xs text-ink-tertiary">
                Campus Universitario • Santa Cruz de la Sierra, Bolivia
              </span>
            </div>

            <div className="flex flex-col">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-4">
                Plataforma
              </h4>
              <ul className="space-y-2.5 text-xs text-ink-secondary">
                <li>
                  <button 
                    type="button"
                    onClick={() => setLoginModalOpen(true)}
                    className="hover:text-brand font-semibold transition-colors duration-150 text-left cursor-pointer"
                  >
                    Iniciar Sesión
                  </button>
                </li>
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="hover:text-ink transition-colors duration-150">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col">
              <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-4">
                Atención y Redes
              </h4>
              <ul className="space-y-2.5 text-xs text-ink-secondary">
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <a 
                    href="https://wa.me/59171030031" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="hover:text-ink transition-colors duration-150 font-mono"
                  >
                    WhatsApp: 71030031
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Share2 className="h-3.5 w-3.5 text-ink-tertiary shrink-0" />
                  <span className="text-ink-secondary">Facebook: /ActivoFijo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Share2 className="h-3.5 w-3.5 text-ink-tertiary shrink-0" />
                  <span className="text-ink-secondary">TikTok: /ActivoFijo</span>
                </li>
                <li className="pt-2 text-xs text-ink-tertiary">
                  Consultas sobre trámites de baja, alta y traspaso de bienes patrimoniales.
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-border-soft flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-tertiary">
            <div>
              &copy; {new Date().getFullYear()} Universidad Autónoma Gabriel René Moreno. Todos los derechos reservados.
            </div>
            <div className="text-xs text-ink-tertiary">
              Departamento de Activo Fijo — DAF
            </div>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        <LoginAutoOpener onOpen={() => setLoginModalOpen(true)} />
      </Suspense>

      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
      />
    </div>
  );
}
