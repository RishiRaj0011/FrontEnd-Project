// textNode.js
import { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { T, nodeAccent } from '../theme';

const { color: accentColor, icon } = nodeAccent.text;

// ── Helpers ───────────────────────────────────────────────────

// Extract unique, valid {{variable}} names from text.
// Rules: \w+ match, no leading digit, deduplicated.
const parseVariables = (text) => {
  const seen = new Set();
  const re   = /\{\{(\w+)\}\}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    if (!seen.has(name) && !/^\d/.test(name)) seen.add(name);
  }
  return [...seen];
};

// Grow width with longest line (200–500px), height with line count (min 80px).
const calcSize = (text) => {
  const lines = text.split('\n');
  const longest = Math.max(...lines.map(l => l.length), 0);
  return {
    width:  Math.max(200, Math.min(500, longest * 8 + 60)),
    height: Math.max(80,  lines.length * 24 + 60),
  };
};

// Render text with {{var}} tokens highlighted in accent yellow.
const HighlightedText = ({ text, color }) => {
  const parts = text.split(/(\{\{\w+\}\})/g);
  return (
    <span style={{ fontFamily: T.font, fontSize: '12px', color: T.textSecondary, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
      {parts.map((part, i) =>
        /^\{\{\w+\}\}$/.test(part)
          ? <span key={i} style={{ color, fontWeight: 600, background: `${color}22`, borderRadius: '3px', padding: '0 2px' }}>{part}</span>
          : <span key={i}>{part}</span>
      )}
    </span>
  );
};

// ── Component ─────────────────────────────────────────────────
export const TextNode = ({ id, data }) => {
  const [text,     setText]     = useState(data?.text || '{{input}}');
  const [nodeSize, setNodeSize] = useState(() => calcSize(data?.text || '{{input}}'));
  const [focused,  setFocused]  = useState(false);

  const variables = parseVariables(text);

  useEffect(() => { setNodeSize(calcSize(text)); }, [text]);

  const handleStyle = {
    background:   accentColor,
    border:       '2px solid #fff',
    width:        '12px',
    height:       '12px',
    borderRadius: '50%',
    flexShrink:   0,
  };

  // Dynamic variable handles rendered OUTSIDE BaseNode so we can position
  // them absolutely relative to the node wrapper. BaseNode exposes its
  // outer div via overflow:visible, so handles placed here still connect.
  const varHandles = variables.map((varName, i) => {
    const topPct = variables.length === 1
      ? 50
      : 20 + (i / (variables.length - 1)) * 60;
    const label = varName.length > 15 ? varName.slice(0, 15) + '…' : varName;

    return (
      // Wrapper sits at the left edge; label floats to the LEFT of the node
      // with a pill background so it never overlaps the border.
      <div
        key={varName}
        style={{
          position:  'absolute',
          left:      0,
          top:       `${topPct}%`,
          transform: 'translate(-100%, -50%)',
          display:   'flex',
          alignItems:'center',
          gap:       '4px',
          pointerEvents: 'none',   // label itself is non-interactive
        }}
      >
        {/* Label pill — sits to the left, never overlaps node border */}
        <span style={{
          fontSize:     '9px',
          color:        accentColor,
          background:   `${accentColor}22`,
          border:       `1px solid ${accentColor}44`,
          borderRadius: '3px',
          padding:      '1px 4px',
          whiteSpace:   'nowrap',
          pointerEvents:'none',
        }}>
          {label}
        </span>

        {/* The actual React Flow handle — pointer-events re-enabled */}
        <Handle
          type="target"
          position={Position.Left}
          id={varName}
          style={{ ...handleStyle, position: 'relative', transform: 'none', left: 'auto', top: 'auto', pointerEvents: 'all' }}
        />
      </div>
    );
  });

  return (
    // Outer wrapper carries the dynamic width and positions variable handles
    <div style={{ position: 'relative', width: nodeSize.width }}>
      {varHandles}

      <BaseNode
        title="Text"
        icon={icon}
        accentColor={accentColor}
        handles={[
          // Only the static output handle goes through BaseNode
          { type: 'source', position: Position.Right, id: `${id}-output`, label: 'output' },
        ]}
      >
        {/* Preview overlay — shown when textarea is NOT focused */}
        {!focused && (
          <div
            onClick={() => setFocused(true)}
            style={{
              background:   T.bgInput,
              border:       `1px solid ${T.border}`,
              borderRadius: T.radiusSm,
              padding:      '4px 8px',
              minHeight:    Math.max(40, nodeSize.height - 60),
              cursor:       'text',
              lineHeight:   1.5,
            }}
          >
            <HighlightedText text={text} color={accentColor} />
          </div>
        )}

        {/* Textarea — shown when focused */}
        {focused && (
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            onBlur={() => setFocused(false)}
            placeholder="{{variable}}"
            style={{
              background:   T.bgInput,
              border:       `1px solid ${accentColor}88`,
              borderRadius: T.radiusSm,
              color:        T.textPrimary,
              fontSize:     '12px',
              padding:      '4px 8px',
              width:        '100%',
              height:       Math.max(40, nodeSize.height - 60),
              outline:      'none',
              fontFamily:   T.font,
              resize:       'none',
              boxSizing:    'border-box',
            }}
          />
        )}
      </BaseNode>
    </div>
  );
};
