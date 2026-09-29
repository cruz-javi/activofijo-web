export interface RespuestaCore<T> {
  status: number;
  ok: boolean;
  data: T & { message?: string };
}

export function obtenerContextoCliente(req: Request): { ip: string; userAgent: string } {
  return {
    ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1',
    userAgent: req.headers.get('user-agent') || 'Browser',
  };
}

export async function postCore<T>(ruta: string, cuerpo: unknown, req: Request): Promise<RespuestaCore<T>> {
  const coreUrl = process.env.CORE_API_URL || 'http://localhost:3000';
  const { ip, userAgent } = obtenerContextoCliente(req);

  const res = await fetch(`${coreUrl}${ruta}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
      'user-agent': userAgent,
    },
    body: JSON.stringify(cuerpo),
  });

  const texto = await res.text();
  const data = texto ? JSON.parse(texto) : {};
  return { status: res.status, ok: res.ok, data };
}
