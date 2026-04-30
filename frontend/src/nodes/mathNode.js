// mathNode.js
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { nodeAccent, inputStyle, labelStyle, T } from '../theme';

const { color, icon } = nodeAccent.math;

const HANDLES = (id) => [
  { type: 'target', position: Position.Left,  id: `${id}-a`,      label: 'a',      style: { top: '33%' } },
  { type: 'target', position: Position.Left,  id: `${id}-b`,      label: 'b',      style: { top: '66%' } },
  { type: 'source', position: Position.Right, id: `${id}-result`,  label: 'result' },
];

const OPS = ['+', '-', '×', '÷', '%'];

export const MathNode = ({ id, data }) => {
  const [op, setOp] = useState(data?.op || '+');

  return (
    <BaseNode title="Math" icon={icon} accentColor={color} handles={HANDLES(id)}>
      <span style={{ fontSize: '10px', color: T.textMuted }}>a (top) · b (bottom)</span>
      <label style={labelStyle}>
        Operation
        <select value={op} onChange={e => setOp(e.target.value)} style={inputStyle}>
          {OPS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    </BaseNode>
  );
};
