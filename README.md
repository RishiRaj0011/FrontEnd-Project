# VectorShift Pipeline Builder — Technical Assessment

A visual, no-code pipeline builder built with React Flow, Zustand, FastAPI, and NetworkX.  
Drag nodes onto the canvas, connect them, and click **Analyze Pipeline** to validate the graph.

---

## Quick Start

**Backend** (Terminal 1)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend** (Terminal 2)
```bash
cd frontend
npm install
npm start
# Opens at http://localhost:3000
```

---

## Architecture Decisions

### 1. BaseNode Composition Pattern
Every node is built on a single `BaseNode` component that owns the dark-theme shell (header, border-left accent, hover glow, ErrorBoundary). Individual nodes pass a `handles[]` array and a `children` body — a new node takes ~15 lines. This eliminates all UI duplication and guarantees visual consistency across all 9 node types.

### 2. Zustand for State
Zustand was chosen over Redux for its minimal boilerplate. The store holds `nodes`, `edges`, and a `past/future` stack for undo/redo (Ctrl+Z / Ctrl+Y). All mutations use immutable spread — no direct state mutation.

### 3. Dynamic TextNode
The Text node parses `{{variable}}` tokens in real time using `/\{\{(\w+)\}\}/g`. Each unique, valid variable name gets its own React Flow `target` Handle on the left side. The node auto-resizes (width 200–500px, height grows with line count). Variables are highlighted inline with a colour overlay so users can see them at a glance without editing.

### 4. Connection Validation (Two Layers)
- **`isValidConnection`** on the ReactFlow component blocks self-loops and duplicate edges at drag time.
- **`onConnect`** in the store removes any existing edge on the same `target + targetHandle` before adding the new one — enforcing the "one input per handle" rule.

### 5. FastAPI + NetworkX DAG Check
The backend accepts `{ nodes, edges }` as JSON, builds a `networkx.DiGraph`, and calls `nx.is_directed_acyclic_graph()` — a standard DFS-based algorithm. CORS is configured for `localhost:3000/3001`. Malformed payloads return a `400` with a descriptive message.

---

## Features

| Feature | Detail |
|---|---|
| 9 node types | Input, Output, LLM, Text, Math, API, Filter, Transform, Display |
| Dynamic handles | Text node creates/removes handles as you type `{{var}}` |
| Variable highlighting | `{{tokens}}` rendered in accent colour with background pill |
| Auto-resize | Text node grows width (200–500px) and height with content |
| Connection rules | No self-loops, no duplicates, one input per handle |
| Undo / Redo | Ctrl+Z / Ctrl+Y, 30-step history |
| Lead Enricher template | One-click starter pipeline in the sidebar |
| DAG analysis modal | Shows node count, edge count, is_dag with green/red feedback |
| Confetti | Fires on `is_dag: true` result |
| Cycle warning | Pulsing red ring + explanation on `is_dag: false` |
| Dark theme | Single `theme.js` token file — every colour, radius, font in one place |
| Keyboard accessible | All toolbar cards support Tab + Enter/Space |

---

## Project Structure

```
frontend_technical_assessment/
├── backend/
│   ├── main.py            # FastAPI app — CORS, /pipelines/parse, DAG check
│   └── requirements.txt
└── frontend/
    └── src/
        ├── nodes/
        │   ├── BaseNode.js        # Shared node shell (composition pattern)
        │   ├── textNode.js        # Dynamic variable handles + auto-resize
        │   ├── inputNode.js
        │   ├── outputNode.js
        │   ├── llmNode.js
        │   ├── mathNode.js
        │   ├── apiNode.js
        │   ├── filterNode.js
        │   ├── transformNode.js
        │   └── outputDisplayNode.js
        ├── store.js       # Zustand store — nodes, edges, undo/redo
        ├── ui.js          # ReactFlow canvas + connection validation
        ├── toolbar.js     # Sidebar — node palette + Lead Enricher template
        ├── submit.js      # Analyze button + result modal + confetti
        ├── theme.js       # Design tokens (single source of truth)
        └── index.css      # ReactFlow dark-theme overrides + handle CSS
```
