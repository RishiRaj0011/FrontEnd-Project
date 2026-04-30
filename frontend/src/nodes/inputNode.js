// inputNode.js
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { nodeAccent, inputStyle, labelStyle } from '../theme';

const { color, icon } = nodeAccent.customInput;

const HANDLES = (id) => [
  { type: 'source', position: Position.Right, id: `${id}-value`, label: 'value' },
];

export const InputNode = ({ id, data }) => {
  const [currName,  setCurrName]  = useState(data?.inputName || id.replace('customInput-', 'input_'));
  const [inputType, setInputType] = useState(data?.inputType || 'Text');

  return (
    <BaseNode title="Input" icon={icon} accentColor={color} handles={HANDLES(id)}>
      <label style={labelStyle}>
        Name
        <input
          type="text"
          value={currName}
          onChange={e => setCurrName(e.target.value)}
          style={inputStyle}
        />
      </label>
      <label style={labelStyle}>
        Type
        <select value={inputType} onChange={e => setInputType(e.target.value)} style={inputStyle}>
          <option value="Text">Text</option>
          <option value="File">File</option>
        </select>
      </label>
    </BaseNode>
  );
};
