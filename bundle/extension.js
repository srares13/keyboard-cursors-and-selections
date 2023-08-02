var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// utils.js
var require_utils = __commonJS({
  "utils.js"(exports2, module2) {
    var vscode2 = require("vscode");
    var createDecorations2 = (fontSize) => {
      const cursorDecorationBorder = 0.073333 * fontSize + "px";
      const cursorDecorationMargin = -0.073333 * fontSize * 2 + "px";
      const eolSelectionBorder = 0.3 * fontSize + "px";
      const cursorDecoration = vscode2.window.createTextEditorDecorationType({
        after: {
          backgroundColor: "hsl(338, 78%, 70%)",
          border: `${cursorDecorationBorder} solid hsl(338, 78%, 70%)`,
          contentText: "",
          margin: `0 ${cursorDecorationMargin} 0 0`
        }
      });
      const selectionDecoration = vscode2.window.createTextEditorDecorationType({
        backgroundColor: "hsla(299, 69%, 33%, 0.6)"
      });
      const eolSelectionDecoration = vscode2.window.createTextEditorDecorationType({
        border: `${eolSelectionBorder} solid transparent`,
        backgroundColor: "hsla(299, 69%, 33%, 0.6)"
      });
      return {
        cursorDecoration,
        selectionDecoration,
        eolSelectionDecoration
      };
    };
    var setMyDecorations2 = (editor, inactiveSelections, { cursorDecoration, selectionDecoration, eolSelectionDecoration }) => {
      const cursorDecorationRanges = [];
      const selectionDecorationRanges = [];
      const eolSelectionDecorationRanges = [];
      inactiveSelections.forEach((range) => {
        if (range.start.isEqual(range.end)) {
          cursorDecorationRanges.push(range);
        } else {
          selectionDecorationRanges.push(range);
          cursorDecorationRanges.push(new vscode2.Range(range.end, range.end));
          for (let lineNumber = range.start.line; range.end.line - lineNumber !== 0; lineNumber++) {
            const line = editor.document.lineAt(lineNumber);
            const position = new vscode2.Position(lineNumber, line.range.end.character);
            const range2 = new vscode2.Range(position, position);
            eolSelectionDecorationRanges.push(range2);
          }
        }
      });
      editor.setDecorations(cursorDecoration, cursorDecorationRanges);
      editor.setDecorations(selectionDecoration, selectionDecorationRanges);
      editor.setDecorations(eolSelectionDecoration, eolSelectionDecorationRanges);
    };
    var unsetMyDecorations2 = (editor, { cursorDecoration, selectionDecoration, eolSelectionDecoration }) => {
      editor.setDecorations(cursorDecoration, []);
      editor.setDecorations(selectionDecoration, []);
      editor.setDecorations(eolSelectionDecoration, []);
    };
    module2.exports = { createDecorations: createDecorations2, setMyDecorations: setMyDecorations2, unsetMyDecorations: unsetMyDecorations2 };
  }
});

// extension.js
var vscode = require("vscode");
var { createDecorations, setMyDecorations, unsetMyDecorations } = require_utils();
var activate = (context) => {
  const inactiveSelections = {};
  const hiddenSelections = {};
  let { cursorDecoration, selectionDecoration, eolSelectionDecoration } = createDecorations(
    vscode.workspace.getConfiguration("editor").get("fontSize")
  );
  const disposables = [];
  vscode.commands.executeCommand("setContext", "inactiveSelections", false);
  let inactiveSelectionsContext = false;
  vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration("editor.fontSize")) {
        vscode.window.visibleTextEditors.forEach((editor) => {
          const docUriKey = editor.document.uri.toString();
          if (hiddenSelections[docUriKey] === false) {
            unsetMyDecorations(editor, {
              cursorDecoration,
              selectionDecoration,
              eolSelectionDecoration
            });
          }
        });
        ({ cursorDecoration, selectionDecoration, eolSelectionDecoration } = createDecorations(
          vscode.workspace.getConfiguration("editor").get("fontSize")
        ));
        vscode.window.visibleTextEditors.forEach((editor) => {
          const docUriKey = editor.document.uri.toString();
          if (hiddenSelections[docUriKey] === false) {
            setMyDecorations(editor, inactiveSelections[docUriKey], {
              cursorDecoration,
              selectionDecoration,
              eolSelectionDecoration
            });
          }
        });
      }
    },
    void 0,
    disposables
  );
  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      const key = event.document.uri.toString();
      if (inactiveSelections[key]) {
        delete inactiveSelections[key];
        delete hiddenSelections[key];
        vscode.window.visibleTextEditors.forEach((editor) => {
          if (editor.document.uri.toString() === key) {
            unsetMyDecorations(editor, {
              cursorDecoration,
              selectionDecoration,
              eolSelectionDecoration
            });
          }
        });
        vscode.commands.executeCommand("setContext", "inactiveSelections", false);
        inactiveSelectionsContext = false;
      }
    },
    void 0,
    disposables
  );
  vscode.window.onDidChangeTextEditorSelection(
    (event) => {
      const docUriKey = event.textEditor.document.uri.toString();
      if (event.selections.length === 1 && event.selections[0].start.isEqual(event.selections[0].end) && hiddenSelections[docUriKey]) {
        vscode.window.visibleTextEditors.forEach((editor) => {
          if (editor.document.uri.toString() === docUriKey) {
            setMyDecorations(editor, inactiveSelections[docUriKey], {
              cursorDecoration,
              selectionDecoration,
              eolSelectionDecoration
            });
          }
        });
        hiddenSelections[docUriKey] = false;
        vscode.commands.executeCommand("setContext", "inactiveSelections", true);
        inactiveSelectionsContext = true;
      }
    },
    void 0,
    disposables
  );
  vscode.window.onDidChangeVisibleTextEditors(
    (editors) => {
      editors.forEach((editor) => {
        const docUriKey = editor.document.uri.toString();
        if (hiddenSelections[docUriKey] === false) {
          setMyDecorations(editor, inactiveSelections[docUriKey], {
            cursorDecoration,
            selectionDecoration,
            eolSelectionDecoration
          });
        }
      });
    },
    void 0,
    disposables
  );
  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      const docUriKey = editor.document.uri.toString();
      if (hiddenSelections[docUriKey] === false) {
        vscode.commands.executeCommand("setContext", "inactiveSelections", true);
        inactiveSelectionsContext = true;
      } else {
        vscode.commands.executeCommand("setContext", "inactiveSelections", false);
        inactiveSelectionsContext = false;
      }
    },
    void 0,
    disposables
  );
  vscode.workspace.onDidCloseTextDocument(
    (document) => {
      const docUriKey = document.uri.toString();
      delete inactiveSelections[docUriKey];
      delete hiddenSelections[docUriKey];
      vscode.commands.executeCommand("setContext", "inactiveSelections", false);
      inactiveSelectionsContext = false;
    },
    void 0,
    disposables
  );
  const placeInactiveSelection = vscode.commands.registerCommand(
    "kcs.placeInactiveSelection",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const docUriKey = editor.document.uri.toString();
      if (hiddenSelections[docUriKey]) {
        inactiveSelections[docUriKey] = [];
      }
      let currentInactiveSelections = inactiveSelections[docUriKey] ? [...inactiveSelections[docUriKey]] : [];
      const newInactiveSelections = [];
      editor.selections.forEach((selection) => {
        let addInactiveSelection = true;
        for (let i = 0; i < currentInactiveSelections.length; i++) {
          if (!currentInactiveSelections[i]) {
            continue;
          }
          if (selection.isEqual(currentInactiveSelections[i])) {
            currentInactiveSelections[i] = null;
            addInactiveSelection = false;
          } else if (selection.intersection(currentInactiveSelections[i])) {
            if (selection.start.isEqual(selection.end) || currentInactiveSelections[i].start.isEqual(currentInactiveSelections[i].end)) {
              currentInactiveSelections[i] = null;
            } else if (!selection.start.isEqual(currentInactiveSelections[i].end) && !selection.end.isEqual(currentInactiveSelections[i].start)) {
              currentInactiveSelections[i] = null;
            }
          }
        }
        if (addInactiveSelection) {
          const range = new vscode.Range(selection.start, selection.end);
          newInactiveSelections.unshift(range);
        }
      });
      hiddenSelections[docUriKey] = false;
      vscode.commands.executeCommand("setContext", "inactiveSelections", true);
      inactiveSelectionsContext = true;
      currentInactiveSelections = currentInactiveSelections.filter(
        (inactiveSelection) => inactiveSelection
      );
      currentInactiveSelections = newInactiveSelections.concat(currentInactiveSelections);
      inactiveSelections[docUriKey] = currentInactiveSelections;
      vscode.window.visibleTextEditors.forEach((editor2) => {
        if (editor2.document.uri.toString() === docUriKey) {
          setMyDecorations(editor2, inactiveSelections[docUriKey], {
            cursorDecoration,
            selectionDecoration,
            eolSelectionDecoration
          });
        }
      });
      if (!inactiveSelections[docUriKey].length) {
        delete inactiveSelections[docUriKey];
        delete hiddenSelections[docUriKey];
        vscode.commands.executeCommand("setContext", "inactiveSelections", false);
        inactiveSelectionsContext = false;
      }
    }
  );
  const activateSelections = vscode.commands.registerCommand("kcs.activateSelections", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const docUriKey = editor.document.uri.toString();
    if (!inactiveSelections[docUriKey] || hiddenSelections[docUriKey]) {
      return;
    }
    const selections = inactiveSelections[docUriKey].map(
      (range) => new vscode.Selection(range.start, range.end)
    );
    vscode.window.visibleTextEditors.forEach((editor2) => {
      if (editor2.document.uri.toString() === docUriKey) {
        editor2.selections = selections;
      }
    });
    hiddenSelections[docUriKey] = true;
    vscode.window.visibleTextEditors.forEach((editor2) => {
      if (editor2.document.uri.toString() === docUriKey) {
        unsetMyDecorations(editor2, {
          cursorDecoration,
          selectionDecoration,
          eolSelectionDecoration
        });
      }
    });
    vscode.commands.executeCommand("setContext", "inactiveSelections", false);
    inactiveSelectionsContext = false;
    if (selections.length === 1 && selections[0].start.isEqual(selections[0].end)) {
      delete inactiveSelections[docUriKey];
      delete hiddenSelections[docUriKey];
    }
  });
  const removeInactiveSelections = vscode.commands.registerCommand(
    "kcs.removeInactiveSelections",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }
      const docUriKey = editor.document.uri.toString();
      vscode.window.visibleTextEditors.forEach((editor2) => {
        if (editor2.document.uri.toString() === docUriKey) {
          unsetMyDecorations(editor2, {
            cursorDecoration,
            selectionDecoration,
            eolSelectionDecoration
          });
        }
      });
      delete inactiveSelections[docUriKey];
      delete hiddenSelections[docUriKey];
      vscode.commands.executeCommand("setContext", "inactiveSelections", false);
      inactiveSelectionsContext = false;
    }
  );
  context.subscriptions.push(
    placeInactiveSelection,
    activateSelections,
    removeInactiveSelections,
    cursorDecoration,
    selectionDecoration,
    eolSelectionDecoration,
    ...disposables
  );
};
var deactivate = () => {
};
module.exports = {
  activate,
  deactivate
};
