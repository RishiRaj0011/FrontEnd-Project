// llmNode.js
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { nodeAccent, T } from '../theme';

const { color, icon } = nodeAccent.llm;

const HANDLES = (id) => [
  { type: 'target', position: Position.Left,  id: `${id}-system`,   label: 'system',   style: { top: '33%' } },
  { type: 'target', position: Position.Left,  id: `${id}-prompt`,   label: 'prompt',   style: { top: '66%' } },
  { type: 'source', position: Position.Right, id: `${id}-response`, label: 'response' },
];

const rowStyle = {
  display:        'flex',
  justifyContent: 'space-between',
  alignItems:     'center',
  fontSize:       '11px',
  color:          T.textSecondary,
};

const badgeStyle = (c) => ({
  background:   `${c}22`,
  border:       `1px solid ${c}55`,
  borderRadius: '4px',
  color:        c,
  fontSize:     '10px',
  padding:      '2px 6px',
  fontWeight:   600,
});

export const LLMNode = ({ id }) => (
  <BaseNode title="LLM" icon={icon} accentColor={color} handles={HANDLES(id)}>
    <div style={rowStyle}>
      <span>system</span>
      <span style={badgeStyle(color)}>target</span>
    </div>
    <div style={rowStyle}>
      <span>prompt</span>
      <span style={badgeStyle(color)}>target</span>
    </div>
    <div style={rowStyle}>
      <span>response</span>
      <span style={badgeStyle(color)}>source</span>
    </div>
  </BaseNode>
);
