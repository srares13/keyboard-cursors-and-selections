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

const showReleaseNotes = async (context: vscode.ExtensionContext) => {
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

const handleReleaseNotes = (context: vscode.ExtensionContext) => {
   const previousVersion: string | undefined = context.globalState.get('extensionVersion')
   const currentVersion = vscode.extensions.getExtension('srares13.kcs').packageJSON.version

   if (!previousVersion) {
      context.globalState.update('extensionVersion', currentVersion)

      return
   }

   if (semver.diff(previousVersion, currentVersion)) {
      if (semver.lt(previousVersion, currentVersion)) {
         showReleaseNotes(context)
      }

      context.globalState.update('extensionVersion', currentVersion)
   }
}

export { showReleaseNotes, handleReleaseNotes }
