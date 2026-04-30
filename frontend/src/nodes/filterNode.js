// filterNode.js
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { nodeAccent, inputStyle, labelStyle } from '../theme';

const { color, icon } = nodeAccent.filter;

const HANDLES = (id) => [
  { type: 'target', position: Position.Left,  id: `${id}-in`,   label: 'in' },
  { type: 'source', position: Position.Right, id: `${id}-pass`, label: 'pass', style: { top: '33%' } },
  { type: 'source', position: Position.Right, id: `${id}-fail`, label: 'fail', style: { top: '66%' } },
];

const OPS = ['==', '!=', '>', '<', 'contains'];

export const FilterNode = ({ id, data }) => {
  const [field, setField] = useState(data?.field || '');
  const [op,    setOp]    = useState(data?.op    || '==');
  const [value, setValue] = useState(data?.value || '');

  return (
    <BaseNode title="Filter" icon={icon} accentColor={color} handles={HANDLES(id)}>
      <label style={labelStyle}>
        Field
        <input
          type="text"
          value={field}
          onChange={e => setField(e.target.value)}
          style={inputStyle}
          placeholder="e.g. status"
        />
      </label>
      <label style={labelStyle}>
        Operator
        <select value={op} onChange={e => setOp(e.target.value)} style={inputStyle}>
          {OPS.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
      <label style={labelStyle}>
        Value
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          style={inputStyle}
          placeholder="e.g. active"
        />
      </label>
    </BaseNode>
  );
};
