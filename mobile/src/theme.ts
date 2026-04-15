/**
 * © 2026 AguaDC - Propiedad Privada.
 * Queda prohibida la reproducción, distribución o modificación total o parcial
 * de este código sin autorización expresa del autor.
 *
 * Proyecto  : AguaDC — Horario de Agua para el Distrito Central
 * Entidad   : U.M.A.P.S. — Unidad Municipal de Agua Potable y Saneamiento
 * Municipio : Distrito Central, Honduras
 */
/**
 * AguaDC — Paleta de colores oficial
 * Fuente: Propuesta de Logotipo e Identidad Visual (UMAPS, 2026)
 */

export const Colors = {
  // ── Paleta oficial ─────────────────────────────────────────────
  /** Deep Cobalt Blue — color primario de marca */
  primary:      '#0047AB',
  /** Sky Blue — color de acento */
  accent:       '#87CEEB',
  /** Clean White — fondo limpio */
  white:        '#FFFFFF',

  // ── Tonos extendidos derivados del primario ─────────────────────
  /** Azul marino oscuro (inicio de gradientes) */
  primaryDark:  '#001A4E',
  /** Cobalt medio (gradiente) */
  primaryMid:   '#0063CC',
  /** Tinte muy claro para fondos de tarjeta */
  primaryLight: '#E8F2FB',

  // ── Tonos extendidos del acento ─────────────────────────────────
  /** Sky blue oscurecido */
  accentDark:   '#5BA8CC',
  /** Sky blue pálido */
  accentPale:   '#BDE3F5',

  // ── Neutros de UI ───────────────────────────────────────────────
  /** Fondo de pantalla */
  background:   '#F0F8FF',
  /** Superficie de tarjetas */
  surface:      '#FFFFFF',
  /** Texto principal */
  textPrimary:  '#001A4E',
  /** Texto secundario / muted */
  textMuted:    '#546E7A',
  /** Bordes de inputs y cards */
  border:       '#C5DCF0',
} as const;

export type ColorKey = keyof typeof Colors;

/**
 * AguaDC — Tipografía oficial
 * Montserrat → títulos y texto de apoyo en peso bold/semibold
 * Inter      → texto de apoyo, cuerpo de texto
 */
export const Fonts = {
  // Montserrat — títulos
  headingBold:     'Montserrat-Bold',
  headingSemiBold: 'Montserrat-SemiBold',
  headingRegular:  'Montserrat-Regular',
  // Inter — cuerpo y apoyo
  body:            'Inter-Regular',
  bodySemiBold:    'Inter-SemiBold',
  bodyBold:        'Inter-Bold',
} as const;

export type FontKey = keyof typeof Fonts;
