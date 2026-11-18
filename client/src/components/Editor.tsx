import { useRef, useEffect } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine } from '@codemirror/view';
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { autocompletion, closeBrackets } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { lintGutter } from '@codemirror/lint';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import * as Y from 'yjs';
import { yCollab } from 'y-codemirror.next';
import type { WebsocketProvider } from 'y-websocket';

interface EditorProps {
  language: 'javascript' | 'python';
  ydoc: React.RefObject<Y.Doc | null>;
  provider: React.RefObject<WebsocketProvider | null>;
  onDocChange?: (value: string) => void;
}

const DEFAULT_CODE = `// Welcome to Choreo \u{1F3AD}
// Start typing \u2014 your collaborators will see every keystroke in real time.

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('fib(10) =', fibonacci(10));
console.log('Hello from Choreo!');
`;

export function Editor({ language, ydoc, provider, onDocChange }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onDocChangeRef = useRef(onDocChange);
  onDocChangeRef.current = onDocChange;

  useEffect(() => {
    if (!containerRef.current || !ydoc.current || !provider.current) return;

    const doc = ydoc.current;
    const prov = provider.current;

    // Get or initialize the shared Y.Text named "codemirror"
    const ytext = doc.getText('codemirror');

    // Seed with default code if the document is brand new (empty)
    if (ytext.length === 0) {
      ytext.insert(0, DEFAULT_CODE);
    }

    const langExtension = language === 'python' ? python() : javascript();

    const state = EditorState.create({
      doc: ytext.toString(),
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        closeBrackets(),
        autocompletion(),
        highlightSelectionMatches(),
        lintGutter(),
        langExtension,
        vscodeDark,
        // ---- Yjs collaborative binding ----
        yCollab(ytext, prov.awareness),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          indentWithTab,
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onDocChangeRef.current) {
            onDocChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': { height: '100%', fontSize: '14px' },
          '.cm-scroller': { overflow: 'auto' },
          '.cm-content': { fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" },
          '.cm-gutters': { borderRight: '1px solid #333' },
          // Style for remote peer cursors injected by yCollab
          '.cm-ySelectionInfo': {
            fontSize: '11px',
            fontFamily: 'sans-serif',
            padding: '1px 4px',
            borderRadius: '3px',
            opacity: '0.9',
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, ydoc, provider]);

  return <div ref={containerRef} className="editor-container" />;
}
