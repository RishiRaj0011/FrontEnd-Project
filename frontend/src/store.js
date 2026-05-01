// store.js
import { create } from 'zustand';
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';

// Max snapshots kept in undo history
const MAX_HISTORY = 30;

export const useStore = create((set, get) => ({
  nodes:   [],
  edges:   [],
  nodeIDs: {},          // ← explicitly initialised so spread never hits undefined

  // ── Undo / Redo ──────────────────────────────────────────────
  // Each entry is { nodes, edges }. past[last] = most recent snapshot.
  past:   [],
  future: [],

  // Call before any mutation that should be undoable
  _snapshot: () => {
    const { nodes, edges, past } = get();
    const next = [...past, { nodes, edges }];
    set({ past: next.slice(-MAX_HISTORY), future: [] });
  },

  undo: () => {
    const { past, nodes, edges, future } = get();
    if (!past.length) return;
    const prev    = past[past.length - 1];
    const newPast = past.slice(0, -1);
    set({ nodes: prev.nodes, edges: prev.edges, past: newPast, future: [{ nodes, edges }, ...future] });
  },

  redo: () => {
    const { future, nodes, edges, past } = get();
    if (!future.length) return;
    const next      = future[0];
    const newFuture = future.slice(1);
    set({ nodes: next.nodes, edges: next.edges, future: newFuture, past: [...past, { nodes, edges }] });
  },

  // ── Node ID generator ────────────────────────────────────────
  getNodeID: (type) => {
    const newIDs = { ...get().nodeIDs };
    newIDs[type] = (newIDs[type] ?? 0) + 1;
    set({ nodeIDs: newIDs });
    return `${type}-${newIDs[type]}`;
  },

  // ── Canvas mutations ─────────────────────────────────────────
  addNode: (node) => {
    get()._snapshot();
    set({ nodes: [...get().nodes, node] });
  },

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    get()._snapshot();
    // Rule: each target handle accepts only ONE incoming edge
    const filtered = get().edges.filter(
      e => !(e.target === connection.target && e.targetHandle === connection.targetHandle)
    );
    set({
      edges: addEdge(
        { ...connection, type: 'smoothstep', animated: true, markerEnd: { type: MarkerType.Arrow, height: '20px', width: '20px' } },
        filtered
      ),
    });
  },

  // ── Delete helpers ──────────────────────────────────────────
  // Delete a single node by id + all its connected edges
  deleteNode: (nodeId) => {
    get()._snapshot();
    set({
      nodes: get().nodes.filter(n => n.id !== nodeId),
      edges: get().edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    });
  },

  // Delete a single edge by id
  deleteEdge: (edgeId) => {
    get()._snapshot();
    set({ edges: get().edges.filter(e => e.id !== edgeId) });
  },

  // Delete all currently-selected nodes + edges (used by Delete/Backspace key)
  deleteSelected: () => {
    const { nodes, edges } = get();
    const selectedNodeIds = new Set(nodes.filter(n => n.selected).map(n => n.id));
    if (!selectedNodeIds.size && !edges.some(e => e.selected)) return;
    get()._snapshot();
    set({
      nodes: nodes.filter(n => !n.selected),
      edges: edges.filter(
        e => !e.selected && !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target)
      ),
    });
  },

  // ── Immutable field update (fixes direct-mutation bug) ───────
  updateNodeField: (nodeId, fieldName, fieldValue) => {
    set({
      nodes: get().nodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
          : node
      ),
    });
  },
}));
