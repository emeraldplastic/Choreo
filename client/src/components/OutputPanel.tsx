interface OutputPanelProps {
  lines: string[];
}

export function OutputPanel({ lines }: OutputPanelProps) {
  return (
    <div className="output-panel">
      <div className="output-header">
        <span className="output-title">⬡ Output</span>
        {lines.length > 0 && (
          <span className="output-count">{lines.length} line{lines.length !== 1 ? 's' : ''}</span>
        )}
      </div>
      <pre className="output-content">
        {lines.length === 0
          ? <span className="output-placeholder">Hit ▶ Run to see output here...</span>
          : lines.map((line, i) => (
              <div key={i} className={line.startsWith('[ERR]') ? 'output-error' : 'output-line'}>
                {line}
              </div>
            ))
        }
      </pre>
    </div>
  );
}
