const vscode = require('vscode')
const { outputChannel } = require('./utils')

const updatePositionDueToInsertion = (positionLine, positionCharacter, contentChange) => {
   // insertion is on the same line as the marker
   if (contentChange.range.start.line === positionLine) {
      // the insertion has at least one new line
      if (contentChange.text.split('\n').length - 1 > 0) {
         positionCharacter -= contentChange.range.start.character

         const index = contentChange.text.lastIndexOf('\n')
         positionCharacter += contentChange.text.slice(index + 1, contentChange.text.length).length

         // the insertion has no new lines
      } else {
         positionCharacter += contentChange.text.length
      }
   }

   positionLine += contentChange.text.split('\n').length - 1

   return [positionLine, positionCharacter]
}

/**
 * @param {vscode.TextDocumentChangeEvent} event
 * @param {vscode.Range[]} ranges
 */
const getUpdatedRanges = (event, ranges) => {
   const toUpdateRanges = [...ranges]

   if (!toUpdateRanges) {
      return
   }

   const sortedChanges = [...event.contentChanges].sort((change1, change2) =>
      change2.range.start.compareTo(change1.range.start)
   )

   // debug logging
   outputChannel.appendLine(`-------------------`)
   outputChannel.appendLine(`-------------------`)
   outputChannel.appendLine(`Change ranges`)
   for (const contentChange of sortedChanges) {
      outputChannel.appendLine(
         `    start: ${contentChange.range.start.line} ${contentChange.range.start.character}`
      )
      outputChannel.appendLine(
         `    end: ${contentChange.range.end.line} ${contentChange.range.end.character}`
      )
      outputChannel.appendLine(`    -----`)
   }
   outputChannel.appendLine('Marker positions')
   for (const markerRange of toUpdateRanges) {
      outputChannel.appendLine(`    ${markerRange.start.line} ${markerRange.start.character}`)
      outputChannel.appendLine(`    -----`)
   }
   // debug logging - end

   for (const change of sortedChanges) {
      for (let i = 0; i < toUpdateRanges.length; i++) {
         if (!toUpdateRanges[i]) {
            continue
         }

         let newRangeStartLine = toUpdateRanges[i].start.line
         let newRangeStartCharacter = toUpdateRanges[i].start.character

         // change before marker
         if (change.range.end.isBefore(toUpdateRanges[i].start)) {
            // change consisted in deleting
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
                  // eslint-disable-next-line no-extra-semi
                  ;[newRangeStartLine, newRangeStartCharacter] = updatePositionDueToInsertion(
                     newRangeStartLine,
                     newRangeStartCharacter,
                     change
                  )
               }

               // change consisted in insertion
            } else {
               // eslint-disable-next-line no-extra-semi
               ;[newRangeStartLine, newRangeStartCharacter] = updatePositionDueToInsertion(
                  newRangeStartLine,
                  newRangeStartCharacter,
                  change
               )
            }

            const newRangeStart = new vscode.Position(newRangeStartLine, newRangeStartCharacter)

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
