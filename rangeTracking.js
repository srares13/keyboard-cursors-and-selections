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
const updatePositionDueToInsertion = (line, character, change) => {
   // insertion is on the same line as the marker
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
   let onIntersection = undefined
   let intersectionType = undefined
   if (options) {
      ;({ outputChannel, onIntersection, intersectionType } = options)
   }

   outputChannel && debugLoggingOnExtensionChannel(sortedChanges, toUpdateRanges, outputChannel)

   for (const change of sortedChanges) {
      for (let i = 0; i < toUpdateRanges.length; i++) {
         if (!toUpdateRanges[i]) {
            continue
         }

         let newRangeStartLine = toUpdateRanges[i].start.line
         let newRangeStartCharacter = toUpdateRanges[i].start.character

         // change before marker
         if (change.range.end.isBefore(toUpdateRanges[i].start)) {
            // change consisted in deletion
            if (!change.range.start.isEqual(change.range.end)) {
               // change range is also on the marker's line
               if (change.range.end.line === newRangeStartLine) {
                  const characterDelta = change.range.end.character - change.range.start.character
                  newRangeStartCharacter -= characterDelta
               }
               const lineDelta = change.range.end.line - change.range.start.line
               newRangeStartLine -= lineDelta

               // change consisted also in insertion
               if (change.text) {
                  ;[newRangeStartLine, newRangeStartCharacter] = updatePositionDueToInsertion(
                     newRangeStartLine,
                     newRangeStartCharacter,
                     change
                  )
               }

               // change consisted only in insertion
            } else {
               ;[newRangeStartLine, newRangeStartCharacter] = updatePositionDueToInsertion(
                  newRangeStartLine,
                  newRangeStartCharacter,
                  change
               )
            }

            const newRangeStart = new vscode.Position(newRangeStartLine, newRangeStartCharacter)

            // once the start position is calculated, we can infer the end position
            const lineDelta = toUpdateRanges[i].end.line - toUpdateRanges[i].start.line
            const characterDelta =
               toUpdateRanges[i].end.character - toUpdateRanges[i].start.character

            let newRangeEnd = undefined
            if (lineDelta !== 0) {
               newRangeEnd = new vscode.Position(
                  newRangeStart.line + lineDelta,
                  toUpdateRanges[i].end.character
               )
            } else {
               newRangeEnd = new vscode.Position(
                  newRangeStart.line,
                  newRangeStart.character + characterDelta
               )
            }
            //

            toUpdateRanges[i] = new vscode.Range(newRangeStart, newRangeEnd)
         } else if (change.range.intersection(toUpdateRanges[i])) {
            toUpdateRanges[i] = null
         }
      }
   }

   const updatedRanges = toUpdateRanges.filter((range) => range)

   return updatedRanges
}

module.exports = { getUpdatedRanges }
