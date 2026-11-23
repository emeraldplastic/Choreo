import { useState, useCallback } from 'react';
import { Editor } from './components/Editor';
import { OutputPanel } from './components/OutputPanel';
import { Header } from './components/Header';
import { useCollaboration } from './hooks/useCollaboration';

export function App() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const {
    ydoc,
    provider,
    peers,
    connected,
    roomId,
    userName,
    userColor,
    updateUserName,
    updateUserColor,
    setLocalTyping,
  } = useCollaboration();

  const handleDocChange = useCallback((value: string) => {
    setCode(value);
  }, []);

  const handleRun = () => {
    // Phase 1: local eval for JS only (will be replaced by Docker runner in PR #5-7)
    setOutput([]);
    const logs: string[] = [];
    const fakeConsole = {
      log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
      error: (...args: unknown[]) => logs.push(`[ERR] ${args.map(String).join(' ')}`),
      warn: (...args: unknown[]) => logs.push(`[WARN] ${args.map(String).join(' ')}`),
    };

    // Read latest content from the shared Y.Doc
    const currentCode = ydoc.current
      ? ydoc.current.getText('codemirror').toString()
      : code;

    try {
      const fn = new Function('console', currentCode);
      fn(fakeConsole);
      setOutput(logs.length ? logs : ['(no output)']);
    } catch (err) {
      setOutput([`Error: ${err instanceof Error ? err.message : String(err)}`]);
    }
  };

  return (
    <div className="app">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        onRun={handleRun}
        connected={connected}
        peers={peers}
        roomId={roomId}
        userName={userName}
        userColor={userColor}
        onUpdateUserName={updateUserName}
        onUpdateUserColor={updateUserColor}
      />
      <main className="workspace">
        <Editor
          language={language}
          ydoc={ydoc}
          provider={provider}
          onDocChange={handleDocChange}
          onTyping={setLocalTyping}
        />
        <OutputPanel lines={output} />
      </main>
    </div>
  );
}
