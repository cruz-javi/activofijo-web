const INICIO_DE_FORMULA = /^[=+\-@\t\r]/;

const ENTIDADES_HTML: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// Inyección de fórmulas (CSV/DDE): un texto que inicia con = + - @ se ejecutaría al abrirse en una hoja de cálculo; el apóstrofe lo fuerza a texto.
export function neutralizarFormula(valor: string): string {
  return INICIO_DE_FORMULA.test(valor) ? `'${valor}` : valor;
}

export function escaparHtml(valor: unknown): string {
  return String(valor ?? '').replace(/[&<>"']/g, (caracter) => ENTIDADES_HTML[caracter] ?? caracter);
}
