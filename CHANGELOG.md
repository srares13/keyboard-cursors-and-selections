### 1.1.0 (14 Aug 2023)

-  When you you place an inactive selection over another, it will only remove the existing one and not place a new one. The reason for this change is to have a universal behaviour. We already had this behaviour when you perfectly matched an inactive selection. But now you'll know what to expect in each situation when an inactive selection is placed over another (intersected in any way with another), it will only remove the existing one.

-  When the inactive selections are activated and then discarded, the selection which remains is the one whose inactive selection was placed first. This behaviour is in accordance with how VS Code handles this when you place multiple selections with the mouse and then discard them.

-  Fixed an issue when placing multiple inactive selections at once did not work as expected when in some selected places there already were existing inactive selections and in others not.

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
