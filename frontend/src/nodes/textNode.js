// textNode.js
import { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { T, nodeAccent } from '../theme';

const { color: accentColor, icon } = nodeAccent.text;

// ── Helpers ───────────────────────────────────────────────────

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

const calcSize = (text) => {
  const lines   = text.split('\n');
  const longest = Math.max(...lines.map(l => l.length), 0);
  return {
    width:  Math.max(200, Math.min(500, longest * 8 + 60)),
    height: Math.max(80,  lines.length * 24 + 60),
  };
};

// Highlight {{var}} tokens in accent colour inside the preview.
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

  // Variable handles: positioned inside BaseNode's container (which has position:relative).
  // Label pill sits to the LEFT of the handle via flex row-reverse, never on the border.
  const varHandles = variables.map((varName, i) => {
    const topPct = variables.length === 1
      ? 50
      : 20 + (i / (variables.length - 1)) * 60;
    const label = varName.length > 15 ? varName.slice(0, 15) + '…' : varName;

    return (
      <div
        key={varName}
        style={{
          position:      'absolute',
          left:          '-8px',
          top:           `${topPct}%`,
          transform:     'translateY(-50%)',
          display:       'flex',
          alignItems:    'center',
          flexDirection: 'row-reverse',
          gap:           '4px',
          pointerEvents: 'none',
          zIndex:        10,
        }}
      >
        <span style={{
          fontSize:      '9px',
          color:         accentColor,
          background:    `${accentColor}22`,
          border:        `1px solid ${accentColor}44`,
          borderRadius:  '3px',
          padding:       '1px 4px',
          whiteSpace:    'nowrap',
          pointerEvents: 'none',
          marginRight:   '2px',
        }}>
          {label}
        </span>
        <Handle
          type="target"
          position={Position.Left}
          id={varName}
          style={{
            ...handleStyle,
            position:      'relative',
            transform:     'none',
            left:          'auto',
            top:           'auto',
            pointerEvents: 'all',
          }}
        />
      </div>
    );
  });

  return (
    // BaseNode IS the root — no extra wrapper div.
    // style prop overrides minWidth so the node grows dynamically.
    // extraHandles renders variable handles inside BaseNode's container,
    // so hover glow (onMouseEnter on BaseNode's div) works correctly.
    <BaseNode
      title="Text"
      icon={icon}
      accentColor={accentColor}
      style={{ width: nodeSize.width, minWidth: nodeSize.width }}
      handles={[
        { type: 'source', position: Position.Right, id: `${id}-output`, label: 'output' },
      ]}
      extraHandles={varHandles}
    >
      {/* Preview — click to edit */}
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

      {/* Textarea — active while focused */}
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
  );
};
