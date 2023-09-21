import * as vscode from 'vscode'

// import * as semver from 'semver'
const semver = require('semver')

const releaseNotesContent = require('./KCS_RELEASE_NOTES.md')
const { outputChannel } = require('./utils')

const VERSIONS_FOR_RELEASE_NOTES = ['1.1.0', '1.1.1', '1.1.2']

const provider = {
   provideTextDocumentContent(uri) {
      return releaseNotesContent
   }
}
const scheme = 'releaseNotes'
vscode.workspace.registerTextDocumentContentProvider(scheme, provider)
const virtualDocUri = vscode.Uri.parse(`${scheme}:///KCS_RELEASE_NOTES.md`)

/**
 * @param {vscode.ExtensionContext} context
 */

const showNotification = () => {
   vscode.window
      .showInformationMessage(
         "KCS: New important changes! If it's your first install, you won't have to check Release Notes.",
         'Release Notes'
      )
      .then((selection) => {
         if (selection === 'Release Notes') {
            vscode.commands.executeCommand('markdown.showPreview', virtualDocUri)
         }
      })
}

const notifyAboutReleaseNotes = (context) => {
   const previousVersion = context.globalState.get('extensionVersion')
   const currentVersion = vscode.extensions.getExtension('srares13.kcs').packageJSON.version

   if (!previousVersion) {
      showNotification()

      context.globalState.update('extensionVersion', currentVersion)

      return
   }

   if (semver.diff(previousVersion, currentVersion)) {
      if (
         semver.lt(previousVersion, currentVersion) &&
         VERSIONS_FOR_RELEASE_NOTES.includes(currentVersion)
      ) {
         showNotification()
      }

      context.globalState.update('extensionVersion', currentVersion)
   }
}

module.exports = { notifyAboutReleaseNotes, virtualDocUri }
