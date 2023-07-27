const assert = require('assert')

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require('vscode')
// const myExtension = require('../extension');

// suite('Extension Test Suite', () => {
//    vscode.window.showInformationMessage('Start all tests.')

//    test('Sample test', () => {
//       assert.strictEqual(-1, [1, 2, 3].indexOf(5))
//       assert.strictEqual(-1, [1, 2, 3].indexOf(0))
//    })
// })

// const assert = require('assert')
// const vscode = require('vscode')
const extension = require('./extension')

suite('Extension Test Suite', () => {
   vscode.window.showInformationMessage('Start all tests.')

   test('Position update test', () => {
      const editor = vscode.window.activeTextEditor
      const initialPosition = new vscode.Position(1, 3)
      extension.activate({ subscriptions: [] })

      // Set the initial position
      editor.selection = new vscode.Selection(initialPosition, initialPosition)

      // Simulate a text change
      const changeRange = new vscode.Range(new vscode.Position(0, 2), new vscode.Position(1, 2))
      const event = {
         contentChanges: [
            {
               range: changeRange
            }
         ]
      }
      vscode.workspace.onDidChangeTextDocument(event)

      // Check if the position was updated correctly
      const expectedPosition = new vscode.Position(0, 3)
      assert.deepStrictEqual(editor.selection.active, expectedPosition)
   })
})
