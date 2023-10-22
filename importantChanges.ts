// #region | External imports
import * as vscode from 'vscode'
import { promises as fs } from 'fs'
import * as path from 'path'
import { marked } from 'marked'
import * as semver from 'semver'
// #endregion

// #region | Internal imports
import { outputChannel } from './utils'
// #endregion

// #region | Global Data
const VERSIONS_WITH_IMPORTANT_CHANGES = ['1.1.0', '1.2.0', '1.3.0']
// #endregion

const showImportantChanges = async (context: vscode.ExtensionContext) => {
   try {
      const workspacePath = process.env.WORKSPACE_PATH
      let filePath = undefined

      if (workspacePath) {
         filePath = path.join(workspacePath, './IMPORTANT_CHANGES.md')
      } else {
         const { extensionPath } = context

         filePath = path.join(extensionPath, './IMPORTANT_CHANGES.md')
      }

      const data = await fs.readFile(filePath, 'utf-8')

      const htmlContent = await marked(data, { async: true })

      const panel = vscode.window.createWebviewPanel('importantChanges', 'KCS Important Changes', {
         viewColumn: vscode.ViewColumn.Beside,
         preserveFocus: true
      })

      panel.webview.html = htmlContent
   } catch (error) {
      vscode.window.showErrorMessage('There was an issue in showing KCS Important Changes.')
      outputChannel.appendLine(error)
   }
}

const handleImportantChanges = (context: vscode.ExtensionContext) => {
   const previousVersion: string | undefined = context.globalState.get('extensionVersion')
   const currentVersion = vscode.extensions.getExtension('srares13.kcs').packageJSON.version

   if (!previousVersion) {
      context.globalState.update('extensionVersion', currentVersion)

      return
   }

   if (semver.diff(previousVersion, currentVersion)) {
      for (const version of VERSIONS_WITH_IMPORTANT_CHANGES) {
         if (semver.satisfies(version, `>${previousVersion} <=${currentVersion}`)) {
            showImportantChanges(context)
         }
      }

      context.globalState.update('extensionVersion', currentVersion)
   }
}

export { showImportantChanges, handleImportantChanges }
