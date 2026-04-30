// transformNode.js
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { nodeAccent, inputStyle, labelStyle } from '../theme';

const { color, icon } = nodeAccent.transform;

const HANDLES = (id) => [
  { type: 'target', position: Position.Left,  id: `${id}-in`,  label: 'in' },
  { type: 'source', position: Position.Right, id: `${id}-out`, label: 'out' },
];

const TRANSFORMS = [
  'Uppercase', 'Lowercase', 'Trim',
  'JSON Parse', 'JSON Stringify',
  'Base64 Encode', 'Base64 Decode',
];

export const TransformNode = ({ id, data }) => {
  const [transform, setTransform] = useState(data?.transform || 'Uppercase');

  return (
    <BaseNode title="Transform" icon={icon} accentColor={color} handles={HANDLES(id)}>
      <label style={labelStyle}>
        Operation
        <select value={transform} onChange={e => setTransform(e.target.value)} style={inputStyle}>
          {TRANSFORMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>
    </BaseNode>
  );
};
