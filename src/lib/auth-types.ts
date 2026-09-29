export interface UsuarioSesion {
  id: string;
  email: string;
  nombre: string;
  roles: string[];
  permisos: string[];
}

export interface SesionCore {
  accessToken: string;
  refreshToken: string;
  user: UsuarioSesion;
}

export type RespuestaLoginCore =
  | SesionCore
  | { requiere2fa: true; desafioToken: string }
  | { requiereConfiguracion2fa: true; desafioToken: string };

export interface ConfiguracionDosFactores {
  secreto: string;
  otpauthUri: string;
}

export interface ActivacionDosFactores {
  codigosRespaldo: string[];
}

export function esDesafio(
  respuesta: RespuestaLoginCore,
): respuesta is Extract<RespuestaLoginCore, { desafioToken: string }> {
  return 'desafioToken' in respuesta;
}
