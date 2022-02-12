import CodeMirror from '@uiw/react-codemirror'
import { StreamLanguage } from '@codemirror/stream-parser'
import { yaml as yamlLang } from '@codemirror/legacy-modes/mode/yaml'
import { defaultHighlightStyle } from '@codemirror/highlight'
import { lineNumbers, highlightActiveLineGutter } from '@codemirror/gutter'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { autocompletion, completionKeymap } from '@codemirror/autocomplete'
import { commentKeymap } from '@codemirror/comment'
import {
  keymap,
  highlightSpecialChars,
  drawSelection,
  highlightActiveLine,
  dropCursor,
} from '@codemirror/view'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets'
import { defaultKeymap } from '@codemirror/commands'
import { indentOnInput } from '@codemirror/language'
import { history, historyKeymap } from '@codemirror/history'
import { lintGutter, lintKeymap } from '@codemirror/lint'
import { foldGutter, foldKeymap } from '@codemirror/fold'

export default function CodeEditor({
  contents,
  window,
  setRawContents,
  ratio,
}) {
  return (
    <CodeMirror
      value={contents}
      height={Math.round(window.height * 0.85) + 'px'}
      width={Math.round(window.width * ratio) + 'px'}
      extensions={[
        StreamLanguage.define(yamlLang),
        defaultHighlightStyle.fallback,
        lineNumbers(),
        highlightActiveLineGutter(),
        indentOnInput(),
        foldGutter(),
        lintGutter(),
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...searchKeymap,
          ...historyKeymap,
          ...commentKeymap,
          ...completionKeymap,
          ...lintKeymap,
          ...foldKeymap,
        ]),
      ]}
      onChange={value => setRawContents(value)}
    />
  )
}
