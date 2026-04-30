// ErrorBoundary.js
// Class component — catches render errors thrown by any child node.
// Shows a styled "Node Error" fallback with a click-to-reset action.

import { Component } from 'react';
import { T } from '../theme';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? 'Unknown error' };
  }

  componentDidCatch(error, info) {
    // Surface to console so devtools still show the full trace
    console.error('[ErrorBoundary] Node render error:', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        onClick={this.reset}
        style={{
          minWidth:     '220px',
          background:   '#1A0A0A',
          border:       `1px solid ${T.red}`,
          borderLeft:   `4px solid ${T.red}`,
          borderRadius: T.radius,
          padding:      '10px 14px',
          cursor:       'pointer',
          fontFamily:   T.font,
          boxShadow:    `0 0 16px ${T.red}33`,
          userSelect:   'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '14px' }}>⚠️</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: T.red }}>Node Error</span>
        </div>
        <p style={{ fontSize: '11px', color: T.textSecondary, margin: 0, lineHeight: 1.5 }}>
          {this.state.message}
        </p>
        <p style={{ fontSize: '10px', color: T.textMuted, margin: '6px 0 0', letterSpacing: '0.02em' }}>
          Click to reset
        </p>
      </div>
    );
  }
}
