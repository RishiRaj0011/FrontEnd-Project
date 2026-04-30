// outputDisplayNode.js
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { nodeAccent, inputStyle, labelStyle } from '../theme';

const { color, icon } = nodeAccent.outputDisplay;

const HANDLES = (id) => [
  { type: 'target', position: Position.Left, id: `${id}-in`, label: 'in' },
];

const FORMATS = ['Plain Text', 'JSON', 'Markdown', 'Table'];

export const OutputDisplayNode = ({ id, data }) => {
  const [format, setFormat] = useState(data?.format || 'Plain Text');
  const [label,  setLabel]  = useState(data?.label  || 'Result');

  return (
    <BaseNode title="Display Output" icon={icon} accentColor={color} handles={HANDLES(id)}>
      <label style={labelStyle}>
        Label
        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          style={inputStyle}
          placeholder="Result label"
        />
      </label>
      <label style={labelStyle}>
        Format
        <select value={format} onChange={e => setFormat(e.target.value)} style={inputStyle}>
          {FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </label>
    </BaseNode>
  );
};
