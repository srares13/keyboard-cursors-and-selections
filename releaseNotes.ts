// import * as vscode from 'vscode'
// import * as semver from 'semver'

// const releaseNotesContent = require('./KCS_RELEASE_NOTES.md')
// const { outputChannel } = require('./utils')

// const VERSIONS_FOR_RELEASE_NOTES = ['1.1.0', '1.1.1', '1.1.2']

// const provider = {
//    provideTextDocumentContent(uri) {
//       return releaseNotesContent
//    }
// }
// const scheme = 'releaseNotes'
// vscode.workspace.registerTextDocumentContentProvider(scheme, provider)
// const virtualDocUri = vscode.Uri.parse(`${scheme}:///KCS_RELEASE_NOTES.md`)

// /**
//  * @param {vscode.ExtensionContext} context
//  */

// const showNotification = () => {
//    vscode.window
//       .showInformationMessage(
//          "KCS: New important changes! If it's your first install, you won't have to check Release Notes.",
//          'Release Notes'
//       )
//       .then((selection) => {
//          if (selection === 'Release Notes') {
//             vscode.commands.executeCommand('markdown.showPreview', virtualDocUri)
//          }
//       })
// }

// const notifyAboutReleaseNotes = (context) => {
//    const previousVersion = context.globalState.get('extensionVersion')
//    const currentVersion = vscode.extensions.getExtension('srares13.kcs').packageJSON.version

//    if (!previousVersion) {
//       showNotification()

//       context.globalState.update('extensionVersion', currentVersion)

//       return
//    }

//    if (semver.diff(previousVersion, currentVersion)) {
//       if (
//          semver.lt(previousVersion, currentVersion) &&
//          VERSIONS_FOR_RELEASE_NOTES.includes(currentVersion)
//       ) {
//          showNotification()
//       }

//       context.globalState.update('extensionVersion', currentVersion)
//    }
// }

// export { notifyAboutReleaseNotes, virtualDocUri }

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

      const panel = vscode.window.createWebviewPanel('markdownPreview', 'Markdown Preview', {
         viewColumn: vscode.ViewColumn.Beside,
         preserveFocus: true
      })

      panel.webview.html = htmlContent
   } catch (error) {
      vscode.window.showErrorMessage('There was an issue in showing KCS Release Notes.')
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
