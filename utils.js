const vscode = require('vscode')

const outputChannel = vscode.window.createOutputChannel('KCS')

const createDecorations = (fontSize) => {
   const cursorDecorationBorder = 0.073333 * fontSize + 'px'
   const cursorDecorationMargin = -0.073333 * fontSize * 2 + 'px'
   const eolSelectionBorder = 0.3 * fontSize + 'px'

   const cursorDecoration = vscode.window.createTextEditorDecorationType({
      after: {
         backgroundColor: 'hsl(338, 78%, 70%)',
         border: `${cursorDecorationBorder} solid hsl(338, 78%, 70%)`,
         contentText: '',
         margin: `0 ${cursorDecorationMargin} 0 0`
      }
   })

   const selectionDecoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'hsla(299, 69%, 33%, 0.6)'
   })

   const eolSelectionDecoration = vscode.window.createTextEditorDecorationType({
      border: `${eolSelectionBorder} solid transparent`,
      backgroundColor: 'hsla(299, 69%, 33%, 0.6)'
   })

   return {
      cursorDecoration,
      selectionDecoration,
      eolSelectionDecoration
   }
}

/**
 * @param {vscode.TextEditor} editor
 */
const setMyDecorations = (
   editor,
   inactiveSelections,
   { cursorDecoration, selectionDecoration, eolSelectionDecoration }
) => {
   const cursorDecorationRanges = []
   const selectionDecorationRanges = []
   const eolSelectionDecorationRanges = []

   inactiveSelections.forEach((range) => {
      if (range.start.isEqual(range.end)) {
         cursorDecorationRanges.push(range)
      } else {
         selectionDecorationRanges.push(range)
         cursorDecorationRanges.push(new vscode.Range(range.end, range.end))

         for (let lineNumber = range.start.line; range.end.line - lineNumber !== 0; lineNumber++) {
            const line = editor.document.lineAt(lineNumber)

            const position = new vscode.Position(lineNumber, line.range.end.character)
            const range = new vscode.Range(position, position)

            eolSelectionDecorationRanges.push(range)
         }
      }
   })

   editor.setDecorations(cursorDecoration, cursorDecorationRanges)
   editor.setDecorations(selectionDecoration, selectionDecorationRanges)
   editor.setDecorations(eolSelectionDecoration, eolSelectionDecorationRanges)
}

/**
 * @param {vscode.TextEditor} editor
 */
const unsetMyDecorations = (
   editor,
   { cursorDecoration, selectionDecoration, eolSelectionDecoration }
) => {
   editor.setDecorations(cursorDecoration, [])
   editor.setDecorations(selectionDecoration, [])
   editor.setDecorations(eolSelectionDecoration, [])
}

const Action = () => {
   return {
      type: undefined,
      ranges: [],
      indexToDeleteFrom: undefined
   }
}

module.exports = {
   outputChannel,
   createDecorations,
   setMyDecorations,
   unsetMyDecorations,
   Action
}
