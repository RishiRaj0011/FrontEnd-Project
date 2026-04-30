// toolbar.js
import { useState } from 'react';
import { T, nodeAccent } from './theme';

const SECTIONS = [
  {
    label: 'Core Nodes',
    nodes: [
      { type: 'customInput',  label: 'Input'   },
      { type: 'customOutput', label: 'Output'  },
      { type: 'llm',          label: 'LLM'     },
      { type: 'text',         label: 'Text'    },
    ],
  },
  {
    label: 'Logic Nodes',
    nodes: [
      { type: 'math',      label: 'Math'      },
      { type: 'filter',    label: 'Filter'    },
      { type: 'transform', label: 'Transform' },
    ],
  },
  {
    label: 'Integration',
    nodes: [
      { type: 'api',           label: 'API Request'    },
      { type: 'outputDisplay', label: 'Display Output' },
    ],
  },
];

// ── Single draggable node card ────────────────────────────────
const NodeCard = ({ type, label }) => {
  const [hovered, setHovered] = useState(false);
  const { color, icon } = nodeAccent[type] ?? { color: T.blue, icon: '⚙️' };

  const startDrag = (e) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType: type }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('toolbar:addNode', { detail: { nodeType: type } }));
    }
  };

  // hovered is true for both mouse-hover and keyboard-focus (via onFocus/onBlur),
  // so one style object covers all interactive states — no separate focusStyle needed.
  const cardStyle = {
    display:      'flex',
    alignItems:   'center',
    gap:          '10px',
    padding:      '8px 10px',
    borderRadius: T.radiusSm,
    border:       `1px solid ${hovered ? color + '66' : T.border}`,
    borderLeft:   `3px solid ${color}`,
    background:   hovered ? T.bgHover : 'transparent',
    cursor:       'grab',
    outline:      'none',
    userSelect:   'none',
    transition:   'background 0.15s, border-color 0.15s, box-shadow 0.15s',
    boxShadow:    hovered ? `0 0 0 2px ${color}44, 0 0 10px ${color}22` : 'none',
  };

  return (
    <div
      role="button"
      aria-label={`Add ${label} node`}
      tabIndex={0}
      draggable
      onDragStart={startDrag}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={cardStyle}
    >
      <span aria-hidden="true" style={{ fontSize: '14px', flexShrink: 0, lineHeight: 1 }}>
        {icon}
      </span>
      <span style={{
        fontSize:     '12px',
        fontWeight:   500,
        color:        hovered ? T.textPrimary : T.textSecondary,
        whiteSpace:   'nowrap',
        overflow:     'hidden',
        textOverflow: 'ellipsis',
        transition:   'color 0.15s',
      }}>
        {label}
      </span>
    </div>
  );
};

// ── Sidebar ───────────────────────────────────────────────────
export const PipelineToolbar = () => (
  <nav
    aria-label="Node palette"
    style={{
      width:         '200px',
      minWidth:      '200px',
      height:        '100%',
      background:    T.bgSidebar,
      borderRight:   `1px solid ${T.border}`,
      display:       'flex',
      flexDirection: 'column',
      overflowY:     'auto',
      fontFamily:    T.font,
      flexShrink:    0,
    }}
  >
    {/* Branding */}
    <div style={{
      padding:      '16px 14px 12px',
      borderBottom: `1px solid ${T.border}`,
      display:      'flex',
      alignItems:   'center',
      gap:          '8px',
    }}>
      <span aria-hidden="true" style={{ fontSize: '18px' }}>🔗</span>
      <span style={{ fontSize: '13px', fontWeight: 700, color: T.textPrimary, letterSpacing: '0.04em' }}>
        Pipeline Builder
      </span>
    </div>

    {/* Node sections */}
    {SECTIONS.map(({ label, nodes }) => (
      <div key={label} role="group" aria-label={label}>
        <div style={{
          fontSize:      '10px',
          fontWeight:    600,
          color:         T.textMuted,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding:       '14px 14px 6px',
        }}>
          {label}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 8px' }}>
          {nodes.map(n => <NodeCard key={n.type} {...n} />)}
        </div>
      </div>
    ))}

    {/* Hint */}
    <div style={{
      marginTop:  'auto',
      padding:    '12px 14px',
      fontSize:   '10px',
      color:      T.textMuted,
      borderTop:  `1px solid ${T.border}`,
      lineHeight: 1.5,
    }}>
      Drag nodes onto the canvas to build your pipeline.
    </div>
  </nav>
);
