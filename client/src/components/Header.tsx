import { useState } from 'react';
import type { Peer } from '../hooks/useCollaboration';
import { PeerList } from './PeerList';

interface HeaderProps {
  language: 'javascript' | 'python';
  onLanguageChange: (lang: 'javascript' | 'python') => void;
  onRun: () => void;
  connected: boolean;
  peers: Peer[];
  roomId: string;
  userName: string;
  userColor: string;
  onUpdateUserName: (name: string) => void;
  onUpdateUserColor: (color: string) => void;
}

export function Header({
  language,
  onLanguageChange,
  onRun,
  connected,
  peers,
  roomId,
  userName,
  userColor,
  onUpdateUserName,
  onUpdateUserColor,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleQuickShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">🎭 Choreo</h1>
        <span className="tagline">collaborative code</span>
      </div>

      <div className="header-center">
        <PeerList
          peers={peers}
          connected={connected}
          roomId={roomId}
          userName={userName}
          userColor={userColor}
          onUpdateUserName={onUpdateUserName}
          onUpdateUserColor={onUpdateUserColor}
        />

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
        <button
          type="button"
          className={`share-btn ${copied ? 'copied' : ''}`}
          onClick={handleQuickShare}
          title="Copy room invite link"
        >
          {copied ? '✓ Copied' : '🔗 Share'}
        </button>
        <button type="button" className="run-btn" onClick={onRun}>
          ▶ Run
        </button>
      </div>
    </header>
  );
}
