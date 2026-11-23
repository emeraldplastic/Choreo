import { useState, useRef, useEffect } from 'react';
import type { Peer } from '../hooks/useCollaboration';
import { CURSOR_COLORS } from '../hooks/useCollaboration';

interface PeerListProps {
  peers: Peer[];
  connected: boolean;
  roomId: string;
  userName: string;
  userColor: string;
  onUpdateUserName: (name: string) => void;
  onUpdateUserColor: (color: string) => void;
}

export function PeerList({
  peers,
  connected,
  roomId,
  userName,
  userColor,
  onUpdateUserName,
  onUpdateUserColor,
}: PeerListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setEditingName(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when editing name
  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== userName) {
      onUpdateUserName(trimmed);
    } else {
      setNameInput(userName);
    }
    setEditingName(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const remotePeers = peers.filter((p) => !p.isLocal);
  const typingPeers = remotePeers.filter((p) => p.isTyping);

  return (
    <div className="peer-presence-container" ref={popoverRef}>
      {/* Presence Trigger Badge */}
      <button
        className={`presence-pill ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        title="View collaborators & presence"
        type="button"
      >
        <span
          className={`status-dot ${connected ? 'connected' : 'disconnected'}`}
        />
        <div className="peer-avatar-stack">
          {peers.slice(0, 3).map((peer) => (
            <span
              key={peer.clientId}
              className="peer-avatar-circle"
              style={{ backgroundColor: peer.color }}
              title={peer.name + (peer.isLocal ? ' (You)' : '')}
            >
              {peer.name.charAt(0).toUpperCase()}
            </span>
          ))}
        </div>
        <span className="presence-label">
          {peers.length} {peers.length === 1 ? 'peer' : 'peers'}
        </span>
        {typingPeers.length > 0 && (
          <span
            className="typing-indicator"
            title={`${typingPeers.map((p) => p.name).join(', ')} is typing...`}
          >
            typing...
          </span>
        )}
        <span className="presence-chevron">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* Collaborators Popover */}
      {isOpen && (
        <div className="presence-popover">
          <div className="popover-header">
            <span className="popover-title">Collaborators</span>
            <span className="room-tag">#{roomId}</span>
          </div>

          {/* Local User Profile ("You") */}
          <div className="presence-section">
            <span className="section-label">Your Profile</span>
            <div className="user-profile-card">
              <div
                className="user-avatar-large"
                style={{ backgroundColor: userColor }}
              >
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                {editingName ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveName();
                    }}
                    className="name-edit-form"
                  >
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onBlur={handleSaveName}
                      className="name-input"
                      maxLength={24}
                    />
                    <button type="submit" className="save-name-btn">✓</button>
                  </form>
                ) : (
                  <div className="name-display-row">
                    <span className="user-name-text">{userName}</span>
                    <span className="you-badge">You</span>
                    <button
                      type="button"
                      className="edit-name-btn"
                      onClick={() => {
                        setNameInput(userName);
                        setEditingName(true);
                      }}
                      title="Edit display name"
                    >
                      ✎
                    </button>
                  </div>
                )}
                {/* Cursor Color Swatches */}
                <div className="color-swatches">
                  {CURSOR_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`color-swatch ${c === userColor ? 'selected' : ''}`}
                      style={{ backgroundColor: c }}
                      onClick={() => onUpdateUserColor(c)}
                      title={`Change cursor color to ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Remote Collaborators */}
          <div className="presence-section">
            <span className="section-label">
              Active in Room ({remotePeers.length})
            </span>
            {remotePeers.length === 0 ? (
              <div className="no-peers-hint">
                No one else is here yet. Share the room link to invite teammates!
              </div>
            ) : (
              <ul className="peer-list">
                {remotePeers.map((peer) => (
                  <li key={peer.clientId} className="peer-item">
                    <div
                      className="peer-avatar-circle"
                      style={{ backgroundColor: peer.color }}
                    >
                      {peer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="peer-info">
                      <span className="peer-name">{peer.name}</span>
                      <span className="peer-status">
                        {peer.isTyping ? (
                          <span className="typing-text">typing...</span>
                        ) : (
                          'Active'
                        )}
                      </span>
                    </div>
                    <span className="peer-client-id">#{peer.clientId.toString().slice(-4)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Share Room Link */}
          <div className="popover-footer">
            <button
              type="button"
              className="copy-link-btn"
              onClick={handleCopyLink}
            >
              {copied ? '✓ Copied Room Link!' : '🔗 Copy Invite Link'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
