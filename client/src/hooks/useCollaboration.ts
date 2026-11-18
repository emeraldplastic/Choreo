import { useEffect, useRef, useState, useMemo } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// Deterministic color palette for peer cursors
const CURSOR_COLORS = [
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
  name: string;
  color: string;
  clientId: number;
}

export function useCollaboration() {
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [connected, setConnected] = useState(false);

  const roomId = useMemo(() => getOrCreateRoomId(), []);
  const userName = useMemo(() => randomName(), []);
  const userColor = useMemo(
    () => CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)],
    [],
  );

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

    // Set local awareness fields (cursor name + color)
    provider.awareness.setLocalStateField('user', {
      name: userName,
      color: userColor,
      colorLight: userColor + '33', // 20% opacity for selection highlight
    });

    // Track connection status
    provider.on('status', (event: { status: string }) => {
      setConnected(event.status === 'connected');
    });

    // Track awareness (peer list)
    const updatePeers = () => {
      const states = provider.awareness.getStates() as Map<
        number,
        { user?: { name: string; color: string } }
      >;
      const peerList: Peer[] = [];
      states.forEach((state, clientId) => {
        if (state.user) {
          peerList.push({
            name: state.user.name,
            color: state.user.color,
            clientId,
          });
        }
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
  }, [roomId, userName, userColor]);

  return {
    ydoc: ydocRef,
    provider: providerRef,
    peers,
    connected,
    roomId,
    userName,
    userColor,
  };
}
