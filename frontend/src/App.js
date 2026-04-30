// App.js
import { PipelineToolbar } from './toolbar';
import { PipelineUI }      from './ui';
import { SubmitButton }    from './submit';
import { T }               from './theme';

function App() {
  return (
    <div style={{
      display:    'flex',
      height:     '100vh',
      width:      '100vw',
      background: T.bgApp,
      fontFamily: T.font,
      overflow:   'hidden',
    }}>
      {/* Left sidebar */}
      <PipelineToolbar />

      {/* Main area: canvas + submit bar */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <PipelineUI />
        </div>
        <SubmitButton />
      </div>
    </div>
  );
}

export default App;
