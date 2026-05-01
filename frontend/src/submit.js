// submit.js
import { useState } from 'react';
import { useStore } from './store';
import { T } from './theme';

// ── Tiny CSS-only confetti (no library needed) ────────────────
// 12 coloured squares animate outward from centre on mount.
const CONFETTI_COLORS = ['#6366F1','#10B981','#F59E0B','#EC4899','#06B6D4','#F97316'];

const Confetti = () => {
  const pieces = Array.from({ length: 24 }, (_, i) => {
    const color  = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const angle  = (i / 24) * 360;
    const dist   = 80 + Math.random() * 60;
    const dx     = Math.cos((angle * Math.PI) / 180) * dist;
    const dy     = Math.sin((angle * Math.PI) / 180) * dist;
    const size   = 6 + Math.random() * 6;
    const delay  = (i * 0.02).toFixed(2);
    return { color, dx, dy, size, delay };
  });

  return (
    <>
      <style>{`
        @keyframes confettiFly {
          0%   { transform: translate(0,0) rotate(0deg);   opacity: 1; }
          100% { transform: translate(var(--dx),var(--dy)) rotate(360deg); opacity: 0; }
        }
      `}</style>
      <div style={{ position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none', zIndex: 1100 }}>
        {pieces.map((p, i) => (
          <div key={i} style={{
            position:        'absolute',
            width:           p.size,
            height:          p.size,
            background:      p.color,
            borderRadius:    '2px',
            '--dx':          `${p.dx}px`,
            '--dy':          `${p.dy}px`,
            animation:       `confettiFly 0.8s ${p.delay}s ease-out forwards`,
            transformOrigin: 'center',
          }} />
        ))}
      </div>
    </>
  );
};

// ── Spinner ───────────────────────────────────────────────────
const Spinner = () => (
  <span style={{
    display:      'inline-block',
    width:        '14px',
    height:       '14px',
    border:       '2px solid rgba(255,255,255,0.3)',
    borderTop:    '2px solid #fff',
    borderRadius: '50%',
    animation:    'spin 0.7s linear infinite',
    flexShrink:   0,
  }} />
);

// ── Result Modal ──────────────────────────────────────────────
const ResultModal = ({ data, error, onClose }) => {
  const showConfetti = data && data.is_dag;
  const showCycle    = data && !data.is_dag;

  return (
    <>
      <style>{`
        @keyframes spin      { to { transform: rotate(360deg); } }
        @keyframes modalIn   { from { opacity:0; transform:scale(0.92) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes cyclePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); }
          50%     { box-shadow: 0 0 0 6px rgba(239,68,68,0.5); }
        }
      `}</style>

      {showConfetti && <Confetti />}

      {/* Backdrop */}
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(3px)', zIndex:1000 }} />

      {/* Card */}
      <div style={{
        position:     'fixed',
        top:          '50%',
        left:         '50%',
        transform:    'translate(-50%, -50%)',
        zIndex:       1001,
        width:        '340px',
        background:   '#1E1E2E',
        border:       `1px solid ${error ? T.red : showCycle ? T.red : '#6366F1'}`,
        borderRadius: '12px',
        boxShadow:    `0 0 40px ${error || showCycle ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.35)'}, 0 8px 32px rgba(0,0,0,0.6)`,
        fontFamily:   T.font,
        animation:    `modalIn 0.2s ease${showCycle ? ', cyclePulse 1.5s 0.3s ease-in-out 3' : ''}`,
        overflow:     'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding:        '16px 20px',
          borderBottom:   `1px solid ${error || showCycle ? '#3D1515' : '#2A2A40'}`,
          background:     error || showCycle ? '#1A0F0F' : '#13131F',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: T.textPrimary }}>
            {error      ? '⚠️  Connection Error'
             : showCycle ? '🔄  Cycle Detected!'
             :             '📊  Pipeline Analysis Results'}
          </span>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:T.textSecondary, fontSize:'18px', lineHeight:1, padding:'0 2px' }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {error ? (
            <p style={{ fontSize:'13px', color:'#FCA5A5', lineHeight:1.6, margin:0 }}>{error}</p>
          ) : (
            <>
              {showCycle && (
                <div style={{ marginBottom:'12px', padding:'10px 12px', background:'rgba(239,68,68,0.08)', border:`1px solid ${T.red}44`, borderRadius:T.radiusSm, fontSize:'12px', color:'#FCA5A5', lineHeight:1.5 }}>
                  ⚠️ This pipeline has a <strong>cycle</strong> — it cannot be executed. Remove the circular connection to fix it.
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                <StatRow icon="🔷" label="Total Nodes" value={data.num_nodes} accent={T.blue} />
                <StatRow icon="🔗" label="Total Edges" value={data.num_edges} accent={T.purple} />
                <StatRow
                  icon={data.is_dag ? '✅' : '❌'}
                  label="Is DAG"
                  value={data.is_dag ? 'Yes — ready to run!' : 'No — has cycle'}
                  accent={data.is_dag ? T.green : T.red}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'0 20px 16px', display:'flex', justifyContent:'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding:      '8px 20px',
              borderRadius: T.radiusSm,
              border:       `1px solid ${error || showCycle ? T.red : '#6366F1'}`,
              background:   'transparent',
              color:        error || showCycle ? '#FCA5A5' : '#A5B4FC',
              fontSize:     '12px',
              fontWeight:   600,
              fontFamily:   T.font,
              cursor:       'pointer',
              transition:   'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = error || showCycle ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

const StatRow = ({ icon, label, value, accent }) => (
  <div style={{
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    background:     '#13131F',
    border:         `1px solid #2A2A40`,
    borderRadius:   T.radiusSm,
    padding:        '10px 14px',
  }}>
    <span style={{ fontSize:'13px', color:T.textSecondary, display:'flex', alignItems:'center', gap:'8px' }}>
      <span>{icon}</span>{label}
    </span>
    <span style={{ fontSize:'14px', fontWeight:700, color:accent }}>{value}</span>
  </div>
);

// ── Submit Button ─────────────────────────────────────────────
export const SubmitButton = () => {
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [active,  setActive]  = useState(false);
  const [modal,   setModal]   = useState(null);

  const nodes = useStore(s => s.nodes);
  const edges = useStore(s => s.edges);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/pipelines/parse', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nodes, edges }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setModal({ data });
    } catch {
      setModal({ error: 'Could not connect to backend.\nMake sure the server is running on port 8000.' });
    } finally {
      setLoading(false);
    }
  };

  const btnStyle = {
    display:       'flex',
    alignItems:    'center',
    gap:           '8px',
    padding:       '11px 32px',
    borderRadius:  T.radius,
    border:        'none',
    background:    active
      ? 'linear-gradient(135deg, #2563EB, #7C3AED)'
      : hovered
        ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)'
        : 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
    color:         '#fff',
    fontSize:      '13px',
    fontWeight:    600,
    fontFamily:    T.font,
    letterSpacing: '0.03em',
    cursor:        loading ? 'not-allowed' : 'pointer',
    boxShadow:     hovered && !loading ? '0 0 20px rgba(99,102,241,0.45), 0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.4)',
    transform:     hovered && !loading ? 'scale(1.02)' : 'scale(1)',
    transition:    'transform 0.15s, box-shadow 0.15s, background 0.15s',
    opacity:       loading ? 0.75 : 1,
    whiteSpace:    'nowrap',
    position:      'relative',
  };

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {modal && (
        <ResultModal data={modal.data} error={modal.error} onClose={() => setModal(null)} />
      )}

      <div style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '14px 24px',
        background:     T.bgSidebar,
        borderTop:      `1px solid ${T.border}`,
        fontFamily:     T.font,
        gap:            '12px',
      }}>
        {/* Node / edge counter badge */}
        <span style={{ fontSize:'11px', color:T.textMuted }}>
          {nodes.length} node{nodes.length !== 1 ? 's' : ''} · {edges.length} edge{edges.length !== 1 ? 's' : ''}
        </span>

        <button
          style={btnStyle}
          onClick={handleSubmit}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => { setHovered(false); setActive(false); }}
          onMouseDown={() => setActive(true)}
          onMouseUp={() => setActive(false)}
          disabled={loading}
        >
          {loading ? <Spinner /> : <span>▶</span>}
          {loading ? 'Analyzing…' : 'Analyze Pipeline'}
        </button>
      </div>
    </>
  );
};
