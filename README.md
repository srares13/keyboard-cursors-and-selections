# In a nutshell

### Place inactive cursors and selections

![Create cursors and selections](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWcxcm9vZGdpcmVydzhjNnVlcHp2MmhsdmxkNzRndzAwcHU2NnY1YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nhmHtytEWzdUOVB68s/giphy.gif)

<br>

### And activate them on demand

![And then activate them](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZiZHJ2aHR0dnFkb2h0bnNvamg5andmdXZpNHdzOGNjc3R2dWxkeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tFsUvTNgfTILb8IooB/giphy.gif)

<br>

### Everything is done with two commands

-  Place inactive cursors and selections with `KCS: Place Inactive Selection` command.

-  Inactive cursors and selections are activated with `KCS: Activate Selections` command.

-  By default the commands are mapped to `PageDown` and `PageUp` respectively. If you need help in remapping them, check below.

<br>
<br>
<br>

# Read more

### Feedback

For questions, suggestions, issues, feel free to use the [Issues](https://github.com/srares13/keyboard-cursors-and-selections/issues) section of the extension's repository.

<br>

### If you want to remap the commands

1. Open the Command Palette (Windows/Linux: `Ctrl + Shift + P`, Mac: `Cmd + Shift + P`).

2. Search for and select `Preferences: Open Keyboard Shortcuts`.

3. Once the Shortcuts tab is open, search for the desired command, for example `Place Inactive Selection`, double click on it and press the new key combination.

<br>

### Other features

-  **Placing multiple inactive cusors and selections at once is also supported**

   ![Place multiple inactive selections at once](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmh1MG9qaWRmbGMyaGI0b3pnMm9hYjRoNHEydmg0MXVnZzIwYjg0cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/liMxQauYfMtQvplTQN/giphy.gif)

<br>

-  **To remove all inactive cursors and selections, simply press `Esc`**

<br>

-  **If you place an inactive cursor or selection over another, the existing one will be removed**

   ![Remove innactive selections](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejJsdW1nMTZwdDBuOGxlMWc4aXFmMWo5dThzYmgxc3lhZXNqZWtrYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/h4XtMmQyasU1rIAQPZ/giphy.gif)

<br>

-  **Undo-Redo system**

   It registers all actions that have as effect placing or removing inactive cursors and selections. These can be undone or redone via two commands:

   -  `KCS: Undo`

      Default mapping: Windows/Linux: `alt + shift + z`, Mac: `option + shift + z`.

   -  `KCS: Redo`

      Default mapping: Windows/Linux: `alt + shift + y`, Mac: `option + shift + y`.

   ![Undo-Redo system](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW14MmRnZnoyMjQ3cGpmYXBpZmxhZHI3azZ6d2Z1MTMwZ2c0cXRvdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/bTsVyc9PKsxkb7XLyN/giphy.gif)

<br>

-  **Experimental: Inactive cursors and selections react to document edits**

   When you make edits to the document, the inacitve cursors and selections will move across the document in accordance with those edits.

   ![Inactive cursors and selections react to document edits](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXd0ZGRkNGZkcjMzZjM0aXQ1dWNxam54azQ1dDZ2d256MDFrb2wzZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/SXNRBjr7H1cWx2yPYY/giphy.gif)

   This feature is also integrated with the Undo-Redo system, meaning that the undone or redone inactive cursors and selections will respect the new document edits.

   ![The "inactive cursors and selections react to document edits" feature is integrated with the Undo-Redo system. Example 1](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExODloOW52dWFnOXh3cGI2eGtidzI4c2dtbm0zam1tZHFnZDJzeWp5YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lFJMLB1R2lFhN2Y4qV/source.gif)

   ![The "inactive cursors and selections react to document edits" feature is integrated with the Undo-Redo system. Example 2](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXJmcjRyeWZqMTIzMWhyZXZhbjhzeWNhMDQwM3FlaWp2NzhzbHo1YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/EppoxJ1HKZypJqCYTI/source.gif)

   By default this feature is enabled. If you wish to disable this, it is found in VS Code Settings under the name `Kcs: Inactive Selections React To Document Edits`.

   Please report any issues you have about this experimental feature.

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

These extension's limitations are derived from the limitations of the VS Code Extension API itself, but they are handled to minimize as much as possible their inconvenience.

-  [Inactive selections visuals](https://github.com/srares13/keyboard-cursors-and-selections/issues/1)

-  [Uniquely identify editors with the same file](https://github.com/srares13/keyboard-cursors-and-selections/issues/2)

<br>
