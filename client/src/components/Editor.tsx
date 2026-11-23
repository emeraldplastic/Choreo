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
  onTyping?: (isTyping: boolean) => void;
}

const DEFAULT_CODE = `// Welcome to Choreo 🎭
// Start typing — your collaborators will see every keystroke and cursor in real time.

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('fib(10) =', fibonacci(10));
console.log('Hello from Choreo!');
`;

export function Editor({ language, ydoc, provider, onDocChange, onTyping }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onDocChangeRef = useRef(onDocChange);
  onDocChangeRef.current = onDocChange;
  const onTypingRef = useRef(onTyping);
  onTypingRef.current = onTyping;
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        // ---- Yjs collaborative binding & awareness cursors ----
        yCollab(ytext, prov.awareness),
        keymap.of([
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          indentWithTab,
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            if (onDocChangeRef.current) {
              onDocChangeRef.current(update.state.doc.toString());
            }
            if (onTypingRef.current) {
              onTypingRef.current(true);
              if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
              }
              typingTimerRef.current = setTimeout(() => {
                onTypingRef.current?.(false);
              }, 1200);
            }
          }
        }),
        EditorView.theme({
          '&': { height: '100%', fontSize: '14px' },
          '.cm-scroller': { overflow: 'auto' },
          '.cm-content': { fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace" },
          '.cm-gutters': { borderRight: '1px solid #333' },
          // ---- Remote peer cursor & selection styling ----
          '.cm-ySelection': {
            borderRadius: '2px',
            transition: 'background-color 0.15s ease',
          },
          '.cm-ySelectionCaret': {
            position: 'relative',
            borderLeft: '2px solid',
            marginLeft: '-1px',
            marginRight: '-1px',
            boxSizing: 'border-box',
            display: 'inline',
          },
          '.cm-ySelectionCaretDot': {
            borderRadius: '50%',
            position: 'absolute',
            width: '6px',
            height: '6px',
            top: '-3px',
            left: '-2px',
          },
          '.cm-ySelectionInfo': {
            position: 'absolute',
            top: '-1.4em',
            left: '-1px',
            fontSize: '10px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: '600',
            lineHeight: '1.2',
            padding: '1px 5px',
            borderRadius: '3px',
            color: '#ffffff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.4)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            pointerEvents: 'none',
            zIndex: '100',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
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
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, ydoc, provider]);

  return <div ref={containerRef} className="editor-container" />;
}
