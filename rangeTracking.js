const vscode = require('vscode')

/**
 * @param {vscode.TextDocumentContentChangeEvent[]} changes
 * @param {vscode.Range[]} rangesToTrack
 * @param {vscode.OutputChannel} outputChannel
 */
const debugLoggingOnExtensionChannel = (changes, rangesToTrack, outputChannel) => {
   outputChannel.appendLine(`-------------------`)
   outputChannel.appendLine(`-------------------`)

   outputChannel.appendLine(`Change ranges`)
   for (const change of changes) {
      outputChannel.appendLine(
         `    start: ${change.range.start.line} ${change.range.start.character}`
      )
      outputChannel.appendLine(`    end: ${change.range.end.line} ${change.range.end.character}`)
      outputChannel.appendLine(`    -----`)
   }

   outputChannel.appendLine('Ranges to track')
   for (const range of rangesToTrack) {
      outputChannel.appendLine(`    start: ${range.start.line} ${range.start.character}`)
      outputChannel.appendLine(`    end: ${range.end.line} ${range.end.character}`)
      outputChannel.appendLine(`    -----`)
   }
}

/**
 * @param {vscode.TextDocumentContentChangeEvent} change
 */
const getUpdatedPositionDueToInsertion = (line, character, change) => {
   // insertion is on the same line as the position-to-update
   if (change.range.start.line === line) {
      // the insertion has at least one new line
      if (change.text.split('\n').length - 1 > 0) {
         character -= change.range.start.character

         const index = change.text.lastIndexOf('\n')
         character += change.text.slice(index + 1, change.text.length).length

         // the insertion has no new lines
      } else {
         character += change.text.length
      }
   }

   line += change.text.split('\n').length - 1

   return [line, character]
}

/**
 * @param {vscode.Position} position
 * @param {vscode.TextDocumentContentChangeEvent} change
 */
const getUpdatedPosition = (position, change) => {
   let newLine = position.line
   let newCharacter = position.character

   // change before position-to-update
   if (change.range.end.isBeforeOrEqual(position)) {
      // change consisted in deletion
      if (!change.range.start.isEqual(change.range.end)) {
         // change range is also on the position-to-update's line
         if (change.range.end.line === newLine) {
            const characterDelta = change.range.end.character - change.range.start.character
            newCharacter -= characterDelta
         }

         const lineDelta = change.range.end.line - change.range.start.line
         newLine -= lineDelta
      }

      // change consisted in insertion
      if (change.text) {
         ;[newLine, newCharacter] = getUpdatedPositionDueToInsertion(newLine, newCharacter, change)
      }
   }

   return new vscode.Position(newLine, newCharacter)
}

/**
 * @param {vscode.Range[]} ranges
 * @param {vscode.TextDocumentContentChangeEvent[]} changes
 * @param {Object} options
 * @param {vscode.OutputChannel} options.outputChannel
 */
const getUpdatedRanges = (ranges, changes, options) => {
   const toUpdateRanges = [...ranges]

   // Sort all changes in order so that the first one is the change that's the closest to
   // the end of the document, and the last one is the change that's the closest to
   // the begining of the document.
   const sortedChanges = [...changes].sort((change1, change2) =>
      change2.range.start.compareTo(change1.range.start)
   )

   let outputChannel = undefined
   let onAddition = undefined
   let onDeletion = undefined
   if (options) {
      ;({ outputChannel, onAddition, onDeletion } = options)
   }

   outputChannel && debugLoggingOnExtensionChannel(sortedChanges, toUpdateRanges, outputChannel)

   for (const change of sortedChanges) {
      for (let i = 0; i < toUpdateRanges.length; i++) {
         if (!toUpdateRanges[i]) {
            continue
         }

         if (
            change.range.intersection(toUpdateRanges[i]) &&
            !change.range.end.isEqual(toUpdateRanges[i].start) &&
            !change.range.start.isEqual(toUpdateRanges[i].end)
         ) {
            if (!change.range.start.isEqual(change.range.end)) {
               if (onDeletion === 'remove') {
                  toUpdateRanges[i] = null
               } else if (onDeletion === 'shrink') {
                  let newRangeStart = toUpdateRanges[i].start
                  let newRangeEnd = toUpdateRanges[i].end

                  if (change.range.contains(toUpdateRanges[i].start)) {
                     newRangeStart = new vscode.Position(
                        change.range.end.line,
                        change.range.end.character
                     )
                  }

                  if (change.range.contains(toUpdateRanges[i].end)) {
                     newRangeEnd = new vscode.Position(
                        change.range.start.line,
                        change.range.start.character
                     )
                  }

                  if (newRangeEnd.isBefore(newRangeStart)) {
                     toUpdateRanges[i] = null
                  } else {
                     toUpdateRanges[i] = new vscode.Range(newRangeStart, newRangeEnd)
                  }
               }
            }
         }

         if (!toUpdateRanges[i]) {
            continue
         }

         const updatedRangeStart = getUpdatedPosition(toUpdateRanges[i].start, change)
         const updatedRangeEnd = getUpdatedPosition(toUpdateRanges[i].end, change)

         toUpdateRanges[i] = new vscode.Range(updatedRangeStart, updatedRangeEnd)

         // const newRangeStart = new vscode.Position(newRangeStartLine, newRangeStartCharacter)

         // // once the start position is calculated, we can infer the end position
         // const lineDelta = toUpdateRanges[i].end.line - toUpdateRanges[i].start.line
         // const characterDelta = toUpdateRanges[i].end.character - toUpdateRanges[i].start.character

         // let newRangeEnd = undefined
         // if (lineDelta !== 0) {
         //    newRangeEnd = new vscode.Position(
         //       newRangeStart.line + lineDelta,
         //       toUpdateRanges[i].end.character
         //    )
         // } else {
         //    newRangeEnd = new vscode.Position(
         //       newRangeStart.line,
         //       newRangeStart.character + characterDelta
         //    )
         // }
         // //

         // toUpdateRanges[i] = new vscode.Range(newRangeStart, newRangeEnd)
      }
   }

   const updatedRanges = toUpdateRanges.filter((range) => range)

   return updatedRanges
}

module.exports = { getUpdatedRanges }
