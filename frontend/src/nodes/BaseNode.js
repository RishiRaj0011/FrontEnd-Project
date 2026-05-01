// BaseNode.js
import { useState } from 'react';
import PropTypes from 'prop-types';
import { Handle, Position } from 'reactflow';
import { T } from '../theme';
import { ErrorBoundary } from './ErrorBoundary';

export const BaseNode = ({ title, icon = '⚙️', accentColor = T.blue, handles = [], children, style: styleProp, extraHandles }) => {
  const [hovered, setHovered] = useState(false);

  const glowColor = `${accentColor}55`;

  const containerStyle = {
    minWidth:   '220px',
    background: T.bgNode,
    border:     `1px solid ${hovered ? accentColor + '88' : T.border}`,
    borderLeft: `4px solid ${accentColor}`,
    borderRadius: T.radius,
    boxShadow:  hovered
      ? `0 0 0 1px ${accentColor}44, 0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${glowColor}`
      : T.shadow,
    fontFamily: T.font,
    position:   'relative',
    transition: 'box-shadow 0.2s, border-color 0.2s',
    overflow:   'visible',
    // Allow callers (e.g. TextNode) to override width for dynamic sizing
    ...styleProp,
  };

  const headerStyle = {
    background:   T.bgNodeHeader,
    borderBottom: `1px solid ${T.border}`,
    borderRadius: `${T.radius} ${T.radius} 0 0`,
    padding:      '8px 12px',
    display:      'flex',
    alignItems:   'center',
    gap:          '7px',
  };

  const titleStyle = {
    fontSize:     '12px',
    fontWeight:   600,
    color:        T.textPrimary,
    letterSpacing:'0.02em',
    whiteSpace:   'nowrap',
    overflow:     'hidden',
    textOverflow: 'ellipsis',
    maxWidth:     '160px',
  };

  const bodyStyle = {
    padding:       '10px 12px 12px',
    display:       'flex',
    flexDirection: 'column',
    gap:           '8px',
  };

  const handleBaseStyle = (color) => ({
    background:   color,
    border:       '2px solid #fff',
    width:        '12px',
    height:       '12px',
    borderRadius: '50%',
    transition:   'transform 0.15s, box-shadow 0.15s',
  });

  const displayTitle = title.length > 20 ? title.slice(0, 20) + '…' : title;

  return (
    <div
      role="group"
      aria-label={`${title} node`}
      style={containerStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Target handles — left side */}
      {handles.filter(h => h.type === 'target').map(({ id, position, label, style: hs }) => (
        <Handle
          key={id}
          type="target"
          position={position ?? Position.Left}
          id={id}
          title={label ?? id.split('-').pop()}
          aria-label={label ?? id.split('-').pop()}
          style={{ ...handleBaseStyle(accentColor), ...hs }}
        />
      ))}

      {/* Header */}
      <div role="heading" aria-level={3} style={headerStyle}>
        <span aria-hidden="true" style={{ fontSize: '13px', lineHeight: 1, flexShrink: 0 }}>
          {icon}
        </span>
        <span style={titleStyle}>{displayTitle}</span>
      </div>

      {/* Body — wrapped in ErrorBoundary so a bad child never crashes the canvas */}
      <div style={bodyStyle}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>

      {/* Source handles — right side */}
      {handles.filter(h => h.type === 'source').map(({ id, position, label, style: hs }) => (
        <Handle
          key={id}
          type="source"
          position={position ?? Position.Right}
          id={id}
          title={label ?? id.split('-').pop()}
          aria-label={label ?? id.split('-').pop()}
          style={{ ...handleBaseStyle(accentColor), ...hs }}
        />
      ))}

      {/* Extra handles injected by the consumer (e.g. dynamic var handles in TextNode) */}
      {extraHandles}
    </div>
  );
};

BaseNode.propTypes = {
  title: PropTypes.string.isRequired,
  icon:  PropTypes.string,
  accentColor: PropTypes.string,
  handles: PropTypes.arrayOf(PropTypes.shape({
    type:     PropTypes.oneOf(['source', 'target']).isRequired,
    position: PropTypes.string.isRequired,
    id:       PropTypes.string.isRequired,
    label:    PropTypes.string,
    style:    PropTypes.object,
  })).isRequired,
  children:     PropTypes.node,
  style:        PropTypes.object,   // width override for dynamic nodes (e.g. TextNode)
  extraHandles: PropTypes.node,     // additional handles rendered inside the container
};
