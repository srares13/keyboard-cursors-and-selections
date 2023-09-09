# In a nutshell

### Create cursors and selections

![Create cursors and selections](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWcxcm9vZGdpcmVydzhjNnVlcHp2MmhsdmxkNzRndzAwcHU2NnY1YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nhmHtytEWzdUOVB68s/giphy.gif)

<br>

### And then activate them

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

1. Open the Command Palette (`Ctrl+Shift+P` - Windows, `Cmd+Shift+P` - Mac).

2. Search for and select `Preferences: Open Keyboard Shortcuts`.

3. Once the Shortcuts tab is open, search for the desired command, in this case `Place Inactive Selection` or `Activate Selections`, double click on it and press the new key combination.

<br>

### Notes

-  A cursor is actually just a selection which has the start and the end positions the same. This is useful to know further that when I'm saying "selections" I'm referring to cursors as well.

<br>

### Other features

<br>

-  Placing multiple inactive selections at once is also supported.

   ![Place multiple inactive selections at once](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmh1MG9qaWRmbGMyaGI0b3pnMm9hYjRoNHEydmg0MXVnZzIwYjg0cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/liMxQauYfMtQvplTQN/giphy.gif)

<br>

-  To remove all inactive selections, simply press `Esc`.

<br>

-  If you place an inactive selection over another, the existing one will be removed:

   ![Remove innactive selections](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejJsdW1nMTZwdDBuOGxlMWc4aXFmMWo5dThzYmgxc3lhZXNqZWtrYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/h4XtMmQyasU1rIAQPZ/giphy.gif)

<br>

-  If you discard the active selections, the inactive selections will reappear. This is because maybe you wanted to modify something about them, and this feature allows you to do that:

   ![Inactive selections reappear](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Zwc2tsb2RwczZobHNkamMwajMyZXU0dnA4ZHlsY3BubXNkNzFpaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XTo0ZNyw3jCEsN5gdJ/giphy.gif)

<br>

### Behaviours

-  When you start editing the file, the inactive selections will be removed.

<br>

### Extension limitations

These limitations are more technical and are handled to not constitute functionality breaking situations.

-  [Inactive selections visuals](https://github.com/srares13/keyboard-cursors-and-selections/issues/1)

-  [Uniquely identify editors with the same file](https://github.com/srares13/keyboard-cursors-and-selections/issues/2)
