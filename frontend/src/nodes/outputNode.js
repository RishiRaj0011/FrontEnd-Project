// outputNode.js
import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { nodeAccent, inputStyle, labelStyle } from '../theme';

const { color, icon } = nodeAccent.customOutput;

const HANDLES = (id) => [
  { type: 'target', position: Position.Left, id: `${id}-value`, label: 'value' },
];

export const OutputNode = ({ id, data }) => {
  const [currName,   setCurrName]   = useState(data?.outputName || id.replace('customOutput-', 'output_'));
  const [outputType, setOutputType] = useState(data?.outputType || 'Text');

  return (
    <BaseNode title="Output" icon={icon} accentColor={color} handles={HANDLES(id)}>
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
        <select value={outputType} onChange={e => setOutputType(e.target.value)} style={inputStyle}>
          <option value="Text">Text</option>
          <option value="Image">Image</option>
        </select>
      </label>
    </BaseNode>
  );
};
