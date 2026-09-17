# activofijo-web — Panel Administrativo Web (UAGRM)

Panel de administración web para la gestión de inventario y activos fijos de la UAGRM.

## Arquitectura

- **Framework**: Next.js 16 (App Router) + React 19.
- **Estilos**: Tailwind CSS 4.
- **Patrón de Seguridad**: BFF (Backend-for-Frontend).
  - Tokens JWT nunca accesibles a JavaScript en el navegador.
  - Almacenamiento exclusivo en cookies seguras `httpOnly` + `Secure` + `SameSite=Lax`.
  - Rotación y refresco transparente en Route Handlers de Next.js (`/api/auth/*` y `/api/proxy/*`).
- **Estado y Tablas**: `@tanstack/react-query` y `@tanstack/react-table`.
- **Contratos de API**: Cliente fuertemente tipado generado vía `openapi-typescript` y `openapi-fetch` a partir del `openapi.json` del core.

## Sistema de diseño

Antes de tocar UI (tokens, tipografía, componentes de `src/components/`), lee
[`.interface-design/system.md`](./.interface-design/system.md) — documenta la
dirección visual ("ledger patrimonial UAGRM"), la paleta/tipografía y los
componentes clave (`AssetTag`, `Stamp`, `Sidebar`, `PageHeader`, etc.).
Mantenlo actualizado si cambias algo de esto para que el equipo no reinvente
el sistema en cada PR.

## Requisitos previos

- Node.js >= 22.12
- pnpm >= 10.x
- `activofijo-core` corriendo o red Docker `activofijo-net` activa.

## Arranque rápido

1. Instalar dependencias:
   ```bash
   pnpm install
   ```

2. Configurar entorno:
   ```bash
   cp .env.example .env
   ```

3. Generar tipos del API (requiere `activofijo-core` exportando o archivo local):
   ```bash
   pnpm gen:api
   ```

4. Iniciar en desarrollo:
   ```bash
   pnpm dev
   ```
   Disponible en `http://localhost:3001`.
