import * as vscode from 'vscode'

const outputChannel = vscode.window.createOutputChannel('KCS')

/**
 * @callback SetMyDecorations
 * @param {vscode.TextEditor} editor
 * @param {vscode.Range[]} inactiveSelections
 * @return {void}
 */

/**
 * @callback UnsetMyDecorations
 * @param {vscode.TextEditor} editor
 * @return {void}
 */

/**
 * @param {number} fontSize
 * @return {{ setMyDecorations: SetMyDecorations, unsetMyDecorations: UnsetMyDecorations, disposeDecorations: CallableFunction }}
 */
const createDecorations = (fontSize) => {
   const eolSelectionBorder = 0.3 * fontSize + 'px'

   const cursorDecoration = vscode.window.createTextEditorDecorationType({
      after: {
         contentText: '',
         backgroundColor: 'hsl(338, 78%, 70%)',
         border: `1.25px solid hsl(338, 78%, 70%)`,
         margin: `0 -2.5px 0 0`
      }
   })

   const selectionDecoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'hsla(299, 69%, 33%, 0.6)'
   })

   const eolSelectionDecoration = vscode.window.createTextEditorDecorationType({
      border: `${eolSelectionBorder} solid transparent`,
      backgroundColor: 'hsla(299, 69%, 33%, 0.6)'
   })

   /**
    * @type {SetMyDecorations}
    */
   const setMyDecorations = (editor, inactiveSelections) => {
      const cursorDecorationRanges = []
      const selectionDecorationRanges = []
      const eolSelectionDecorationRanges = []

      inactiveSelections.forEach((range) => {
         if (range.start.isEqual(range.end)) {
            cursorDecorationRanges.push(range)
         } else {
            selectionDecorationRanges.push(range)
            cursorDecorationRanges.push(new vscode.Range(range.end, range.end))

            for (
               let lineNumber = range.start.line;
               range.end.line - lineNumber !== 0;
               lineNumber++
            ) {
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
    * @type {UnsetMyDecorations}
    */
   const unsetMyDecorations = (editor) => {
      editor.setDecorations(cursorDecoration, [])
      editor.setDecorations(selectionDecoration, [])
      editor.setDecorations(eolSelectionDecoration, [])
   }

   const disposeDecorations = () => {
      cursorDecoration.dispose()
      selectionDecoration.dispose()
      eolSelectionDecoration.dispose()
   }

   return { setMyDecorations, unsetMyDecorations, disposeDecorations }
}

class MainDataObject {
   inactiveSelections: vscode.Range[] = []
   actions: Array<InactiveSelectionsPlacedAction | InactiveSelectionsRemovedAction> = []
   actionIndex: number = -1
}

class InactiveSelectionsPlacedAction {
   readonly type = 'inactiveSelectionsPlaced'
   ranges: vscode.Range[] = []
   elementsCountToRemove: number = undefined
}

class InactiveSelectionsRemovedAction {
   readonly type = 'inactiveSelectionsRemoved'
   rangesAndIndexes: Array<{
      index: number
      range: vscode.Range
   }> = []
}

type Action = InactiveSelectionsPlacedAction | InactiveSelectionsRemovedAction

export {
   outputChannel,
   createDecorations,
   MainDataObject,
   InactiveSelectionsPlacedAction,
   InactiveSelectionsRemovedAction,
   Action
}
