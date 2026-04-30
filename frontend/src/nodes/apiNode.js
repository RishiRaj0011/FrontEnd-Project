// apiNode.js
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { nodeAccent, inputStyle, labelStyle, T } from '../theme';

const { color, icon } = nodeAccent.api;

const HANDLES = (id) => [
  { type: 'target', position: Position.Left,  id: `${id}-body`,     label: 'body' },
  { type: 'source', position: Position.Right, id: `${id}-response`, label: 'response', style: { top: '33%' } },
  { type: 'source', position: Position.Right, id: `${id}-error`,    label: 'error',    style: { top: '66%' } },
];

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

// Method badge colors
const METHOD_COLOR = { GET: T.green, POST: T.blue, PUT: T.yellow, PATCH: T.orange, DELETE: T.red };

export const APINode = ({ id, data }) => {
  const [method, setMethod] = useState(data?.method || 'GET');
  const [url,    setUrl]    = useState(data?.url    || 'https://');

  const methodBadgeStyle = {
    ...inputStyle,
    color:      METHOD_COLOR[method] ?? T.textPrimary,
    fontWeight: 600,
  };

  return (
    <BaseNode title="API Request" icon={icon} accentColor={color} handles={HANDLES(id)}>
      <label style={labelStyle}>
        Method
        <select value={method} onChange={e => setMethod(e.target.value)} style={methodBadgeStyle}>
          {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </label>
      <label style={labelStyle}>
        URL
        <input
          type="text"
          value={url}
          onChange={e => setUrl(e.target.value)}
          style={inputStyle}
          placeholder="https://api.example.com/endpoint"
        />
      </label>
    </BaseNode>
  );
};
