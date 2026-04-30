// ui.js
import { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  Controls, Background, MiniMap,
  BackgroundVariant, MarkerType,
} from 'reactflow';
import { useStore } from './store';
import { T } from './theme';

import { InputNode }         from './nodes/inputNode';
import { LLMNode }           from './nodes/llmNode';
import { OutputNode }        from './nodes/outputNode';
import { TextNode }          from './nodes/textNode';
import { MathNode }          from './nodes/mathNode';
import { APINode }           from './nodes/apiNode';
import { FilterNode }        from './nodes/filterNode';
import { TransformNode }     from './nodes/transformNode';
import { OutputDisplayNode } from './nodes/outputDisplayNode';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };

const nodeTypes = {
  customInput:   InputNode,
  llm:           LLMNode,
  customOutput:  OutputNode,
  text:          TextNode,
  math:          MathNode,
  api:           APINode,
  filter:        FilterNode,
  transform:     TransformNode,
  outputDisplay: OutputDisplayNode,
};

const defaultEdgeOptions = {
  type:      'smoothstep',
  animated:  true,
  style:     { stroke: T.edgeColor, strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: T.edgeColor, width: 16, height: 16 },
};

// ── Empty-canvas hint overlay ─────────────────────────────────
const EmptyState = () => (
  <div style={{
    position:       'absolute',
    inset:          0,
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    pointerEvents:  'none',
    zIndex:         1,
    gap:            '12px',
  }}>
    <span style={{ fontSize: '40px', opacity: 0.25 }}>🔗</span>
    <p style={{
      fontSize:   '14px',
      color:      T.textMuted,
      fontFamily: T.font,
      fontWeight: 500,
      textAlign:  'center',
      maxWidth:   '260px',
      lineHeight: 1.6,
    }}>
      Drag nodes from the left panel<br />to get started
    </p>
  </div>
);

export const PipelineUI = () => {
  const reactFlowWrapper = useRef(null);

  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const nodes         = useStore((state) => state.nodes);
  const edges         = useStore((state) => state.edges);
  const getNodeID     = useStore((state) => state.getNodeID);
  const addNode       = useStore((state) => state.addNode);
  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const onConnect     = useStore((state) => state.onConnect);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const raw = event?.dataTransfer?.getData('application/reactflow');
    if (!raw) return;

    const { nodeType: type } = JSON.parse(raw);
    if (!type || !reactFlowInstance) return;

    const position = reactFlowInstance.project({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });

    const nodeID = getNodeID(type);
    addNode({ id: nodeID, type, position, data: { id: nodeID, nodeType: type } });
  }, [reactFlowInstance, getNodeID, addNode]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const type = e.detail?.nodeType;
      if (!type || !reactFlowInstance) return;

      const bounds   = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: bounds.width  / 2,
        y: bounds.height / 2,
      });

      const nodeID = getNodeID(type);
      addNode({ id: nodeID, type, position, data: { id: nodeID, nodeType: type } });
    };

    window.addEventListener('toolbar:addNode', handler);
    return () => window.removeEventListener('toolbar:addNode', handler);
  }, [reactFlowInstance, getNodeID, addNode]);

  return (
    <div
      ref={reactFlowWrapper}
      style={{ flex: 1, height: '100%', position: 'relative', background: T.bgApp }}
    >
      {nodes.length === 0 && <EmptyState />}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        snapToGrid
        connectionLineType="smoothstep"
        connectionLineStyle={{ stroke: T.edgeColor, strokeWidth: 2 }}
        style={{ background: T.bgApp }}
        isValidConnection={(connection) => {
          if (connection.source === connection.target) return false;
          const duplicate = edges.some(
            e => e.source === connection.source &&
                 e.target === connection.target &&
                 e.sourceHandle === connection.sourceHandle &&
                 e.targetHandle === connection.targetHandle
          );
          return !duplicate;
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={gridSize}
          size={1}
          color="#2A2A40"
        />
        <Controls />
        <MiniMap
          nodeColor={() => '#2A2A40'}
          maskColor="rgba(15,15,15,0.75)"
          style={{ background: '#111118' }}
        />
      </ReactFlow>
    </div>
  );
};
