import type { Peer } from '../hooks/useCollaboration';

interface HeaderProps {
  language: 'javascript' | 'python';
  onLanguageChange: (lang: 'javascript' | 'python') => void;
  onRun: () => void;
  connected: boolean;
  peers: Peer[];
  roomId: string;
}

export function Header({ language, onLanguageChange, onRun, connected, peers, roomId }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">\u{1F3AD} Choreo</h1>
        <span className="tagline">collaborative code</span>
      </div>

      <div className="header-center">
        <span className={`connection-badge ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '\u{1F7E2}' : '\u{1F534}'} {roomId}
        </span>

        <div className="peer-avatars">
          {peers.map((peer) => (
            <span
              key={peer.clientId}
              className="peer-dot"
              style={{ backgroundColor: peer.color }}
              title={peer.name}
            />
          ))}
          <span className="peer-count">
            {peers.length} {peers.length === 1 ? 'user' : 'users'}
          </span>
        </div>

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
          \u25b6 Run
        </button>
      </div>
    </header>
  );
}
