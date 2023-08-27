const vscode = require('vscode')

/**
 * @param {vscode.TextDocumentContentChangeEvent[]} changes
 * @param {vscode.Range[]} toUpdateRanges
 * @param {vscode.Range[]} updatedRanges
 */
const debugLoggingOnDebugConsole = (changes, toUpdateRanges, updatedRanges) => {
   console.log(`-------------------`)
   console.log(`-------------------`)

   console.log(`Change ranges`)
   for (const change of changes) {
      console.log(`    start: ${change.range.start.line} ${change.range.start.character}`)
      console.log(`    end: ${change.range.end.line} ${change.range.end.character}`)
      console.log(`    -----`)
   }

   console.log('To update ranges')
   for (const range of toUpdateRanges) {
      console.log(`    start: ${range.start.line} ${range.start.character}`)
      console.log(`    end: ${range.end.line} ${range.end.character}`)
      console.log(`    -----`)
   }

   console.log('Updated ranges')
   for (const range of updatedRanges) {
      console.log(`    start: ${range.start.line} ${range.start.character}`)
      console.log(`    end: ${range.end.line} ${range.end.character}`)
      console.log(`    -----`)
   }
}

/**
 * @param {vscode.TextDocumentContentChangeEvent[]} changes
 * @param {vscode.Range[]} toUpdateRanges
 * @param {vscode.Range[]} updatedRanges
 * @param {vscode.OutputChannel} outputChannel
 */
const debugLoggingOnExtensionChannel = (changes, toUpdateRanges, updatedRanges, outputChannel) => {
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

   outputChannel.appendLine('To update ranges')
   for (const range of toUpdateRanges) {
      outputChannel.appendLine(`    start: ${range.start.line} ${range.start.character}`)
      outputChannel.appendLine(`    end: ${range.end.line} ${range.end.character}`)
      outputChannel.appendLine(`    -----`)
   }

   outputChannel.appendLine('Updated ranges')
   for (const range of updatedRanges) {
      outputChannel.appendLine(`    start: ${range.start.line} ${range.start.character}`)
      outputChannel.appendLine(`    end: ${range.end.line} ${range.end.character}`)
      outputChannel.appendLine(`    -----`)
   }
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
         // insertion is on the same line as the position-to-update
         if (change.range.start.line === newLine) {
            // the insertion has at least one new line
            if (change.text.split('\n').length - 1 > 0) {
               newCharacter -= change.range.start.character

               const index = change.text.lastIndexOf('\n')
               newCharacter += change.text.slice(index + 1, change.text.length).length

               // the insertion has no new lines
            } else {
               newCharacter += change.text.length
            }
         }

         newLine += change.text.split('\n').length - 1
      }
   }

   return new vscode.Position(newLine, newCharacter)
}

/**
 * @typedef {"remove"|"shrink"} onDeletion
 */
/**
 * @typedef {"remove"|"extend"|"split"} onAddition
 */

/**
 * @param {vscode.Range[]} ranges
 * @param {vscode.TextDocumentContentChangeEvent[]} changes
 * @param {Object} options
 * @param {onDeletion} options.onDeletion
 * @param {onAddition} options.onAddition
 * @param {boolean} options.debugConsole
 * @param {vscode.OutputChannel} options.outputChannel
 */
const getUpdatedRanges = (ranges, changes, options) => {
   let toUpdateRanges = [...ranges]

   // Sort all changes in order so that the first one is the change that's the closest to
   // the end of the document, and the last one is the change that's the closest to
   // the begining of the document.
   const sortedChanges = [...changes].sort((change1, change2) =>
      change2.range.start.compareTo(change1.range.start)
   )

   let onDeletion = undefined
   let onAddition = undefined
   let debugConsole = undefined
   let outputChannel = undefined
   if (options) {
      ;({ onDeletion, onAddition, debugConsole, outputChannel } = options)
   }
   if (!onDeletion) {
      onDeletion = 'shrink'
   }
   if (!onAddition) {
      onAddition = 'extend'
   }

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
                     newRangeStart = change.range.end
                  }

                  if (change.range.contains(toUpdateRanges[i].end)) {
                     newRangeEnd = change.range.start
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

         if (
            change.range.intersection(toUpdateRanges[i]) &&
            !change.range.end.isEqual(toUpdateRanges[i].start) &&
            !change.range.start.isEqual(toUpdateRanges[i].end)
         ) {
            if (change.text) {
               if (onAddition === 'remove') {
                  toUpdateRanges[i] = null
               } else if (onAddition === 'split') {
                  toUpdateRanges.splice(
                     i + 1,
                     0,
                     new vscode.Range(change.range.start, toUpdateRanges[i].end)
                  )
                  toUpdateRanges[i] = new vscode.Range(toUpdateRanges[i].start, change.range.start)
               }
            }
         }

         if (!toUpdateRanges[i]) {
            continue
         }

         const updatedRangeStart = getUpdatedPosition(toUpdateRanges[i].start, change)
         let updatedRangeEnd = undefined

         if (
            !toUpdateRanges[i].start.isEqual(toUpdateRanges[i].end) &&
            toUpdateRanges[i].end.isEqual(change.range.end)
         ) {
            updatedRangeEnd = toUpdateRanges[i].end
         } else {
            updatedRangeEnd = getUpdatedPosition(toUpdateRanges[i].end, change)
         }

         toUpdateRanges[i] = new vscode.Range(updatedRangeStart, updatedRangeEnd)
      }
   }

   for (let i = 0; i < toUpdateRanges.length - 1; i++) {
      if (!toUpdateRanges[i]) {
         continue
      }

      for (let j = i + 1; j < toUpdateRanges.length; j++) {
         if (!toUpdateRanges[j]) {
            continue
         }

         if (
            toUpdateRanges[i].end.isEqual(toUpdateRanges[j].start) ||
            toUpdateRanges[i].start.isEqual(toUpdateRanges[j].end)
         ) {
            if (toUpdateRanges[j].start.isEqual(toUpdateRanges[j].end)) {
               toUpdateRanges[j] = null
            } else if (toUpdateRanges[i].start.isEqual(toUpdateRanges[i].end)) {
               toUpdateRanges[i] = null
            }
         }
      }
   }

   const updatedRanges = toUpdateRanges.filter((range) => range)

   debugConsole && debugLoggingOnDebugConsole(sortedChanges, ranges, updatedRanges)
   outputChannel &&
      debugLoggingOnExtensionChannel(sortedChanges, ranges, updatedRanges, outputChannel)

   return updatedRanges
}

module.exports = { getUpdatedRanges }
