### 1.1.0 (07 Aug 2023)

-  When you you place an inactive selection that is intersected with others, it will only remove the existing one and not place another (if you want to place another, you simply hit the command again). The reason for this change is to have a universal behaviour. We already had this behaviour when you perfectly matched an inactive selection. But now you'll know what to expect in any situation when an inactive selection is intersected in any way with another, it will only remove the existing one.

-  When the inactive selections are activated and then discarded, the selection which remains is the one whose inactive selection was placed first. This behaviour is in accordance with how VS Code handles this when you place multiple selections with the mouse and then discard them.

### 1.0.4 (06 Aug 2023)

-  Fixed an issue where in certain scenarios the inactive selections were not discardable.

### 1.0.3 (01 Aug 2023)

-  Changes towards VS Code WEB compatibility.

### 1.0.2 (01 Aug 2023)

-  Changes to README file.

### 1.0.1 (29 Jul 2023)

-  Changes to README file.

### 1.0.0 (28 Jul 2023)

-  Initial release.
