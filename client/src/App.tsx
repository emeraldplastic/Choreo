import { useState } from 'react';
import { Editor } from './components/Editor';
import { OutputPanel } from './components/OutputPanel';
import { Header } from './components/Header';

const DEFAULT_CODE = `// Welcome to Choreo 🎭
// Start typing — your collaborators will see every keystroke in real time.

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('fib(10) =', fibonacci(10));
console.log('Hello from Choreo!');
`;

export function App() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<string[]>([]);
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');

  const handleRun = () => {
    // Phase 1: local eval for JS only (will be replaced by Docker runner in PR #5-7)
    setOutput([]);
    const logs: string[] = [];
    const fakeConsole = {
      log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
      error: (...args: unknown[]) => logs.push(`[ERR] ${args.map(String).join(' ')}`),
      warn: (...args: unknown[]) => logs.push(`[WARN] ${args.map(String).join(' ')}`),
    };
    try {
      const fn = new Function('console', code);
      fn(fakeConsole);
      setOutput(logs.length ? logs : ['(no output)']);
    } catch (err) {
      setOutput([`Error: ${err instanceof Error ? err.message : String(err)}`]);
    }
  };

  return (
    <div className="app">
      <Header language={language} onLanguageChange={setLanguage} onRun={handleRun} />
      <main className="workspace">
        <Editor code={code} onChange={setCode} language={language} />
        <OutputPanel lines={output} />
      </main>
    </div>
  );
}
