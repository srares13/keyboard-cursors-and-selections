import * as vscode from 'vscode'

type InactiveSelectionsPlaced = {
   type: 'inactiveSelectionsPlaced'
   ranges: vscode.Range[]
   elementsCountToRemove: number
}

type InactiveSelectionsRemoved = {
   type: 'inactiveSelectionsRemoved'
   rangesAndIndexes: {
      index: number
      range: vscode.Range
   }[]
}

type Action = InactiveSelectionsPlaced | InactiveSelectionsRemoved

type MainDataObjectType = {
   inactiveSelections: vscode.Range[]
   actions: Array<Action>
   actionIndex: number | undefined
}

export { InactiveSelectionsPlaced, InactiveSelectionsRemoved, Action, MainDataObjectType }
