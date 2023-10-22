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
 * @return {{ setMyDecorations: SetMyDecorations, unsetMyDecorations: UnsetMyDecorations, disposeDecorations: CallableFunction }}
 */
const createDecorations = () => {
   const fontSize: number = vscode.workspace.getConfiguration('editor').get('fontSize')
   const cursorColor = vscode.workspace.getConfiguration('kcs').get('cursorColor')
   const selectionColor = vscode.workspace.getConfiguration('kcs').get('selectionColor')

   const eolSelectionBorder = 0.3 * fontSize + 'px'

   const cursorDecoration = vscode.window.createTextEditorDecorationType({
      after: {
         contentText: '',
         backgroundColor: cursorColor,
         border: `1.25px solid ${cursorColor}`,
         margin: `0 -2.5px 0 0`
      }
   })

   const selectionDecoration = vscode.window.createTextEditorDecorationType({
      backgroundColor: selectionColor
   })

   const eolSelectionDecoration = vscode.window.createTextEditorDecorationType({
      border: `${eolSelectionBorder} solid transparent`,
      backgroundColor: selectionColor
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

export {
   outputChannel,
   createDecorations,
   MainDataObject,
   InactiveSelectionsPlacedAction,
   InactiveSelectionsRemovedAction
}
