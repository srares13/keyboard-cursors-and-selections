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

const getUpdatedRanges = (event, ranges) => {
   let updatedRanges = [...ranges]

   if (!updatedRanges) {
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
   for (const markerRange of updatedRanges) {
      outputChannel.appendLine(`    ${markerRange.start.line} ${markerRange.start.character}`)
      outputChannel.appendLine(`    -----`)
   }
   // debug logging - end

   for (const change of sortedChanges) {
      for (let i = 0; i < updatedRanges.length; i++) {
         if (!updatedRanges[i]) {
            continue
         }

         let newMarkerPositionLine = updatedRanges[i].start.line
         let newMarkerPositionCharacter = updatedRanges[i].start.character

         // change before marker
         if (change.range.end.isBefore(updatedRanges[i].start)) {
            // change consisted in deleting
            if (!change.range.start.isEqual(change.range.end)) {
               // change range is also on the marker's line
               if (change.range.end.line === newMarkerPositionLine) {
                  const characterDelta = change.range.end.character - change.range.start.character
                  newMarkerPositionCharacter -= characterDelta
               }
               const lineDelta = change.range.end.line - change.range.start.line
               newMarkerPositionLine -= lineDelta

               // change consisted also in insertion
               if (change.text) {
                  // eslint-disable-next-line no-extra-semi
                  ;[newMarkerPositionLine, newMarkerPositionCharacter] =
                     updatePositionDueToInsertion(
                        newMarkerPositionLine,
                        newMarkerPositionCharacter,
                        change
                     )
               }

               // change consisted in insertion
            } else {
               // eslint-disable-next-line no-extra-semi
               ;[newMarkerPositionLine, newMarkerPositionCharacter] = updatePositionDueToInsertion(
                  newMarkerPositionLine,
                  newMarkerPositionCharacter,
                  change
               )
            }

            const position = new vscode.Position(newMarkerPositionLine, newMarkerPositionCharacter)
            updatedRanges[i] = new vscode.Range(position, position)
         } else if (
            change.range.start.isBeforeOrEqual(updatedRanges[i].start) &&
            change.range.end.isAfterOrEqual(updatedRanges[i].start)
         ) {
            updatedRanges[i] = null
         }
      }
   }

   updatedRanges = updatedRanges.filter((range) => range)

   return updatedRanges
}

module.exports = { getUpdatedRanges }
