<br>

## 1.4.0 (Nov 13 2023)

### Experimental: Inactive selections react to document edits

-  When you make edits to the document, the inacitve selections will move across the document in accordance with those edits.

-  This feature is also integrated with the Undo-Redo system, meaning that the undone or redone inactive selections will respect the new document edits.

-  If you wish to enable or disable this feature, it is found in VS Code Settings under the name `Kcs: Inactive Selections React To Document Edits`. By default it is enabled because this is intended to be a core behavior of the extension.

-  Please report any issues you have about this experimental feature.

### Fixed issues

-  On simple file save which does not format the document, the inactive selections should not disappear. This is regardless whether you have `Kcs: Inactive Selections React To Document Edits` enabled or not.

<br>
<br>
<br>

## 1.3.0 (Oct 22 2023)

### You can change the colors of the inactive cursors and selections

1. Open the Command Palette (Windows/Linux: `Ctrl+Shift+P`, Mac: `Cmd+Shift+P`).

2. Search for and select `Preferences: Open Settings (UI)`.

3. Once the settings view is open, type "kcs" and options like `Kcs: Cursor Color` and `Kcs: Selection Color` will appear. Their value has to be given in hex code.

<br>

-  For developers who want to change these colors through their theme, this is an example of how you could do it:

   ```javascript
   const configuration = vscode.workspace.getConfiguration('kcs')
   await configuration.update('cursorColor', '#ff0000', vscode.ConfigurationTarget.Global)
   await configuration.update('selectionColor', '#ff000099', vscode.ConfigurationTarget.Global)
   ```

   Note that you can use transparency, especially for the selection color.

<br>
<br>
<br>

## 1.2.0 (Oct 06 2023)

### New feature: Undo-Redo system

-  It targets all actions that have as effect placing or removing inactive selections. Those effects can be undone or redone via two commands:

   -  `KCS: Undo`. By default this is mapped to Windows/Linux: `alt+shift+z`, Mac: `option+shift+z`.
   -  `KCS: Redo`. By default this is mapped to Windows/Linux: `alt+shift+y`, Mac: `option+shift+y`.

<br>

-  This being siad, to keep things simpler, the feature _"If you discard the active selections, the inactive selections will reappear"_ will be dropped. Now you can do that on demand, by hitting the `KCS: Undo` command.

<br>
<br>
<br>

## 1.1.0 (Aug 14 2023)

### Behaviour changes

-  When you you place an inactive selection over another, it will only remove the existing one and not place a new one. The reason for this change is to have a universal behaviour. We already had this behaviour when you perfectly matched an inactive selection. But now you'll know what to expect in each situation when an inactive selection is placed over another (intersected in any way with another), it will only remove the existing one.

   ![Remove innactive selections](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejJsdW1nMTZwdDBuOGxlMWc4aXFmMWo5dThzYmgxc3lhZXNqZWtrYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/h4XtMmQyasU1rIAQPZ/giphy.gif)

<br>

-  When the inactive selections are activated and then discarded, the selection which remains is the one whose inactive selection was placed first. This behaviour is in accordance with how VS Code handles this when you place multiple selections with the mouse and then discard them.

<br>

### Fixed issues

-  Fixed an issue when placing multiple inactive selections at once did not work as expected when in some selected places there already were existing inactive selections and in others not.

<br>
<br>
<br>
