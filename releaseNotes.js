const vscode = require('vscode')
const semver = require('semver')

const releaseNotesContent = require('./KCS_RELEASE_NOTES.md')

const VERSIONS_FOR_RELEASE_NOTES = ['1.1.0']

/**
 * @param {vscode.ExtensionContext} context
 */

const showReleaseNotes = (context) => {
   const previousVersion = context.globalState.get('extensionVersion')
   const currentVersion = vscode.extensions.getExtension('srares13.kcs').packageJSON.version

   if (!previousVersion) {
      context.globalState.update('extensionVersion', currentVersion)

      return
   }

   if (semver.diff(previousVersion, currentVersion)) {
      if (
         semver.lt(previousVersion, currentVersion) &&
         VERSIONS_FOR_RELEASE_NOTES.includes(currentVersion)
      ) {
         const provider = {
            provideTextDocumentContent(uri) {
               return releaseNotesContent
            }
         }

         const scheme = 'releaseNotes'

         vscode.workspace.registerTextDocumentContentProvider(scheme, provider)

         const virtualDocUri = vscode.Uri.parse(`${scheme}:///KCS_RELEASE_NOTES.md`)

         vscode.window
            .showInformationMessage('KCS: New important changes', 'Release Notes')
            .then((selection) => {
               if (selection === 'Release Notes') {
                  vscode.commands.executeCommand('markdown.showPreview', virtualDocUri)
               }
            })
      }

      context.globalState.update('extensionVersion', currentVersion)
   }
}

module.exports = { showReleaseNotes }
