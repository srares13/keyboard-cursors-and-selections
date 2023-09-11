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
 * @property {number|undefined} actionIndex
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

         // const action = Action(
         //    'inactiveSelectionsRemoved',
         //    eventEditorData.inactiveSelections,
         //    eventEditorData.inactiveSelections.length
         // )
         // eventEditorData.actions.push(action)
         // eventEditorData.actionIndex++

         eventEditorData.inactiveSelections = []
         eventEditorData.actions = []
         eventEditorData.actionIndex = -1

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

         if (!mainData[activeDocUri]) {
            mainData[activeDocUri] = MainDataObject()
         }
         const activeEditorData = mainData[activeDocUri]

         const action = Action()

         let currentInactiveSelections = [...activeEditorData.inactiveSelections]
         const newInactiveSelections = []
         let commandShouldAddInactiveSelections = true

         for (const selection of activeEditor.selections) {
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

            if (commandShouldAddInactiveSelections && addInactiveSelection) {
               const range = new vscode.Range(selection.start, selection.end)
               newInactiveSelections.push(range)
            }
         }

         if (commandShouldAddInactiveSelections) {
            newInactiveSelections.sort((inactiveSelection1, inactiveSelection2) =>
               inactiveSelection1.start.compareTo(inactiveSelection2.start)
            )

            action.type = 'inactiveSelectionsPlaced'
            action.ranges = newInactiveSelections
            action.elementsCountToRemove = newInactiveSelections.length

            currentInactiveSelections.push(...newInactiveSelections)
            activeEditorData.inactiveSelections = currentInactiveSelections
         } else {
            action.type = 'inactiveSelectionsRemoved'

            currentInactiveSelections = currentInactiveSelections.filter((inactiveSelection, i) => {
               if (inactiveSelection) {
                  return true
               } else {
                  action.ranges.push(activeEditorData.inactiveSelections[i])
                  return false
               }
            })

            action.elementsCountToRemove = action.ranges.length

            activeEditorData.inactiveSelections = currentInactiveSelections
         }

         activeEditorData.actions.splice(activeEditorData.actionIndex + 1)
         activeEditorData.actions.push(action)
         activeEditorData.actionIndex++

         for (const editor of vscode.window.visibleTextEditors) {
            if (editor.document.uri.toString() === activeDocUri) {
               setMyDecorations(editor, activeEditorData.inactiveSelections)
            }
         }

         if (activeEditorData.inactiveSelections.length) {
            vscode.commands.executeCommand('setContext', 'inactiveSelections', true)
         } else {
            vscode.commands.executeCommand('setContext', 'inactiveSelections', false)
         }
      }
   )

   const activateSelections = vscode.commands.registerCommand('kcs.activateSelections', () => {
      const activeDocUri = vscode.window.activeTextEditor.document.uri.toString()
      const activeEditorData = mainData[activeDocUri]

      if (!activeEditorData || !activeEditorData.inactiveSelections.length) {
         return
      }

      const selections = activeEditorData.inactiveSelections.map(
         (range) => new vscode.Selection(range.start, range.end)
      )

      for (const visibleEditor of vscode.window.visibleTextEditors) {
         if (visibleEditor.document.uri.toString() === activeDocUri) {
            visibleEditor.selections = selections
            unsetMyDecorations(visibleEditor)
         }
      }

      vscode.commands.executeCommand('setContext', 'inactiveSelections', false)

      const action = Action()
      action.type = 'inactiveSelectionsRemoved'
      action.ranges = activeEditorData.inactiveSelections
      action.elementsCountToRemove = activeEditorData.inactiveSelections.length
      activeEditorData.actions.splice(activeEditorData.actionIndex + 1)
      activeEditorData.actions.push(action)
      activeEditorData.actionIndex++

      activeEditorData.inactiveSelections = []
   })

   const removeInactiveSelections = vscode.commands.registerCommand(
      'kcs.removeInactiveSelections',
      () => {
         const activeDocUri = vscode.window.activeTextEditor.document.uri.toString()
         const activeEditorData = mainData[activeDocUri]

         if (!activeEditorData || !activeEditorData.inactiveSelections.length) {
            return
         }

         for (const visibleEditor of vscode.window.visibleTextEditors) {
            if (visibleEditor.document.uri.toString() === activeDocUri) {
               unsetMyDecorations(visibleEditor)
            }
         }

         vscode.commands.executeCommand('setContext', 'inactiveSelections', false)

         const action = Action()
         action.type = 'inactiveSelectionsRemoved'
         action.ranges = activeEditorData.inactiveSelections
         action.elementsCountToRemove = activeEditorData.inactiveSelections.length
         activeEditorData.actions.splice(activeEditorData.actionIndex + 1)
         activeEditorData.actions.push(action)
         activeEditorData.actionIndex++

         activeEditorData.inactiveSelections = []
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
         const activeDocUri = vscode.window.activeTextEditor.document.uri.toString()
         const activeEditorData = mainData[activeDocUri]

         if (!activeEditorData || activeEditorData.actionIndex === -1) {
            return
         }

         const action = activeEditorData.actions[activeEditorData.actionIndex]

         switch (action.type) {
            case 'inactiveSelectionsPlaced':
               activeEditorData.inactiveSelections.splice(
                  activeEditorData.inactiveSelections.length - action.elementsCountToRemove
               )

               for (const visibleEditor of vscode.window.visibleTextEditors) {
                  if (visibleEditor.document.uri.toString() === activeDocUri) {
                     setMyDecorations(visibleEditor, activeEditorData.inactiveSelections)
                  }
               }

               if (!activeEditorData.inactiveSelections.length) {
                  vscode.commands.executeCommand('setContext', 'inactiveSelections', false)
               }

               activeEditorData.actionIndex--

               break

            case 'inactiveSelectionsRemoved':
               activeEditorData.inactiveSelections.push([...action.ranges])

               for (const visibleEditor of vscode.window.visibleTextEditors) {
                  if (visibleEditor.document.uri.toString() === activeDocUri) {
                     setMyDecorations(visibleEditor, activeEditorData.inactiveSelections)
                  }
               }

               vscode.commands.executeCommand('setContext', 'inactiveSelections', true)

               activeEditorData.actionIndex--

               break
         }
      }
   )

   const redoInactiveSelections = vscode.commands.registerCommand(
      'kcs.redoInactiveSelections',
      () => {
         const activeDocUri = vscode.window.activeTextEditor.document.uri.toString()
         const activeEditorData = mainData[activeDocUri]

         if (
            !activeEditorData ||
            activeEditorData.actionIndex + 1 === activeEditorData.actions.length
         ) {
            return
         }

         const action = activeEditorData.actions[activeEditorData.actionIndex + 1]

         switch (action.type) {
            case 'inactiveSelectionsPlaced':
               activeEditorData.inactiveSelections.push(...action.ranges)

               for (const visibleEditor of vscode.window.visibleTextEditors) {
                  if (visibleEditor.document.uri.toString() === activeDocUri) {
                     setMyDecorations(visibleEditor, activeEditorData.inactiveSelections)
                  }
               }

               vscode.commands.executeCommand('setContext', 'inactiveSelections', true)

               activeEditorData.actionIndex++

               break

            case 'inactiveSelectionsRemoved':
               activeEditorData.inactiveSelections.splice(
                  activeEditorData.inactiveSelections.length - action.elementsCountToRemove
               )

               for (const visibleEditor of vscode.window.visibleTextEditors) {
                  if (visibleEditor.document.uri.toString() === activeDocUri) {
                     setMyDecorations(visibleEditor, activeEditorData.inactiveSelections)
                  }
               }

               if (!activeEditorData.inactiveSelections.length) {
                  vscode.commands.executeCommand('setContext', 'inactiveSelections', false)
               }

               activeEditorData.actionIndex++

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
