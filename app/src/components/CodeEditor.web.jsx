import CodeMirror from '@uiw/react-codemirror'
import 'codemirror/theme/idea.css'
import 'codemirror/addon/search/search'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/search/jump-to-line'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/dialog/dialog.css'

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
      onChanges={editor => setRawContents(editor.getValue())}
      options={{
        theme: 'idea',
        mode: 'yaml',
        search: {
          bottom: false,
        },
      }}
    />
  )
}
