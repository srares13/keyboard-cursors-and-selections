# In a nutshell

### Create cursors and selections

![Create cursors and selections](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWcxcm9vZGdpcmVydzhjNnVlcHp2MmhsdmxkNzRndzAwcHU2NnY1YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nhmHtytEWzdUOVB68s/giphy.gif)

<br>

### And activate them

![And then activate them](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZiZHJ2aHR0dnFkb2h0bnNvamg5andmdXZpNHdzOGNjc3R2dWxkeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tFsUvTNgfTILb8IooB/giphy.gif)

<br>

### Everything is done with two commands

-  Create inactive cursors and selections with `Place Inactive Selection` command.

-  Activate the cursors and selections with `Activate Selections` command.

-  By default they are mapped to `PageDown` and `PageUp` respectively. If you need help in remapping them, check below.

<br>
<br>
<br>

# Read more

### Feedback

For questions, suggestions, issues, feel free to use the [Issues](https://github.com/srares13/keyboard-cursors-and-selections/issues) section of the extension's repository.

<br>

### If you want to remap the commands

1. Open the Command Palette (Windows/Linux: `Ctrl+Shift+P`, Mac: `Cmd+Shift+P`).

2. Search for and select `Preferences: Open Keyboard Shortcuts`.

3. Once the Shortcuts tab is open, search for the desired command, for example `Place Inactive Selection`, double click on it and press the new key combination.

<br>

### Notes

-  A cursor is actually just a selection which has the start and the end positions the same. This is useful to know further that when I'm saying "selections" I'm referring to cursors as well.

<br>

### Other features

-  **Placing multiple inactive selections at once is also supported**

   ![Place multiple inactive selections at once](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmh1MG9qaWRmbGMyaGI0b3pnMm9hYjRoNHEydmg0MXVnZzIwYjg0cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/liMxQauYfMtQvplTQN/giphy.gif)

<br>

-  **To remove all inactive selections, simply press `Esc`**

<br>

-  **If you place an inactive selection over another, the existing one will be removed**

   ![Remove innactive selections](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejJsdW1nMTZwdDBuOGxlMWc4aXFmMWo5dThzYmgxc3lhZXNqZWtrYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/h4XtMmQyasU1rIAQPZ/giphy.gif)

<br>

-  **Undo-Redo system**

   -  It registers all actions that have as effect placing or removing inactive selections. The inactive selections can be undone or redone via two commands:

   -  `KCS: Undo`. By default this is mapped to Windows/Linux: `alt+shift+z`, Mac: `option+shift+z`.
   -  `KCS: Redo`. By default this is mapped to Windows/Linux: `alt+shift+y`, Mac: `option+shift+y`.

<br>

-  **Experimental: Inactive selections react to document edits**

   -  When you make edits to the document, the inacitve selections will move across the document in accordance with those edits. If this feature is disabled, the inactive selections will disappear on document edits.

   -  This feature is also integrated with the Undo-Redo system, meaning that the undone or redone inactive selections will respect the new document edits.

   -  If you wish to enable or disable this feature, it is found in VS Code Settings under the name `Kcs: Inactive Selections React To Document Edits`. By default it is enabled because this is intended to be a core behavior of the extension.

   -  Please report any issues you have about this experimental feature.

<br>

-  **You can change the colors of the inactive cursors and selections**

   1. Open the Command Palette (Windows/Linux: `Ctrl+Shift+P`, Mac: `Cmd+Shift+P`).

   2. Search for and select `Preferences: Open Settingts (UI)`.

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

### Extension limitations

These limitations are more technical and are handled to not constitute functionality breaking situations.

-  [Inactive selections visuals](https://github.com/srares13/keyboard-cursors-and-selections/issues/1)

-  [Uniquely identify editors with the same file](https://github.com/srares13/keyboard-cursors-and-selections/issues/2)

<br>

### Next updates

-  In the coming updates I will gradually comment the code of this extension by explaining why each piece of the code is there. This is to raise the chances of this project being maintained by others, especially if it happens that I will no longer be part of it.
