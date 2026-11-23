import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// Deterministic color palette for peer cursors
export const CURSOR_COLORS = [
  '#58a6ff', '#f78166', '#7ee787', '#d2a8ff',
  '#ff7b72', '#79c0ff', '#ffa657', '#a5d6ff',
];

function randomName(): string {
  const adjectives = ['Swift', 'Bright', 'Bold', 'Calm', 'Keen', 'Vivid', 'Sharp', 'Noble'];
  const nouns = ['Coder', 'Hacker', 'Builder', 'Maker', 'Ninja', 'Wizard', 'Pilot', 'Scout'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

function getOrCreateRoomId(): string {
  const hash = window.location.hash.slice(1);
  if (hash && hash.length > 2) return hash;
  const id = 'room-' + Math.random().toString(36).substring(2, 8);
  window.location.hash = id;
  return id;
}

export interface Peer {
  clientId: number;
  name: string;
  color: string;
  isLocal: boolean;
  isTyping?: boolean;
  lastActive?: number;
}

export function useCollaboration() {
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [connected, setConnected] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);

  const roomId = useMemo(() => getOrCreateRoomId(), []);
  const initialName = useMemo(() => randomName(), []);
  const initialColor = useMemo(
    () => CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)],
    [],
  );

  const [userName, setUserName] = useState<string>(initialName);
  const [userColor, setUserColor] = useState<string>(initialColor);

  useEffect(() => {
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Connect to the y-websocket server.
    // In dev, Vite proxies /ws -> ws://localhost:3001
    // The y-websocket provider appends the room name to the URL path.
    const wsUrl =
      import.meta.env.VITE_YJS_WS_URL ||
      `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;

    const provider = new WebsocketProvider(wsUrl, roomId, ydoc, {
      connect: true,
    });
    providerRef.current = provider;
    setClientId(provider.awareness.clientID);

    // Set local awareness fields (cursor name, color, typing state)
    provider.awareness.setLocalStateField('user', {
      name: userName,
      color: userColor,
      colorLight: userColor + '33', // 20% opacity for selection highlight
      isTyping: false,
      lastActive: Date.now(),
    });

    // Track connection status
    provider.on('status', (event: { status: string }) => {
      setConnected(event.status === 'connected');
    });

    // Track awareness (peer list)
    const updatePeers = () => {
      const localId = provider.awareness.clientID;
      const states = provider.awareness.getStates() as Map<
        number,
        {
          user?: {
            name: string;
            color: string;
            isTyping?: boolean;
            lastActive?: number;
          };
        }
      >;
      const peerList: Peer[] = [];
      states.forEach((state, cId) => {
        if (state.user) {
          peerList.push({
            clientId: cId,
            name: state.user.name || 'Anonymous',
            color: state.user.color || '#58a6ff',
            isLocal: cId === localId,
            isTyping: Boolean(state.user.isTyping),
            lastActive: state.user.lastActive,
          });
        }
      });

      // Keep local user first, then sort alphabetically by name
      peerList.sort((a, b) => {
        if (a.isLocal) return -1;
        if (b.isLocal) return 1;
        return a.name.localeCompare(b.name);
      });

      setPeers(peerList);
    };

    provider.awareness.on('change', updatePeers);
    updatePeers();

    return () => {
      provider.awareness.off('change', updatePeers);
      provider.disconnect();
      provider.destroy();
      ydoc.destroy();
      ydocRef.current = null;
      providerRef.current = null;
    };
  }, [roomId]);

  // Update display name dynamically in Yjs awareness
  const updateUserName = useCallback((newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setUserName(trimmed);
    if (providerRef.current) {
      const currentState = (providerRef.current.awareness.getLocalState()?.user as Record<string, unknown>) || {};
      providerRef.current.awareness.setLocalStateField('user', {
        ...currentState,
        name: trimmed,
      });
    }
  }, []);

  // Update cursor color dynamically in Yjs awareness
  const updateUserColor = useCallback((newColor: string) => {
    if (!newColor) return;
    setUserColor(newColor);
    if (providerRef.current) {
      const currentState = (providerRef.current.awareness.getLocalState()?.user as Record<string, unknown>) || {};
      providerRef.current.awareness.setLocalStateField('user', {
        ...currentState,
        color: newColor,
        colorLight: newColor + '33',
      });
    }
  }, []);

  // Broadcast typing activity state to collaborators
  const setLocalTyping = useCallback((isTyping: boolean) => {
    if (providerRef.current) {
      const currentState = (providerRef.current.awareness.getLocalState()?.user as Record<string, unknown>) || {};
      providerRef.current.awareness.setLocalStateField('user', {
        ...currentState,
        isTyping,
        lastActive: Date.now(),
      });
    }
  }, []);

  return {
    ydoc: ydocRef,
    provider: providerRef,
    peers,
    connected,
    roomId,
    userName,
    userColor,
    clientId,
    updateUserName,
    updateUserColor,
    setLocalTyping,
  };
}
