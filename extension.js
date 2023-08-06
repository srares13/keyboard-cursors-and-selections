const vscode = require('vscode')
const { createDecorations, setMyDecorations, unsetMyDecorations } = require('./utils')

/**
 * @param {vscode.ExtensionContext} context
 */
const activate = (context) => {
   /** @type {Object<string, vscode.Range[]>} */
   const inactiveSelections = {}
   /** @type {Object<string, boolean>} */
   const hiddenSelections = {}
   const outputChannel = vscode.window.createOutputChannel('KCS')
   let { cursorDecoration, selectionDecoration, eolSelectionDecoration } = createDecorations(
      vscode.workspace.getConfiguration('editor').get('fontSize')
   )
   const disposables = []
   vscode.commands.executeCommand('setContext', 'inactiveSelections', false)

   vscode.workspace.onDidChangeConfiguration(
      (event) => {
         if (event.affectsConfiguration('editor.fontSize')) {
            vscode.window.visibleTextEditors.forEach((editor) => {
               const docUriKey = editor.document.uri.toString()
               if (hiddenSelections[docUriKey] === false) {
                  unsetMyDecorations(editor, {
                     cursorDecoration,
                     selectionDecoration,
                     eolSelectionDecoration
                  })
               }
            })
            ;({ cursorDecoration, selectionDecoration, eolSelectionDecoration } = createDecorations(
               vscode.workspace.getConfiguration('editor').get('fontSize')
            ))

            vscode.window.visibleTextEditors.forEach((editor) => {
               const docUriKey = editor.document.uri.toString()
               if (hiddenSelections[docUriKey] === false) {
                  setMyDecorations(editor, inactiveSelections[docUriKey], {
                     cursorDecoration,
                     selectionDecoration,
                     eolSelectionDecoration
                  })
               }
            })
         }
      },
      undefined,
      disposables
   )

   vscode.workspace.onDidChangeTextDocument(
      (event) => {
         const key = event.document.uri.toString()

         if (inactiveSelections[key]) {
            delete inactiveSelections[key]
            delete hiddenSelections[key]

            vscode.window.visibleTextEditors.forEach((editor) => {
               if (editor.document.uri.toString() === key) {
                  unsetMyDecorations(editor, {
                     cursorDecoration,
                     selectionDecoration,
                     eolSelectionDecoration
                  })
               }
            })

            vscode.commands.executeCommand('setContext', 'inactiveSelections', false)
         }
      },
      undefined,
      disposables
   )

   vscode.window.onDidChangeTextEditorSelection(
      (event) => {
         const docUriKey = event.textEditor.document.uri.toString()

         if (
            event.selections.length === 1 &&
            event.selections[0].start.isEqual(event.selections[0].end) &&
            hiddenSelections[docUriKey]
         ) {
            vscode.window.visibleTextEditors.forEach((editor) => {
               if (editor.document.uri.toString() === docUriKey) {
                  setMyDecorations(editor, inactiveSelections[docUriKey], {
                     cursorDecoration,
                     selectionDecoration,
                     eolSelectionDecoration
                  })
               }
            })

            hiddenSelections[docUriKey] = false
            vscode.commands.executeCommand('setContext', 'inactiveSelections', true)
         }
      },
      undefined,
      disposables
   )

   vscode.window.onDidChangeVisibleTextEditors(
      (editors) => {
         editors.forEach((editor) => {
            const docUriKey = editor.document.uri.toString()

            if (hiddenSelections[docUriKey] === false) {
               setMyDecorations(editor, inactiveSelections[docUriKey], {
                  cursorDecoration,
                  selectionDecoration,
                  eolSelectionDecoration
               })
            }
         })
      },
      undefined,
      disposables
   )

   vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
         const docUriKey = editor.document.uri.toString()

         if (hiddenSelections[docUriKey] === false) {
            vscode.commands.executeCommand('setContext', 'inactiveSelections', true)
         } else {
            vscode.commands.executeCommand('setContext', 'inactiveSelections', false)
         }
      },
      undefined,
      disposables
   )

   vscode.workspace.onDidCloseTextDocument(
      (document) => {
         const docUriKey = document.uri.toString()

         delete inactiveSelections[docUriKey]
         delete hiddenSelections[docUriKey]
      },
      undefined,
      disposables
   )

   const placeInactiveSelection = vscode.commands.registerCommand(
      'kcs.placeInactiveSelection',
      () => {
         const editor = vscode.window.activeTextEditor
         if (!editor) {
            return
         }

         const docUriKey = editor.document.uri.toString()

         if (hiddenSelections[docUriKey]) {
            inactiveSelections[docUriKey] = []
         }

         let currentInactiveSelections = inactiveSelections[docUriKey]
            ? [...inactiveSelections[docUriKey]]
            : []
         const newInactiveSelections = []

         editor.selections.forEach((selection) => {
            let addInactiveSelection = true

            for (let i = 0; i < currentInactiveSelections.length; i++) {
               if (!currentInactiveSelections[i]) {
                  continue
               }

               if (selection.isEqual(currentInactiveSelections[i])) {
                  currentInactiveSelections[i] = null
                  addInactiveSelection = false
               } else if (selection.intersection(currentInactiveSelections[i])) {
                  if (
                     selection.start.isEqual(selection.end) ||
                     currentInactiveSelections[i].start.isEqual(currentInactiveSelections[i].end)
                  ) {
                     currentInactiveSelections[i] = null
                  } else if (
                     !selection.start.isEqual(currentInactiveSelections[i].end) &&
                     !selection.end.isEqual(currentInactiveSelections[i].start)
                  ) {
                     currentInactiveSelections[i] = null
                  }
               }
            }

            if (addInactiveSelection) {
               const range = new vscode.Range(selection.start, selection.end)
               newInactiveSelections.unshift(range)
            }
         })

         hiddenSelections[docUriKey] = false
         vscode.commands.executeCommand('setContext', 'inactiveSelections', true)

         currentInactiveSelections = currentInactiveSelections.filter(
            (inactiveSelection) => inactiveSelection
         )
         currentInactiveSelections = newInactiveSelections.concat(currentInactiveSelections)

         inactiveSelections[docUriKey] = currentInactiveSelections

         vscode.window.visibleTextEditors.forEach((editor) => {
            if (editor.document.uri.toString() === docUriKey) {
               setMyDecorations(editor, inactiveSelections[docUriKey], {
                  cursorDecoration,
                  selectionDecoration,
                  eolSelectionDecoration
               })
            }
         })

         if (!inactiveSelections[docUriKey].length) {
            delete inactiveSelections[docUriKey]
            delete hiddenSelections[docUriKey]

            vscode.commands.executeCommand('setContext', 'inactiveSelections', false)
         }
      }
   )

   const activateSelections = vscode.commands.registerCommand('kcs.activateSelections', () => {
      const editor = vscode.window.activeTextEditor
      if (!editor) {
         return
      }

      const docUriKey = editor.document.uri.toString()
      if (!inactiveSelections[docUriKey] || hiddenSelections[docUriKey]) {
         return
      }

      const selections = inactiveSelections[docUriKey].map(
         (range) => new vscode.Selection(range.start, range.end)
      )
      vscode.window.visibleTextEditors.forEach((editor) => {
         if (editor.document.uri.toString() === docUriKey) {
            editor.selections = selections
         }
      })

      hiddenSelections[docUriKey] = true

      vscode.window.visibleTextEditors.forEach((editor) => {
         if (editor.document.uri.toString() === docUriKey) {
            unsetMyDecorations(editor, {
               cursorDecoration,
               selectionDecoration,
               eolSelectionDecoration
            })
         }
      })

      vscode.commands.executeCommand('setContext', 'inactiveSelections', false)

      if (selections.length === 1 && selections[0].start.isEqual(selections[0].end)) {
         delete inactiveSelections[docUriKey]
         delete hiddenSelections[docUriKey]
      }
   })

   const removeInactiveSelections = vscode.commands.registerCommand(
      'kcs.removeInactiveSelections',
      () => {
         const editor = vscode.window.activeTextEditor
         if (!editor) {
            return
         }

         const docUriKey = editor.document.uri.toString()

         vscode.window.visibleTextEditors.forEach((editor) => {
            if (editor.document.uri.toString() === docUriKey) {
               unsetMyDecorations(editor, {
                  cursorDecoration,
                  selectionDecoration,
                  eolSelectionDecoration
               })
            }
         })
         delete inactiveSelections[docUriKey]
         delete hiddenSelections[docUriKey]

         vscode.commands.executeCommand('setContext', 'inactiveSelections', false)
      }
   )

   context.subscriptions.push(
      placeInactiveSelection,
      activateSelections,
      removeInactiveSelections,
      cursorDecoration,
      selectionDecoration,
      eolSelectionDecoration,
      ...disposables
   )
}

const deactivate = () => {}

module.exports = {
   activate,
   deactivate
}
