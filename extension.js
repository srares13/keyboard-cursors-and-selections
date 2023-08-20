const vscode = require('vscode')

const { createDecorations, setMyDecorations, unsetMyDecorations } = require('./utils')
const { notifyAboutReleaseNotes, virtualDocUri } = require('./releaseNotes')
// const { getUpdatedRanges } = require('vscode-range-tracking')

const { getUpdatedRanges } = require('./rangeTracking')

/**
 * @param {vscode.ExtensionContext} context
 */
const activate = (context) => {
   /** @type {Object<string, vscode.Range[]>} */
   const inactiveSelections = {}

   /** @type {Object<string, boolean>} */
   const hiddenSelections = {}

   let { cursorDecoration, selectionDecoration, eolSelectionDecoration } = createDecorations(
      vscode.workspace.getConfiguration('editor').get('fontSize')
   )

   const disposables = []

   vscode.commands.executeCommand('setContext', 'inactiveSelections', false)

   notifyAboutReleaseNotes(context)

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
         // Previous logic before tracking
         // const key = event.document.uri.toString()
         // if (inactiveSelections[key]) {
         //    delete inactiveSelections[key]
         //    delete hiddenSelections[key]
         //    vscode.window.visibleTextEditors.forEach((editor) => {
         //       if (editor.document.uri.toString() === key) {
         //          unsetMyDecorations(editor, {
         //             cursorDecoration,
         //             selectionDecoration,
         //             eolSelectionDecoration
         //          })
         //       }
         //    })
         //    vscode.commands.executeCommand('setContext', 'inactiveSelections', false)
         // }
         // Previous logic before tracking - end

         const docUriKey = event.document.uri.toString()

         if (!inactiveSelections[docUriKey]) {
            return
         }

         inactiveSelections[docUriKey] = getUpdatedRanges(
            inactiveSelections[docUriKey],
            event.contentChanges
         )
         vscode.window.visibleTextEditors.forEach((editor) => {
            if (editor.document.uri.toString() === docUriKey) {
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

         const currentInactiveSelections = inactiveSelections[docUriKey]
            ? [...inactiveSelections[docUriKey]]
            : []

         /** @type {vscode.Range[]} */
         const newInactiveSelections = []
         const currentInactiveSelectionsWithRemoved = [...currentInactiveSelections]

         editor.selections.forEach((selection) => {
            let addInactiveSelection = true

            for (let i = 0; i < currentInactiveSelections.length; i++) {
               if (selection.intersection(currentInactiveSelections[i])) {
                  if (
                     selection.start.isEqual(selection.end) ||
                     currentInactiveSelections[i].start.isEqual(currentInactiveSelections[i].end)
                  ) {
                     currentInactiveSelectionsWithRemoved[i] = null
                     addInactiveSelection = false
                  } else if (
                     !selection.start.isEqual(currentInactiveSelections[i].end) &&
                     !selection.end.isEqual(currentInactiveSelections[i].start)
                  ) {
                     currentInactiveSelectionsWithRemoved[i] = null
                     addInactiveSelection = false
                  }
               }
            }

            if (addInactiveSelection) {
               const range = new vscode.Range(selection.start, selection.end)
               newInactiveSelections.push(range)
            }
         })

         const unremovedInactiveSelections = currentInactiveSelectionsWithRemoved.filter(
            (inactiveSelection) => inactiveSelection
         )

         if (unremovedInactiveSelections.length === currentInactiveSelections.length) {
            newInactiveSelections.sort((inactiveSelection1, inactiveSelection2) =>
               inactiveSelection1.start.compareTo(inactiveSelection2.start)
            )
            inactiveSelections[docUriKey] =
               unremovedInactiveSelections.concat(newInactiveSelections)
         } else {
            inactiveSelections[docUriKey] = unremovedInactiveSelections
         }

         vscode.window.visibleTextEditors.forEach((editor) => {
            if (editor.document.uri.toString() === docUriKey) {
               setMyDecorations(editor, inactiveSelections[docUriKey], {
                  cursorDecoration,
                  selectionDecoration,
                  eolSelectionDecoration
               })
            }
         })

         if (inactiveSelections[docUriKey].length) {
            hiddenSelections[docUriKey] = false
            vscode.commands.executeCommand('setContext', 'inactiveSelections', true)
         } else {
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

      // Disabled for tracking testing purposes
      // hiddenSelections[docUriKey] = true

      // vscode.window.visibleTextEditors.forEach((editor) => {
      //    if (editor.document.uri.toString() === docUriKey) {
      //       unsetMyDecorations(editor, {
      //          cursorDecoration,
      //          selectionDecoration,
      //          eolSelectionDecoration
      //       })
      //    }
      // })

      // vscode.commands.executeCommand('setContext', 'inactiveSelections', false)
      // Disabled for tracking testing purposes - end

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

   const showReleaseNotesDisposable = vscode.commands.registerCommand(
      'kcs.showReleaseNotes',
      () => {
         vscode.commands.executeCommand('markdown.showPreview', virtualDocUri)
      }
   )

   context.subscriptions.push(
      placeInactiveSelection,
      activateSelections,
      removeInactiveSelections,
      showReleaseNotesDisposable,
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
