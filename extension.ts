// #region | External imports
import * as vscode from 'vscode'
// #endregion

// #region | Internal imports
import {
   createDecorations,
   MainDataObject,
   InactiveSelectionsPlacedAction,
   InactiveSelectionsRemovedAction
} from './utils'
import { handleImportantChanges, showImportantChanges } from './importantChanges'

// #endregion

const activate = (context: vscode.ExtensionContext) => {
   // #region | Global Data
   const mainData: { [key: string]: MainDataObject } = {}

   let { setMyDecorations, unsetMyDecorations, disposeDecorations } = createDecorations()

   const disposables = []

   vscode.commands.executeCommand('setContext', 'inactiveSelections', false)
   // #endregion

   handleImportantChanges(context)

   vscode.workspace.onDidChangeConfiguration(
      (event) => {
         if (
            event.affectsConfiguration('editor.fontSize') ||
            event.affectsConfiguration('kcs.cursorColor') ||
            event.affectsConfiguration('kcs.selectionColor')
         ) {
            const previousUnsetMyDecorations = unsetMyDecorations
            const previousDisposeDecorations = disposeDecorations

            ;({ setMyDecorations, unsetMyDecorations, disposeDecorations } = createDecorations())

            for (const visibleEditor of vscode.window.visibleTextEditors) {
               const visibleDocUri = visibleEditor.document.uri.toString()
               const visibleEditorData = mainData[visibleDocUri]

               if (!visibleEditorData || !visibleEditorData.inactiveSelections.length) {
                  continue
               }

               previousUnsetMyDecorations(visibleEditor)
               setMyDecorations(visibleEditor, visibleEditorData.inactiveSelections)
            }

            previousDisposeDecorations()
         }
      },
      undefined,
      disposables
   )

   vscode.workspace.onDidChangeTextDocument(
      (event) => {
         // When a document is saved, this event is also triggered.
         // But if the document is only saved and no edit is performed,
         // then the inactive selections and their history should not disappear.
         if (event.contentChanges.length === 0) {
            return
         }

         const eventDocUri = event.document.uri.toString()
         const eventEditorData = mainData[eventDocUri]

         if (!eventEditorData) {
            return
         }

         eventEditorData.inactiveSelections = []
         eventEditorData.actions = []
         eventEditorData.actionIndex = -1

         for (const visibleEditor of vscode.window.visibleTextEditors) {
            if (visibleEditor.document.uri.toString() === eventDocUri) {
               unsetMyDecorations(visibleEditor)
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
         for (const visibleEditor of visibleEditors) {
            const visibleDocUri = visibleEditor.document.uri.toString()
            const visibleEditorData = mainData[visibleDocUri]

            if (!visibleEditorData || !visibleEditorData.inactiveSelections.length) {
               continue
            }

            setMyDecorations(visibleEditor, visibleEditorData.inactiveSelections)
         }
      },
      undefined,
      disposables
   )

   vscode.window.onDidChangeActiveTextEditor(
      (editor) => {
         if (!editor) {
            return
         } // This is because when you change the active editor, this event fires multiple times for a single change.
         // Some of those events have their belonging editors as undefined.

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
            mainData[activeDocUri] = new MainDataObject()
         }
         const activeEditorData = mainData[activeDocUri]

         // let action: InactiveSelectionsPlaced | InactiveSelectionsRemoved
         let action

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

            currentInactiveSelections.push(...newInactiveSelections)
            activeEditorData.inactiveSelections = currentInactiveSelections

            const inactiveSelectionsPlacedAction = new InactiveSelectionsPlacedAction()
            inactiveSelectionsPlacedAction.ranges = newInactiveSelections
            inactiveSelectionsPlacedAction.elementsCountToRemove = newInactiveSelections.length
            action = inactiveSelectionsPlacedAction
         } else {
            const inactiveSelectionsRemovedAction = new InactiveSelectionsRemovedAction()

            currentInactiveSelections = currentInactiveSelections.filter((inactiveSelection, i) => {
               if (inactiveSelection) {
                  return true
               } else {
                  inactiveSelectionsRemovedAction.rangesAndIndexes.push({
                     index: i,
                     range: activeEditorData.inactiveSelections[i]
                  })
                  return false
               }
            })

            activeEditorData.inactiveSelections = currentInactiveSelections

            action = inactiveSelectionsRemovedAction
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

      const action = new InactiveSelectionsRemovedAction()
      for (let i = 0; i < activeEditorData.inactiveSelections.length; i++) {
         action.rangesAndIndexes.push({ index: i, range: activeEditorData.inactiveSelections[i] })
      }

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

         const action = new InactiveSelectionsRemovedAction()
         for (let i = 0; i < activeEditorData.inactiveSelections.length; i++) {
            action.rangesAndIndexes.push({
               index: i,
               range: activeEditorData.inactiveSelections[i]
            })
         }

         activeEditorData.actions.splice(activeEditorData.actionIndex + 1)
         activeEditorData.actions.push(action)
         activeEditorData.actionIndex++

         activeEditorData.inactiveSelections = []
      }
   )

   const showImportantChangesDisposable = vscode.commands.registerCommand(
      'kcs.showImportantChanges',
      () => {
         showImportantChanges(context)
      }
   )

   const undo = vscode.commands.registerCommand('kcs.undo', () => {
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

         // the undo of this means placing back
         case 'inactiveSelectionsRemoved':
            for (const rangeAndIndex of action.rangesAndIndexes) {
               activeEditorData.inactiveSelections.splice(
                  rangeAndIndex.index,
                  0,
                  rangeAndIndex.range
               )
            }

            for (const visibleEditor of vscode.window.visibleTextEditors) {
               if (visibleEditor.document.uri.toString() === activeDocUri) {
                  setMyDecorations(visibleEditor, activeEditorData.inactiveSelections)
               }
            }

            vscode.commands.executeCommand('setContext', 'inactiveSelections', true)

            activeEditorData.actionIndex--

            break
      }
   })

   const redo = vscode.commands.registerCommand('kcs.redo', () => {
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
            for (const rangeAndIndex of action.rangesAndIndexes) {
               activeEditorData.inactiveSelections[rangeAndIndex.index] = null
            }

            activeEditorData.inactiveSelections = activeEditorData.inactiveSelections.filter(
               (inactiveSelection) => inactiveSelection
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
   })

   context.subscriptions.push(
      placeInactiveSelection,
      activateSelections,
      removeInactiveSelections,
      showImportantChangesDisposable,
      undo,
      redo,
      ...disposables
   )
}

const deactivate = () => {}

export { activate, deactivate }
