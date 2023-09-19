// @ts-ignore
const vscode = require('vscode')

type InactiveSelectionsPlacedAction = {
   type: 'inactiveSelectionsPlaced'
   ranges: vscode.Range[]
   elementsCountToRemove?: number
}

type InactiveSelectionsRemovedAction = {
   type: 'inactiveSelectionsRemoved'
   rangesAndIndexes: {
      indexes: number[]
      ranges: vscode.Range[]
   }
   indexesToRemove: number[]
}

type ActionType = 'inactiveSelectionsPlaced' | 'inactiveSelectionsRemoved'
