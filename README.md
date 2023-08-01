# In a nutshell

### Create cursors and selections

![Create cursors and selections](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWcxcm9vZGdpcmVydzhjNnVlcHp2MmhsdmxkNzRndzAwcHU2NnY1YSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nhmHtytEWzdUOVB68s/giphy.gif)

### And then activate them

![And then activate them](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZiZHJ2aHR0dnFkb2h0bnNvamg5andmdXZpNHdzOGNjc3R2dWxkeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tFsUvTNgfTILb8IooB/giphy.gif)

### Everything is done with two commands

-  What you see in the first gif is done with `Place Inactive Selection` command.

-  What you see in the second gif is done with `Activate Selections` command.

-  By default they are mapped to `PageDown` and `PageUp` respectively. If you need help in remapping them, check below.

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

> A cursor is actually just a selection which has the start and the end positions the same. This is useful to know further that when I'm saying "selections" I'm referring to cursors as well.

<br>

### Other features and tips

These features and tips are usually intuitive and discoverable while you are using the extension, but I'm listing them here to be documented.

<br>

-  To remove all inactive selections, simply press `Esc`.

<br>

-  To remove a certain inactive selection, select it and use again the `Place Inactive Selection` command. Alternatively, you can make use of the fact that if a new inactive selection is placed and is intersected with others, the others will be removed:

   ![Remove innactive selections](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnI1dzA0bHpicW55NnA3enVlaGE1NHVsaHVxaDZyN2J4Znh2dHIyYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gBoiWQQr3rdcZt3SFg/giphy.gif)

   In the gif the commands are typed with pause between them, but you can rapidly double tap the `Place Inactive Selection` command to effectevely perform a removal.

   <br>

-  If you activated the inactive selections, did not yet edit the document and discarded the active selections, the inactive selections will reappear. This is because maybe you wanted to modify something about those inactive selections, and this behaviour allows you to do that:

   ![Inactive selections reappear](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Zwc2tsb2RwczZobHNkamMwajMyZXU0dnA4ZHlsY3BubXNkNzFpaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XTo0ZNyw3jCEsN5gdJ/giphy.gif)

   <br>

-  Placing multiple inactive selections at once is also supported.

   ![Place multiple inactive selections at once](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmh1MG9qaWRmbGMyaGI0b3pnMm9hYjRoNHEydmg0MXVnZzIwYjg0cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/liMxQauYfMtQvplTQN/giphy.gif)

<br>

### Extension limitations

These limitations are more technical and are handled to not constitute functionality breaking situations.

-  The VS Code Extension API makes it hard to create visuals that distinguish adjacent selections from one another. The workaround was to make the visuals for an inactive selection always having its cursor to the right. This way, it will be known in each situation where an inactive selection starts and where it ends.

-  The VS Code Extension API does not provide a built-in way to uniquely identify editors which have the same file. Hence, the inactive selections once set on an editor, they will appear on the other editors which have the same file.
