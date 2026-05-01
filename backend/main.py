from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
import networkx as nx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Pipeline(BaseModel):
    nodes: list[Any] = []
    edges: list[Any] = []

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

@app.post('/pipelines/parse')
def parse_pipeline(pipeline: Pipeline):
    try:
        nodes, edges = pipeline.nodes, pipeline.edges
        G = nx.DiGraph()
        G.add_nodes_from([n['id'] for n in nodes])
        G.add_edges_from([(e['source'], e['target']) for e in edges])
        return {
            'num_nodes': len(nodes),
            'num_edges': len(edges),
            'is_dag':    nx.is_directed_acyclic_graph(G),
        }
    except (KeyError, TypeError) as e:
        raise HTTPException(status_code=400, detail=f"Malformed pipeline data: {e}")
