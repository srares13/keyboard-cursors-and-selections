<br>
<br>

**If it's your first install, you won't have to check the new important changes.**

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
