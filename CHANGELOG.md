### 1.4.4 (Apr 03 2024)

-  Patch for the definition of when the inactive cursors and selections are discardable ("when" clause of the KCS: Remove Inactive Selections command).

### 1.4.3 (Mar 24 2024)

-  Changes to README file.

### 1.4.2 (Mar 24 2024)

-  Some improvements to the definition of when the inactive cursors and selections are discardable ("when" clause of the KCS: Remove Inactive Selections command).

-  Changes to README file.

### 1.4.1 (Nov 14 2023)

-  Some information added to the README file.

### 1.4.0 (Nov 13 2023)

-  Added the feature of inactive selections reacting to document edits.

-  Fixed issue: On simple file save which does not format the document, the inactive selections should not disappear. This is regardless whether you have the "Inactive selections react to document edits" feature enabled or not.

### 1.3.0 (Oct 22 2023)

-  Added the option to chnage the color of the inactive cursors and selections.

### 1.2.1 (Oct 07 2023)

-  Fixed an internal issue which did not affect functionality but it bloated the Extension Host channel with some errors.

### 1.2.0 (Oct 06 2023)

-  Undo-Redo system for the inactive selections.

-  New way of showing the important changes.

### 1.1.3 (Sep 09 2023)

-  Fixed issue: With VS Code 1.82 there appeared an issue that made the inactive cursors too thin.

### 1.1.2 (Aug 14 2023)

-  Minor patch.

### 1.1.1 (Aug 14 2023)

-  Minor patch.

### 1.1.0 (Aug 14 2023)

-  When you you place an inactive selection over another, it will only remove the existing one and not place a new one. The reason for this change is to have a universal behaviour. We already had this behaviour when you perfectly matched an inactive selection. But now you'll know what to expect in each situation when an inactive selection is placed over another (intersected in any way with another), it will only remove the existing one.

-  When the inactive selections are activated and then discarded, the selection which remains is the one whose inactive selection was placed first. This behaviour is in accordance with how VS Code handles this when you place multiple selections with the mouse and then discard them.

-  Fixed an issue when placing multiple inactive selections at once did not work as expected when in some selected places there already were existing inactive selections and in others not.

### 1.0.4 (Aug 06 2023)

-  Fixed an issue where in certain scenarios the inactive selections were not discardable.

### 1.0.3 (Aug 01 2023)

-  Changes towards VS Code WEB compatibility.

### 1.0.2 (Aug 01 2023)

-  Changes to README file.

### 1.0.1 (Jul 29 2023)

-  Changes to README file.

### 1.0.0 (Jul 28 2023)

-  Initial release.
