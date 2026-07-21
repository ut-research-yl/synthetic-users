import '../components/live-insights/LiveInsights.css'
import { LiveInsightsProvider, useLiveInsights } from '../contexts/LiveInsightsContext'

function LiveInsightsCanvas() {
  const { zoom, panX, panY, selectedElementId, dispatch } = useLiveInsights()

  const vbW = 1600 * (100 / zoom)
  const vbH = 550 * (100 / zoom)
  const viewBox = `${panX} ${panY} ${vbW} ${vbH}`

  function handleElementClick(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    dispatch({ type: 'SELECT_ELEMENT', id: selectedElementId === id ? null : id })
  }

  const elClass = (id: string) =>
    `bpmn-el${selectedElementId === id ? ' selected' : ''}`

  return (
    <div className="canvas-area" id="canvasArea" onClick={() => dispatch({ type: 'SELECT_ELEMENT', id: null })}>
      <svg className="canvas-svg" viewBox={viewBox}>
        <defs>
          <marker id="arrowhead" markerWidth="8.5" markerHeight="14.728" refX="8.17" refY="7.364" orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0.391 0.293C0.781 -0.098 1.414 -0.097 1.805 0.293L8.169 6.657C8.559 7.048 8.559 7.681 8.169 8.071L1.805 14.435C1.414 14.826 0.781 14.826 0.391 14.435C0 14.045 0 13.412 0.391 13.021L5.562 7.85C5.481 7.706 5.435 7.541 5.435 7.364C5.435 7.187 5.481 7.022 5.562 6.878L0.391 1.707C0 1.316 0 0.683 0.391 0.293Z" className="bpmn-arrowhead" />
          </marker>
        </defs>
        <g id="svgLanesLayer" />

        <g id="el-start" className={elClass('el-start')} onClick={e => handleElementClick('el-start', e)}>
          <rect className="selection-box" x="86" y="156" width="38" height="38" />
          <svg x="87" y="157" width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="18" fill="#EBF5CB" />
            <path d="M18 30.375C24.8345 30.375 30.375 24.8345 30.375 18C30.375 11.1655 24.8345 5.625 18 5.625C11.1655 5.625 5.625 11.1655 5.625 18C5.625 24.8345 11.1655 30.375 18 30.375Z" stroke="#256F3A" />
          </svg>
        </g>

        <line id="flow-start-evaluate" x1="130" y1="175" x2="210" y2="175" className="bpmn-flow" markerEnd="url(#arrowhead)" />

        <g id="el-evaluate" className={elClass('el-evaluate')} onClick={e => handleElementClick('el-evaluate', e)}>
          <rect className="selection-box" x="209" y="134" width="102" height="82" />
          <rect x="210" y="135" width="100" height="80" className="bpmn-task" rx="12" ry="12" />
          <text x="260" y="179" className="bpmn-task-label" fontWeight="500">Evaluate CV</text>
        </g>

        <line id="flow-evaluate-gateway1" x1="310" y1="175" x2="390" y2="175" className="bpmn-flow" markerEnd="url(#arrowhead)" />

        <g id="el-gateway1" className={elClass('el-gateway1')} onClick={e => handleElementClick('el-gateway1', e)}>
          <rect className="selection-box" x="389" y="154" width="42" height="42" />
          <svg x="390" y="155" width="40" height="40" viewBox="0 0 40 40">
            <path d="M4.45739 24.74C2.01387 22.4156 1.96537 18.5346 4.35003 16.15L16.15 4.35003C18.5346 1.96536 22.4156 2.01387 24.74 4.45739L35.9668 16.26C38.2104 18.6186 38.1639 22.3361 35.8621 24.6379L24.6379 35.8621C22.3361 38.1639 18.6186 38.2104 16.26 35.9668L4.45739 24.74Z" fill="white" stroke="#131E29" />
            <path d="M14.1367 14.136L26.8646 26.8639" stroke="#131E29" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M26.8633 14.136L14.1354 26.8639" stroke="#131E29" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </g>

        <line id="flow-gateway1-plan" x1="430" y1="175" x2="530" y2="175" className="bpmn-flow" markerEnd="url(#arrowhead)" />
        <line id="flow-gateway1-reject1" x1="410" y1="195" x2="410" y2="350" className="bpmn-flow" markerEnd="url(#arrowhead)" />

        <g id="el-reject1" className={elClass('el-reject1')} onClick={e => handleElementClick('el-reject1', e)}>
          <rect className="selection-box" x="359" y="349" width="102" height="82" />
          <rect x="360" y="350" width="100" height="80" className="bpmn-task" rx="12" ry="12" />
          <text x="410" y="394" className="bpmn-task-label" fontWeight="500">Send rejection</text>
        </g>

        <line id="flow-reject1-end1" x1="460" y1="390" x2="535" y2="390" className="bpmn-flow" markerEnd="url(#arrowhead)" />

        <g id="el-end1" className={elClass('el-end1')} onClick={e => handleElementClick('el-end1', e)}>
          <rect className="selection-box" x="540" y="370" width="40" height="40" />
          <svg x="541" y="371" width="38" height="38" viewBox="0 0 38 38" fill="none">
            <rect width="37.0344" height="37.0344" rx="18.5172" fill="#FFDBE7" />
            <path d="M18.5171 4.62939C26.1871 4.62939 32.4047 10.8471 32.4048 18.5171C32.4048 26.1872 26.1872 32.4048 18.5171 32.4048C10.8471 32.4047 4.62939 26.1871 4.62939 18.5171C4.62945 10.8471 10.8471 4.62945 18.5171 4.62939Z" stroke="#AA0808" strokeWidth="2.31465" />
          </svg>
        </g>

        <g id="el-plan" className={elClass('el-plan')} onClick={e => handleElementClick('el-plan', e)}>
          <rect className="selection-box" x="529" y="134" width="102" height="82" />
          <rect x="530" y="135" width="100" height="80" className="bpmn-task" rx="12" ry="12" />
          <text x="580" y="179" className="bpmn-task-label" fontWeight="500">Plan interview</text>
        </g>

        <line id="flow-plan-interview" x1="630" y1="175" x2="720" y2="175" className="bpmn-flow" markerEnd="url(#arrowhead)" />

        <g id="el-interview" className={elClass('el-interview')} onClick={e => handleElementClick('el-interview', e)}>
          <rect className="selection-box" x="719" y="134" width="102" height="82" />
          <rect x="720" y="135" width="100" height="80" className="bpmn-task" rx="12" ry="12" />
          <text x="770" y="179" className="bpmn-task-label" fontWeight="500">Interview candidate</text>
        </g>

        <g id="el-system" className={elClass('el-system')} onClick={e => handleElementClick('el-system', e)}>
          <rect className="selection-box" x="737" y="251" width="66" height="70" />
          <rect x="738" y="252" width="64" height="68" className="bpmn-data-shape" rx="6" ry="6" />
          <text x="770" y="290" className="bpmn-task-label" fontSize="11">ATS System</text>
        </g>

        <line id="flow-system-interview" x1="770" y1="251" x2="770" y2="215" className="bpmn-flow" markerEnd="url(#arrowhead)" />
        <line id="flow-interview-gateway2" x1="820" y1="175" x2="900" y2="175" className="bpmn-flow" markerEnd="url(#arrowhead)" />

        <g id="el-gateway2" className={elClass('el-gateway2')} onClick={e => handleElementClick('el-gateway2', e)}>
          <rect className="selection-box" x="899" y="154" width="42" height="42" />
          <svg x="900" y="155" width="40" height="40" viewBox="0 0 40 40">
            <path d="M4.45739 24.74C2.01387 22.4156 1.96537 18.5346 4.35003 16.15L16.15 4.35003C18.5346 1.96536 22.4156 2.01387 24.74 4.45739L35.9668 16.26C38.2104 18.6186 38.1639 22.3361 35.8621 24.6379L24.6379 35.8621C22.3361 38.1639 18.6186 38.2104 16.26 35.9668L4.45739 24.74Z" fill="white" stroke="#131E29" />
            <path d="M14.1367 14.136L26.8646 26.8639" stroke="#131E29" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M26.8633 14.136L14.1354 26.8639" stroke="#131E29" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </g>

        <line id="flow-gateway2-offer" x1="940" y1="175" x2="1040" y2="175" className="bpmn-flow" markerEnd="url(#arrowhead)" />
        <line id="flow-gateway2-reject2" x1="920" y1="195" x2="920" y2="350" className="bpmn-flow" markerEnd="url(#arrowhead)" />

        <g id="el-reject2" className={elClass('el-reject2')} onClick={e => handleElementClick('el-reject2', e)}>
          <rect className="selection-box" x="869" y="349" width="102" height="82" />
          <rect x="870" y="350" width="100" height="80" className="bpmn-task" rx="12" ry="12" />
          <text x="920" y="394" className="bpmn-task-label" fontWeight="500">Send rejection</text>
        </g>

        <line id="flow-reject2-end2" x1="970" y1="390" x2="1045" y2="390" className="bpmn-flow" markerEnd="url(#arrowhead)" />

        <g id="el-end2" className={elClass('el-end2')} onClick={e => handleElementClick('el-end2', e)}>
          <rect className="selection-box" x="1050" y="370" width="40" height="40" />
          <svg x="1051" y="371" width="38" height="38" viewBox="0 0 38 38" fill="none">
            <rect width="37.0344" height="37.0344" rx="18.5172" fill="#FFDBE7" />
            <path d="M18.5171 4.62939C26.1871 4.62939 32.4047 10.8471 32.4048 18.5171C32.4048 26.1872 26.1872 32.4048 18.5171 32.4048C10.8471 32.4047 4.62939 26.1871 4.62939 18.5171C4.62945 10.8471 10.8471 4.62945 18.5171 4.62939Z" stroke="#AA0808" strokeWidth="2.31465" />
          </svg>
        </g>

        <g id="el-offer" className={elClass('el-offer')} onClick={e => handleElementClick('el-offer', e)}>
          <rect className="selection-box" x="1039" y="134" width="102" height="82" />
          <rect x="1040" y="135" width="100" height="80" className="bpmn-task" rx="12" ry="12" />
          <text x="1090" y="179" className="bpmn-task-label" fontWeight="500">Make offer</text>
        </g>

        <line id="flow-offer-gateway3" x1="1140" y1="175" x2="1220" y2="175" className="bpmn-flow" markerEnd="url(#arrowhead)" />

        <g id="el-gateway3" className={elClass('el-gateway3')} onClick={e => handleElementClick('el-gateway3', e)}>
          <rect className="selection-box" x="1219" y="154" width="42" height="42" />
          <svg x="1220" y="155" width="40" height="40" viewBox="0 0 40 40">
            <path d="M4.45739 24.74C2.01387 22.4156 1.96537 18.5346 4.35003 16.15L16.15 4.35003C18.5346 1.96536 22.4156 2.01387 24.74 4.45739L35.9668 16.26C38.2104 18.6186 38.1639 22.3361 35.8621 24.6379L24.6379 35.8621C22.3361 38.1639 18.6186 38.2104 16.26 35.9668L4.45739 24.74Z" fill="white" stroke="#131E29" />
            <path d="M14.1367 14.136L26.8646 26.8639" stroke="#131E29" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M26.8633 14.136L14.1354 26.8639" stroke="#131E29" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </g>

        <line id="flow-gateway3-onboard" x1="1260" y1="175" x2="1360" y2="175" className="bpmn-flow" markerEnd="url(#arrowhead)" />
        <line id="flow-gateway3-end3" x1="1240" y1="195" x2="1240" y2="352" className="bpmn-flow" markerEnd="url(#arrowhead)" />

        <g id="el-end3" className={elClass('el-end3')} onClick={e => handleElementClick('el-end3', e)}>
          <rect className="selection-box" x="1220" y="352" width="40" height="40" />
          <svg x="1221" y="353" width="38" height="38" viewBox="0 0 38 38" fill="none">
            <rect width="37.0344" height="37.0344" rx="18.5172" fill="#FFDBE7" />
            <path d="M18.5171 4.62939C26.1871 4.62939 32.4047 10.8471 32.4048 18.5171C32.4048 26.1872 26.1872 32.4048 18.5171 32.4048C10.8471 32.4047 4.62939 26.1871 4.62939 18.5171C4.62945 10.8471 10.8471 4.62945 18.5171 4.62939Z" stroke="#AA0808" strokeWidth="2.31465" />
          </svg>
        </g>

        <g id="el-onboard" className={elClass('el-onboard')} onClick={e => handleElementClick('el-onboard', e)}>
          <rect className="selection-box" x="1359" y="134" width="102" height="82" />
          <rect x="1360" y="135" width="100" height="80" className="bpmn-task" rx="12" ry="12" />
          <text x="1410" y="179" className="bpmn-task-label" fontWeight="500">Onboard candidate</text>
        </g>

        <line id="flow-onboard-end4" x1="1460" y1="175" x2="1535" y2="175" className="bpmn-flow" markerEnd="url(#arrowhead)" />

        <g id="el-end4" className={elClass('el-end4')} onClick={e => handleElementClick('el-end4', e)}>
          <rect className="selection-box" x="1539" y="156" width="42" height="42" />
          <svg x="1540" y="157" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="20" fill="#EBF5CB" />
            <path d="M20 33.75C27.594 33.75 33.75 27.594 33.75 20C33.75 12.406 27.594 6.25 20 6.25C12.406 6.25 6.25 12.406 6.25 20C6.25 27.594 12.406 33.75 20 33.75Z" stroke="#256F3A" strokeWidth="2" />
            <path d="M20 33.75C27.594 33.75 33.75 27.594 33.75 20C33.75 12.406 27.594 6.25 20 6.25C12.406 6.25 6.25 12.406 6.25 20C6.25 27.594 12.406 33.75 20 33.75Z" fill="#256F3A" fillOpacity="0.15" />
          </svg>
        </g>
      </svg>
    </div>
  )
}

function LiveInsightsInner() {
  const { zoom, dispatch } = useLiveInsights()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div className="canvas-title-bar">
        <span className="title-text">Onboarding Process</span>
        <span className="draft-chip">Draft</span>
      </div>
      <div className="shell-main">
        <div className="left-action-panel">
          <div className="left-action-group">
            <button className="action-btn" title="Dictionary" onClick={() => dispatch({ type: 'TOGGLE_DICT' })}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="currentColor"><path d="M19.8 26.0033C19.7 26.0033 19.6 25.9833 19.5 25.9433L11.5 22.7433C11.2 22.6233 11 22.3233 11 22.0033V12.4233C11 12.1733 11.05 12.1433 11.06 12.1133C11.13 11.9433 11.26 11.7933 11.44 11.6933L14.7 10.0833C14.9 9.98333 15.14 9.97333 15.35 10.0533L23.49 13.2533C23.8 13.3733 24 13.6733 24 13.9933V23.5933C24 24.0333 23.64 24.3933 23.2 24.3933C22.76 24.3933 22.4 24.0333 22.4 23.5933V14.5533L15.09 11.6733L13.76 12.3233L20.09 14.8533C20.39 14.9733 20.59 15.2733 20.59 15.5933V25.1933C20.59 25.4633 20.46 25.7033 20.24 25.8533C20.11 25.9433 19.95 25.9933 19.79 25.9933L19.8 26.0033ZM12.6 21.4633L19 24.0233V16.1433L12.6 13.5833V21.4633Z" /></svg>
            </button>
          </div>
          <div className="left-action-group" style={{ marginTop: 'auto' }}>
            <button className="action-btn" title="Zoom in" onClick={() => dispatch({ type: 'SET_ZOOM', zoom: zoom + 10 })}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="currentColor"><path d="M18 11a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5h-5a1 1 0 110-2h5v-5a1 1 0 011-1z" /></svg>
            </button>
            <button className="action-btn" title="Zoom out" onClick={() => dispatch({ type: 'SET_ZOOM', zoom: zoom - 10 })}>
              <svg width="36" height="36" viewBox="0 0 36 36" fill="currentColor"><path d="M11 18a1 1 0 011-1h12a1 1 0 110 2H12a1 1 0 01-1-1z" /></svg>
            </button>
            <span style={{ fontSize: 11, color: 'var(--sapContent_LabelColor)', textAlign: 'center', padding: '2px 0' }}>{zoom}%</span>
          </div>
        </div>
        <LiveInsightsCanvas />
      </div>
    </div>
  )
}

export default function LiveInsightsApp() {
  return (
    <LiveInsightsProvider>
      <LiveInsightsInner />
    </LiveInsightsProvider>
  )
}
