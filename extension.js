// #region | External imports
const vscode = require('vscode')
// #endregion

// #region | Source code imports
const { createDecorations, MainDataObject, Action } = require('./utils')
const { notifyAboutReleaseNotes, virtualDocUri } = require('./releaseNotes')
// #endregion

// #region | Types
/**
 * @typedef {Object} Action
 * @property {'inactiveSelectionsPlaced'|'inactiveSelectionsRemoved'} type
 * @property {vscode.Range[]} ranges
 * @property {number} elementsCountToRemove
 */

/**
 * @typedef {Object} MainDataObject
 * @property {vscode.Range[]} inactiveSelections
 * @property {Action[]} actions
 * @property {number} actionIndex
 */
// #endregion

/**
 * @param {vscode.ExtensionContext} context
 */
const activate = (context) => {
   // #region | Global Data
   /** @type {Object<string, MainDataObject>} */
   const mainData = {}

   let { setMyDecorations, unsetMyDecorations } = createDecorations(
      vscode.workspace.getConfiguration('editor').get('fontSize')
   )

   const disposables = []

   vscode.commands.executeCommand('setContext', 'inactiveSelections', false)
   // #endregion

   notifyAboutReleaseNotes(context)

   vscode.workspace.onDidChangeConfiguration(
      (event) => {
         if (event.affectsConfiguration('editor.fontSize')) {
            const unsetMyPreviousDecorations = unsetMyDecorations

            ;({ setMyDecorations, unsetMyDecorations } = createDecorations(
               vscode.workspace.getConfiguration('editor').get('fontSize')
            ))

            for (const editor of vscode.window.visibleTextEditors) {
               const docUri = editor.document.uri.toString()
               const editorData = mainData[docUri]

               if (!editorData || !editorData.inactiveSelections.length) {
                  continue
               }

               unsetMyPreviousDecorations(editor)
               setMyDecorations(editor, editorData.inactiveSelections)
            }
         }
      },
      undefined,
      disposables
   )

   vscode.workspace.onDidChangeTextDocument(
      (event) => {
         const eventDocUri = event.document.uri.toString()
         const eventEditorData = mainData[eventDocUri]

         if (!eventEditorData || !eventEditorData.inactiveSelections.length) {
            return
         }

         const action = Action(
            'inactiveSelectionsRemoved',
            eventEditorData.inactiveSelections,
            eventEditorData.inactiveSelections.length
         )
         eventEditorData.actions.push(action)

         eventEditorData.inactiveSelections.length = 0

         for (const editor of vscode.window.visibleTextEditors) {
            if (editor.document.uri.toString() === eventDocUri) {
               unsetMyDecorations(editor)
            }
         }

         if (vscode.window.activeTextEditor.document.uri.toString() === eventDocUri) {
            vscode.commands.executeCommand('setContext', 'inactiveSelections', false)
         }
      },
      undefined,
      disposables
   )

   vscode.window.onDidChangeVisibleTextEditors(
      (visibleEditors) => {
         for (const editor of visibleEditors) {
            const docUri = editor.document.uri.toString()
            const editorData = mainData[docUri]

            if (!editorData || !editorData.inactiveSelections.length) {
               continue
            }

            setMyDecorations(editor, editorData.inactiveSelections)
         }
      },
      undefined,
      disposables
   )

   vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
         const activeDocUri = editor.document.uri.toString()
         const activeEditorData = mainData[activeDocUri]

         if (!activeEditorData || !activeEditorData.inactiveSelections.length) {
            vscode.commands.executeCommand('setContext', 'inactiveSelections', false)
            return
         }

         vscode.commands.executeCommand('setContext', 'inactiveSelections', true)
      },
      undefined,
      disposables
   )

   const placeInactiveSelection = vscode.commands.registerCommand(
      'kcs.placeInactiveSelection',
      () => {
         const activeEditor = vscode.window.activeTextEditor
         const activeDocUri = activeEditor.document.uri.toString()
         let activeEditorData = mainData[activeDocUri]

         if (!activeEditorData) {
            activeEditorData = MainDataObject()
         }
         const action = Action()

         let currentInactiveSelections = [...activeEditorData.inactiveSelections]
         const newInactiveSelections = []
         let commandShouldAddInactiveSelections = true

         activeEditor.selections.forEach((selection) => {
            let addInactiveSelection = true

            for (let i = 0; i < currentInactiveSelections.length; i++) {
               if (!currentInactiveSelections[i]) {
                  continue
               }

               if (selection.intersection(currentInactiveSelections[i])) {
                  if (
                     selection.start.isEqual(selection.end) ||
                     currentInactiveSelections[i].start.isEqual(currentInactiveSelections[i].end) ||
                     (!selection.start.isEqual(currentInactiveSelections[i].end) &&
                        !selection.end.isEqual(currentInactiveSelections[i].start))
                  ) {
                     currentInactiveSelections[i] = null
                     addInactiveSelection = false
                     commandShouldAddInactiveSelections = false
                  }
               }
            }

            if (addInactiveSelection) {
               const range = new vscode.Range(selection.start, selection.end)
               newInactiveSelections.push(range)
            }
         })

         if (commandShouldAddInactiveSelections) {
            newInactiveSelections.sort((inactiveSelection1, inactiveSelection2) =>
               inactiveSelection1.start.compareTo(inactiveSelection2.start)
            )

            action.type = 'inactiveSelectionsPlaced'
            action.indexToDeleteFrom = currentInactiveSelections.length
            action.ranges = newInactiveSelections

            currentInactiveSelections.push(...newInactiveSelections)
            inactiveSelections[activeDocUri] = currentInactiveSelections
         } else {
            action.type = 'inactiveSelectionsRemoved'

            currentInactiveSelections = currentInactiveSelections.filter((inactiveSelection, i) => {
               if (inactiveSelection) {
                  return true
               } else {
                  action.ranges.push(inactiveSelections[i])
                  return false
               }
            })

            action.indexToDeleteFrom = currentInactiveSelections.length

            inactiveSelections[activeDocUri] = currentInactiveSelections
         }

         actions.push(action)

         vscode.window.visibleTextEditors.forEach((editor) => {
            if (editor.document.uri.toString() === activeDocUri) {
               setMyDecorations(editor, inactiveSelections[activeDocUri], {
                  cursorDecoration,
                  selectionDecoration,
                  eolSelectionDecoration
               })
            }
         })

         if (inactiveSelections[activeDocUri].length) {
            vscode.commands.executeCommand('setContext', 'inactiveSelections', true)
         } else {
            delete inactiveSelections[activeDocUri]

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
      if (!inactiveSelections[docUriKey]) {
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

      // Can be disabled for tracking testing purposes
      delete inactiveSelections[docUriKey]

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
      // Can be disabled for tracking testing purposes - end
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

         hiddenSelections[docUriKey] = true
         vscode.commands.executeCommand('setContext', 'inactiveSelections', false)
      }
   )

   const showReleaseNotesDisposable = vscode.commands.registerCommand(
      'kcs.showReleaseNotes',
      () => {
         vscode.commands.executeCommand('markdown.showPreview', virtualDocUri)
      }
   )

   const undoInactiveSelections = vscode.commands.registerCommand(
      'kcs.undoInactiveSelections',
      () => {
         const docUri = vscode.window.activeTextEditor.document.uri.toString()
         const editorData = mainData[docUri]

         if (!editorData) {
            return
         }

         if (editorData.actionIndex === -1) {
            return
         }

         const action = editorData.actions[editorData.actionIndex]

         switch (action.type) {
            case 'inactiveSelectionsPlaced':
               editorData.inactiveSelections.splice(
                  editorData.inactiveSelections.length - action.elementsCountToRemove
               )

               for (const editor of vscode.window.visibleTextEditors) {
                  if (editor.document.uri.toString() === docUri) {
                     setMyDecorations(editor, editorData.inactiveSelections)
                  }
               }

               if (editorData.inactiveSelections.length === 0) {
                  vscode.commands.executeCommand('setContext', 'inactiveSelections', false)
               }

               editorData.actionIndex -= 1

               break

            case 'inactiveSelectionsRemoved':
               break
         }
      }
   )

   const redoInactiveSelections = vscode.commands.registerCommand(
      'kcs.redoInactiveSelections',
      () => {
         const docUri = vscode.window.activeTextEditor.document.uri.toString()
         const editorData = mainData[docUri]

         if (!editorData) {
            return
         }

         if (editorData.actionIndex + 1 === editorData.actions.length) {
            return
         }

         const action = editorData.actions[editorData.actionIndex + 1]

         switch (action.type) {
            case 'inactiveSelectionsPlaced':
               editorData.inactiveSelections.push(...action.ranges)

               for (const editor of vscode.window.visibleTextEditors) {
                  if (editor.document.uri.toString() === docUri) {
                     setMyDecorations(editor, editorData.inactiveSelections)
                  }
               }

               vscode.commands.executeCommand('setContext', 'inactiveSelections', true)

               editorData.actionIndex += 1

               break

            case 'inactiveSelectionsRemoved':
               break
         }
      }
   )

   context.subscriptions.push(
      placeInactiveSelection,
      activateSelections,
      removeInactiveSelections,
      showReleaseNotesDisposable,
      undoInactiveSelections,
      redoInactiveSelections,
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
