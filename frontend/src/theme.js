// theme.js
// Single source of truth for all design tokens.
// Import { T, nodeAccent } from './theme' in every file that needs styling.

export const T = {
  // ── Backgrounds ──────────────────────────────────────────────
  bgApp:        '#0F0F0F',
  bgSidebar:    '#111118',
  bgNode:       '#1A1A2E',
  bgNodeHeader: '#13131F',
  bgInput:      '#0D0D1A',
  bgHover:      '#1F1F35',

  // ── Borders ───────────────────────────────────────────────────
  border:       '#2A2A40',
  borderBright: '#3D3D5C',

  // ── Text ──────────────────────────────────────────────────────
  textPrimary:  '#F1F5F9',
  textSecondary:'#94A3B8',
  textMuted:    '#4B5563',
  textLabel:    '#CBD5E1',

  // ── Accent palette (one per node type) ───────────────────────
  blue:   '#3B82F6',
  green:  '#10B981',
  purple: '#8B5CF6',
  yellow: '#F59E0B',
  red:    '#EF4444',
  cyan:   '#06B6D4',
  orange: '#F97316',
  pink:   '#EC4899',
  teal:   '#14B8A6',

  // ── Edges ─────────────────────────────────────────────────────
  edgeColor:  '#6366F1',

  // ── Misc ──────────────────────────────────────────────────────
  radius:     '8px',
  radiusSm:   '5px',
  font:       "'Inter', system-ui, -apple-system, sans-serif",
  shadow:     '0 4px 24px rgba(0,0,0,0.5)',
  shadowSm:   '0 2px 8px rgba(0,0,0,0.4)',
};

// Per-node-type accent config: { color, icon }
export const nodeAccent = {
  customInput:   { color: T.blue,   icon: '⬇️' },
  customOutput:  { color: T.green,  icon: '⬆️' },
  llm:           { color: T.purple, icon: '🧠' },
  text:          { color: T.yellow, icon: '📝' },
  math:          { color: T.red,    icon: '🔢' },
  api:           { color: T.cyan,   icon: '🌐' },
  filter:        { color: T.orange, icon: '🔍' },
  transform:     { color: T.pink,   icon: '⚡' },
  outputDisplay: { color: T.teal,   icon: '🖥️' },
};

// Shared input / select style used inside every node body
export const inputStyle = {
  background:   '#0D0D1A',
  border:       `1px solid #2A2A40`,
  borderRadius: '5px',
  color:        '#F1F5F9',
  fontSize:     '12px',
  padding:      '4px 8px',
  width:        '100%',
  outline:      'none',
  fontFamily:   "'Inter', system-ui, sans-serif",
  marginTop:    '3px',
  boxSizing:    'border-box',
};

export const labelStyle = {
  display:    'flex',
  flexDirection: 'column',
  fontSize:   '11px',
  color:      '#94A3B8',
  fontFamily: "'Inter', system-ui, sans-serif",
  gap:        '2px',
};
