interface HeaderProps {
  language: 'javascript' | 'python';
  onLanguageChange: (lang: 'javascript' | 'python') => void;
  onRun: () => void;
}

export function Header({ language, onLanguageChange, onRun }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">🎭 Choreo</h1>
        <span className="tagline">collaborative code</span>
      </div>

      <div className="header-center">
        <select
          className="lang-select"
          value={language}
          onChange={(e) => onLanguageChange(e.target.value as 'javascript' | 'python')}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>

      <div className="header-right">
        <button className="run-btn" onClick={onRun}>
          ▶ Run
        </button>
      </div>
    </header>
  );
}
