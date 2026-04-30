// textNode.js
import { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { T, nodeAccent } from '../theme';

const { color: accentColor, icon } = nodeAccent.text;

const parseVariables = (text) => {
  const matches = [];
  const seen = new Set();
  const re = /\{\{(\w+)\}\}/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    // ignore names that start with a digit
    if (!seen.has(name) && !/^\d/.test(name)) {
      seen.add(name);
      matches.push(name);
    }
  }
  return matches;
};

const calcSize = (text) => {
  const lines = text.split('\n');
  const longestLine = Math.max(...lines.map(l => l.length), 0);
  return {
    width:  Math.max(200, Math.min(500, longestLine * 8 + 60)),
    height: Math.max(80,  lines.length * 24 + 60),
  };
};

export const TextNode = ({ id, data }) => {
  const [text, setText]         = useState(data?.text || '{{input}}');
  const [nodeSize, setNodeSize] = useState(() => calcSize(data?.text || '{{input}}'));
  const variables               = parseVariables(text);

  useEffect(() => {
    setNodeSize(calcSize(text));
  }, [text]);

  const handleStyle = {
    background:   accentColor,
    border:       '2px solid #fff',
    width:        '12px',
    height:       '12px',
    borderRadius: '50%',
  };

  const containerStyle = {
    width:        nodeSize.width,
    background:   T.bgNode,
    border:       `1px solid ${T.border}`,
    borderLeft:   `4px solid ${accentColor}`,
    borderRadius: T.radius,
    boxShadow:    T.shadow,
    fontFamily:   T.font,
    position:     'relative',
    overflow:     'visible',
  };

  const headerStyle = {
    background:   T.bgNodeHeader,
    borderBottom: `1px solid ${T.border}`,
    borderRadius: `${T.radius} ${T.radius} 0 0`,
    padding:      '8px 12px',
    display:      'flex',
    alignItems:   'center',
    gap:          '7px',
    fontSize:     '12px',
    fontWeight:   600,
    color:        T.textPrimary,
  };

  const textareaStyle = {
    background:   T.bgInput,
    border:       `1px solid ${T.border}`,
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
  };

  return (
    <div style={containerStyle}>
      {/* Dynamic target handles for {{variables}} */}
      {variables.map((varName, i) => {
        const topPct = variables.length === 1
          ? 50
          : 20 + (i / (variables.length - 1)) * 60;
        const label = varName.length > 15 ? varName.slice(0, 15) + '…' : varName;
        return (
          <div key={varName} style={{ position: 'absolute', left: 0, top: `${topPct}%`, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
            <Handle
              type="target"
              position={Position.Left}
              id={varName}
              style={{ ...handleStyle, position: 'relative', transform: 'none', left: 'auto', top: 'auto' }}
            />
            <span style={{ fontSize: '9px', color: T.textSecondary, marginLeft: '4px', whiteSpace: 'nowrap' }}>
              {label}
            </span>
          </div>
        );
      })}

      {/* Header */}
      <div style={headerStyle}>
        <span style={{ fontSize: '13px' }}>{icon}</span>
        <span>Text</span>
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px 12px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '11px', color: T.textSecondary, gap: '2px' }}>
          Content
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            style={textareaStyle}
            placeholder="{{variable}}"
          />
        </label>
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        style={{ ...handleStyle, top: '50%' }}
      />
    </div>
  );
};
