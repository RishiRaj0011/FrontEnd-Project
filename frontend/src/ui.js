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

const gridSize   = 20;
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

// ── Empty-canvas hint ─────────────────────────────────────────
const EmptyState = () => (
  <div style={{
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    pointerEvents: 'none', zIndex: 1, gap: '12px',
  }}>
    <span style={{ fontSize: '40px', opacity: 0.25 }}>🔗</span>
    <p style={{ fontSize: '14px', color: T.textMuted, fontFamily: T.font, fontWeight: 500, textAlign: 'center', maxWidth: '260px', lineHeight: 1.6 }}>
      Drag nodes from the left panel<br />to get started
    </p>
  </div>
);

// ── Context Menu ──────────────────────────────────────────────
// Used for both node right-click and edge right-click.
const ContextMenu = ({ x, y, items, onClose }) => {
  // Close when clicking outside
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [onClose]);

  return (
    <div
      style={{
        position:     'fixed',
        top:          y,
        left:         x,
        zIndex:       2000,
        background:   T.bgNode,
        border:       `1px solid ${T.border}`,
        borderRadius: T.radiusSm,
        boxShadow:    T.shadow,
        fontFamily:   T.font,
        minWidth:     '150px',
        overflow:     'hidden',
      }}
      // Stop the window click from immediately closing the menu
      onClick={e => e.stopPropagation()}
    >
      {items.map(({ label, color, onClick: action }) => (
        <button
          key={label}
          onClick={() => { action(); onClose(); }}
          style={{
            display:    'block',
            width:      '100%',
            padding:    '9px 14px',
            background: 'none',
            border:     'none',
            borderBottom: `1px solid ${T.border}`,
            color:      color ?? T.textPrimary,
            fontSize:   '12px',
            fontFamily: T.font,
            textAlign:  'left',
            cursor:     'pointer',
          }}
          onMouseEnter={e => e.currentTarget.style.background = T.bgHover}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

// ── Undo button overlay (top-left of canvas) ──────────────────
const UndoRedoBar = ({ onUndo, onRedo, canUndo, canRedo }) => {
  const btn = (label, action, enabled) => (
    <button
      onClick={action}
      disabled={!enabled}
      title={label}
      style={{
        background:   enabled ? T.bgNode : 'transparent',
        border:       `1px solid ${enabled ? T.border : T.border + '55'}`,
        borderRadius: T.radiusSm,
        color:        enabled ? T.textPrimary : T.textMuted,
        fontSize:     '11px',
        fontFamily:   T.font,
        fontWeight:   600,
        padding:      '5px 10px',
        cursor:       enabled ? 'pointer' : 'not-allowed',
        transition:   'background 0.15s, color 0.15s',
      }}
      onMouseEnter={e => { if (enabled) e.currentTarget.style.background = T.bgHover; }}
      onMouseLeave={e => { if (enabled) e.currentTarget.style.background = T.bgNode; }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      position:   'absolute',
      top:        '12px',
      left:       '12px',
      zIndex:     10,
      display:    'flex',
      gap:        '6px',
      pointerEvents: 'all',
    }}>
      {btn('↩ Undo', onUndo, canUndo)}
      {btn('↪ Redo', onRedo, canRedo)}
    </div>
  );
};

// ── Main canvas ───────────────────────────────────────────────
export const PipelineUI = () => {
  const reactFlowWrapper  = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Context menu state: { x, y, items[] } | null
  const [ctxMenu, setCtxMenu] = useState(null);

  const nodes         = useStore(s => s.nodes);
  const edges         = useStore(s => s.edges);
  const past          = useStore(s => s.past);
  const future        = useStore(s => s.future);
  const getNodeID     = useStore(s => s.getNodeID);
  const addNode       = useStore(s => s.addNode);
  const onNodesChange = useStore(s => s.onNodesChange);
  const onEdgesChange = useStore(s => s.onEdgesChange);
  const onConnect     = useStore(s => s.onConnect);
  const undo          = useStore(s => s.undo);
  const redo          = useStore(s => s.redo);
  const deleteNode    = useStore(s => s.deleteNode);
  const deleteEdge    = useStore(s => s.deleteEdge);
  const deleteSelected = useStore(s => s.deleteSelected);

  // ── Drop from sidebar ───────────────────────────────────────
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

  // ── Template / keyboard-add from toolbar ────────────────────
  useEffect(() => {
    const handler = (e) => {
      const { nodeType: type, x, y } = e.detail ?? {};
      if (!type || !reactFlowInstance) return;

      let position;
      if (x !== undefined && y !== undefined) {
        // Template: use the exact canvas coordinates provided
        position = { x, y };
      } else {
        // Single node add: place at canvas centre
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        position = reactFlowInstance.project({
          x: bounds.width  / 2,
          y: bounds.height / 2,
        });
      }

      const nodeID = getNodeID(type);
      addNode({ id: nodeID, type, position, data: { id: nodeID, nodeType: type } });
    };

    window.addEventListener('toolbar:addNode', handler);
    return () => window.removeEventListener('toolbar:addNode', handler);
  }, [reactFlowInstance, getNodeID, addNode]);

  // ── Keyboard shortcuts ───────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      // Don't fire when user is typing inside an input / textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault(); redo();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, deleteSelected]);

  // ── React Flow native delete callbacks ───────────────────────
  // These fire when React Flow itself removes nodes/edges (e.g. via its
  // own Delete key handling or programmatic removal).
  const onNodesDelete = useCallback((deleted) => {
    deleted.forEach(n => deleteNode(n.id));
  }, [deleteNode]);

  const onEdgesDelete = useCallback((deleted) => {
    deleted.forEach(e => deleteEdge(e.id));
  }, [deleteEdge]);

  // ── Right-click context menus ────────────────────────────────
  const onNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setCtxMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        {
          label: '🗑  Delete Node',
          color: T.red,
          onClick: () => deleteNode(node.id),
        },
      ],
    });
  }, [deleteNode]);

  const onEdgeContextMenu = useCallback((event, edge) => {
    event.preventDefault();
    setCtxMenu({
      x: event.clientX,
      y: event.clientY,
      items: [
        {
          label: '✂  Delete Connection',
          color: T.red,
          onClick: () => deleteEdge(edge.id),
        },
      ],
    });
  }, [deleteEdge]);

  // Close context menu on canvas click
  const onPaneClick = useCallback(() => setCtxMenu(null), []);

  return (
    <div
      ref={reactFlowWrapper}
      style={{ flex: 1, height: '100%', position: 'relative', background: T.bgApp }}
    >
      {nodes.length === 0 && <EmptyState />}

      <UndoRedoBar
        onUndo={undo}
        onRedo={redo}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
      />

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={ctxMenu.items}
          onClose={() => setCtxMenu(null)}
        />
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setReactFlowInstance}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        snapToGrid
        multiSelectionKeyCode="Shift"
        deleteKeyCode={null}          // we handle Delete ourselves to go through our undo stack
        connectionLineType="smoothstep"
        connectionLineStyle={{ stroke: T.edgeColor, strokeWidth: 2 }}
        style={{ background: T.bgApp }}
        isValidConnection={(connection) => {
          if (connection.source === connection.target) return false;
          return !edges.some(
            e => e.source === connection.source &&
                 e.target === connection.target &&
                 e.sourceHandle === connection.sourceHandle &&
                 e.targetHandle === connection.targetHandle
          );
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={gridSize} size={1} color="#2A2A40" />
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
