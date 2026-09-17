# activofijo-web — sistema visual

## Dirección
"Ledger patrimonial UAGRM": el panel se lee como un registro institucional
físico (placas de inventario, sellos de auditoría, papel), no como una
plantilla SaaS genérica. Usuario: funcionario de patrimonio de la UAGRM
conciliando activos contra un conteo físico o un sistema heredado — serio,
preciso, con rastro de auditoría (versión = concurrencia optimista).

## Tokens (`src/styles/globals.css`, Tailwind v4 `@theme`)
- `--color-paper` `#f6f4ee` — fondo de página / nivel "inset" de inputs.
- `--color-paper-raised` `#fffdf9` — superficie de tarjetas/paneles (nivel elevado).
- `--color-ink` / `-secondary` / `-tertiary` / `-muted` — jerarquía de texto en 4 niveles.
- `--color-brand` `#1f5c3d` / `-strong` `#163f2a` / `-surface` `#e6f0e9` — verde institucional (también = estado "bueno").
- `--color-accent` `#b8863b` / `-strong` / `-surface` — cobre/latón (alerta suave, estado "regular").
- `--color-danger` `#9c3b2e` / `-surface` — rojo ladrillo (no rojo puro, para no romper la paleta cálida).
- `--color-border` `rgba(20,37,28,.12)` / `-soft` `rgba(20,37,28,.07)`.
- `--radius-sm` 5px (inputs/botones) · `--radius-md` 9px (tarjetas) · `--radius-lg` 16px (reservado).

## Profundidad
Estrategia única: **cambio de tono de superficie + borde fino**, sin sombras
(la ilusión de "papel" se rompería con drop-shadows). `paper` = fondo/inset,
`paper-raised` = tarjeta. Inputs usan `bg-paper` dentro de tarjetas
`paper-raised` para leerse "hundidos".

## Tipografía
- `--font-sans` = Public Sans (next/font/google, var `--font-public-sans`) — cuerpo, tablas, UI. Elegida por ser el tipo de USWDS (diseñada para servicios de gobierno), muy legible en datos densos.
- `--font-serif` = Source Serif 4 (var `--font-source-serif`) — títulos (`h1`/`h2` de página, encabezado del panel). Evoca documento/acta impresa.
- `--font-mono` = IBM Plex Mono (var `--font-plex-mono`) — códigos patrimoniales, valores monetarios, sellos de versión.
- Escala ~1.25 desde base 14px: caption 11 · body 14 · h4/nav 15–16 · h3 18 · h2/h1 de página 20–22.

## Componentes clave (`src/components/`)
- `AssetTag` (código patrimonial) — chip con `clip-path` de muesca izquierda (forma de etiqueta física), mono, `bg-brand-surface`. Reutilizar siempre para mostrar un código de activo, nunca texto plano.
- `Stamp` — círculo punteado, rotado (~-5°), acento cobre. Usado para: monograma "AF" del header/login y número de versión (`v{n}`) — la firma de "esto quedó registrado".
- `ui/Button` — variantes `primary | secondary | ghost | destructive`, tamaños `sm | md`. `active:scale-[0.97]`, easing `cubic-bezier(0.23,1,0.32,1)`.
- `ui/Input`, `ui/Select`, `ui/Field` (label + control), `ui/Panel` (tarjeta con borde), `ui/Badge` (tono `brand|accent|danger|neutral`).
- Mapas de tono en `src/lib/estado.ts`: `ESTADO_ACTIVO_TONE`, `ESTADO_SYNC_TONE` — no hardcodear colores de estado en las páginas.

## Estructura (esquema enterprise, paleta propia)
Capa estructural adoptada de la skill `enterprise-ui-design`, manteniendo la
paleta/tipografía/identidad de arriba — no se tocan tokens ni componentes de
marca (`AssetTag`, `Stamp`) al aplicar esto.

- `Sidebar` (`src/components/Sidebar.tsx`) + `src/app/(dashboard)/layout.tsx` — reemplazó el header horizontal (`AppHeader`, eliminado). Ancho fijo `w-60`, `sticky top-0 h-screen`, agrupa nav bajo el caption "Patrimonio", logout anclado abajo.
- `ui/PageHeader` — título + descripción + acción primaria a la derecha; reemplaza el bloque repetido de encabezado de página en cada pantalla.
- `ui/Table` (`TableCard`, `THead`, `Th`, `TBody`, `Tr`, `Td`) — shell de tabla reutilizable; `TableCard` envuelve el `<table>` en `overflow-x-auto` (scroll horizontal en móvil, antes recortaba con `overflow-hidden`) y acepta un `footer` para paginación.
- `ui/Pagination` — paginación real sobre `/activos` (antes `limit=50&offset=0` fijos sin control). `PAGE_SIZE = 20`; `/sincronizacion` no pagina porque el endpoint del historial no acepta `limit`/`offset`.
- `ui/FormSection` — agrupa campos de los formularios de alta/edición en secciones con caption (`Identificación` / `Clasificación patrimonial` / `Detalle del activo` / `Estado y valorización`) en vez de una grilla plana.
- `ui/Toast` (`ToastProvider`, `useToast`) — montado en `(dashboard)/layout.tsx`. Toast de éxito tras registrar/editar un activo o ejecutar sincronización; los errores de formulario siguen siendo inline (banner junto al campo/form), nunca por toast.
- Accesibilidad: todo `Field`+`Input`/`Select` en `/activos` ahora pasa `id`/`htmlFor` emparejados (antes solo el login los tenía) — labels asociados programáticamente al control.

## Consistencia
- Espaciado: escala de Tailwind por defecto (base 4px), sin valores sueltos.
- Todo color viene de los tokens de arriba — nunca `gray-500`/`#fff` sueltos.
- Números dinámicos (valores, contadores) siempre con `font-mono` + `tabular-nums`.
- Componer con `cn()` de `src/lib/utils.ts`, no clases inline repetidas.
