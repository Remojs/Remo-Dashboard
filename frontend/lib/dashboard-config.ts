/**
 * dashboard-config.ts
 * ──────────────────────────────────────────────────────────────────────────
 * Centralised config for the Herramientas, Admin Dashboards, and Promociones
 * sections on the main dashboard.
 *
 * ✏️  Edit the arrays below to add / remove entries.
 * URLs and names MUST come from this file — never hardcode them inside
 * individual components.
 * ──────────────────────────────────────────────────────────────────────────
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface Tool {
  id: string
  name: string
  description: string
  url: string
  /** Tailwind color token for the icon background, e.g. "violet", "sky", "emerald" */
  color: string
  /** Emoji shown in the card */
  emoji: string
}

export interface AdminDashboard {
  id: string
  name: string
  description: string
  url: string
  color: string
  emoji: string
}

export type PromocionOwnerColor = 'blue' | 'green' | 'yellow'

export interface PromocionOwner {
  id: string
  nombre: string
  color: PromocionOwnerColor
}

export interface Rubro {
  nombre: string
  emoji: string
}

export interface Provincia {
  id: string
  nombre: string
  /** Tailwind accent color (badge tint) */
  color: 'violet' | 'sky' | 'emerald' | 'amber' | 'rose' | 'orange' | 'teal' | 'indigo'
  rubros: Rubro[]
}

// ── Herramientas ───────────────────────────────────────────────────────────
// Agregá / editá los entries para reflejar las tools reales del equipo.

export const TOOLS: Tool[] = [
  // Cargá aquí tus herramientas.
  // El emoji es totalmente custom (ej: '🧰', '🤖', '📊').
]

// ── Admin Dashboards ───────────────────────────────────────────────────────
// Las 3 cuentas del equipo. Editá las URLs para apuntar a los paneles reales.
// ⚠️  No hardcodees URLs aquí con datos sensibles — usá las rutas públicas de login.

export const ADMIN_DASHBOARDS: AdminDashboard[] = [
  // Cargá aquí tus dashboards.
  // El emoji es totalmente custom (ej: '📣', '🧪', '🛠️').
]

export const PROMOCIONES_OWNERS: PromocionOwner[] = [
  { id: 'santino', nombre: 'Santino', color: 'blue' },
  { id: 'thiago', nombre: 'Thiago', color: 'green' },
  { id: 'lucas', nombre: 'Lucas', color: 'yellow' },
]

export const PROMOCIONES_RUBROS: string[] = []

// ── Provincias & Rubros para Promociones ───────────────────────────────────
// Lista de provincias argentinas con rubros recomendados para campañas.

export const PROVINCIAS: Provincia[] = [
  {
    id: 'buenos-aires',
    nombre: 'Buenos Aires (GBA)',
    color: 'violet',
    rubros: [
      { nombre: 'Restaurantes y gastronomía', emoji: '🍽️' },
      { nombre: 'Gimnasios y fitness', emoji: '💪' },
      { nombre: 'Salones de belleza', emoji: '💇' },
      { nombre: 'Inmobiliarias', emoji: '🏠' },
      { nombre: 'Comercios minoristas', emoji: '🛍️' },
      { nombre: 'Veterinarias', emoji: '🐾' },
    ],
  },
  {
    id: 'caba',
    nombre: 'CABA',
    color: 'sky',
    rubros: [
      { nombre: 'Startups y tecnología', emoji: '🚀' },
      { nombre: 'Bares y restaurantes', emoji: '🍺' },
      { nombre: 'Moda y retail', emoji: '👗' },
      { nombre: 'Consultorios médicos', emoji: '🏥' },
      { nombre: 'Servicios profesionales', emoji: '💼' },
      { nombre: 'Coworking y oficinas', emoji: '🏢' },
    ],
  },
  {
    id: 'cordoba',
    nombre: 'Córdoba',
    color: 'emerald',
    rubros: [
      { nombre: 'Turismo serrano', emoji: '⛰️' },
      { nombre: 'Automotrices y concesionarias', emoji: '🚗' },
      { nombre: 'Academias y educación', emoji: '📚' },
      { nombre: 'Agro e industria', emoji: '🌾' },
      { nombre: 'Restaurantes y bares', emoji: '🍽️' },
      { nombre: 'Construcción e inmobiliarias', emoji: '🏗️' },
    ],
  },
  {
    id: 'santa-fe',
    nombre: 'Santa Fe / Rosario',
    color: 'amber',
    rubros: [
      { nombre: 'Logística y transporte', emoji: '🚛' },
      { nombre: 'Agro e industria', emoji: '🌾' },
      { nombre: 'Comercios minoristas', emoji: '🛒' },
      { nombre: 'Constructoras', emoji: '🏗️' },
      { nombre: 'Gastronomía', emoji: '🍽️' },
      { nombre: 'Salud privada', emoji: '🏥' },
    ],
  },
  {
    id: 'mendoza',
    nombre: 'Mendoza',
    color: 'rose',
    rubros: [
      { nombre: 'Bodegas y turismo vitivinícola', emoji: '🍷' },
      { nombre: 'Hoteles y turismo', emoji: '🏨' },
      { nombre: 'Restaurantes', emoji: '🍽️' },
      { nombre: 'Inmobiliarias', emoji: '🏠' },
      { nombre: 'Fruticultura y agro', emoji: '🍑' },
      { nombre: 'Deportes y aventura', emoji: '🧗' },
    ],
  },
  {
    id: 'tucuman',
    nombre: 'Tucumán',
    color: 'orange',
    rubros: [
      { nombre: 'Agroindustria (caña de azúcar)', emoji: '🌿' },
      { nombre: 'Comercios minoristas', emoji: '🛍️' },
      { nombre: 'Salud privada y clínicas', emoji: '🏥' },
      { nombre: 'Educación y academias', emoji: '📚' },
      { nombre: 'Gastronomía', emoji: '🍽️' },
      { nombre: 'Ferretería y construcción', emoji: '🔧' },
    ],
  },
  {
    id: 'misiones',
    nombre: 'Misiones',
    color: 'teal',
    rubros: [
      { nombre: 'Turismo (Cataratas del Iguazú)', emoji: '🌊' },
      { nombre: 'Hoteles y hospedajes', emoji: '🏨' },
      { nombre: 'Artesanías y souvenirs', emoji: '🎁' },
      { nombre: 'Yerba mate y agro', emoji: '🧉' },
      { nombre: 'Guías y agencias turísticas', emoji: '🗺️' },
      { nombre: 'Gastronomía regional', emoji: '🍽️' },
    ],
  },
  {
    id: 'neuquen',
    nombre: 'Neuquén / Patagonia',
    color: 'indigo',
    rubros: [
      { nombre: 'Turismo aventura y ski', emoji: '⛷️' },
      { nombre: 'Hotelería y cabañas', emoji: '🏔️' },
      { nombre: 'Petróleo y energía', emoji: '⚡' },
      { nombre: 'Inmobiliarias', emoji: '🏠' },
      { nombre: 'Deportes al aire libre', emoji: '🎿' },
      { nombre: 'Gastronomía', emoji: '🍽️' },
    ],
  },
]
