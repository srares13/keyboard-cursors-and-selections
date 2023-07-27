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

vscode.workspace.onDidChangeTextDocument((event) => {
   if (hiddenInactiveSelections[key]) {
      delete inactiveSelectionRanges[key]
      hiddenInactiveSelections[key] = false
   }
   const toUpdateMarkerRanges = inactiveSelectionRanges[key]
   if (!toUpdateMarkerRanges) {
      return
   }
   const sortedContentChanges = [...event.contentChanges].sort((change1, change2) =>
      change2.range.start.compareTo(change1.range.start)
   )
   // logging system
   outputChannel.appendLine(`-------------------`)
   outputChannel.appendLine(`-------------------`)
   outputChannel.appendLine(`Change ranges`)
   for (const contentChange of sortedContentChanges) {
      outputChannel.appendLine(
         `    start: ${contentChange.range.start.line} ${contentChange.range.start.character}`
      )
      outputChannel.appendLine(
         `    end: ${contentChange.range.end.line} ${contentChange.range.end.character}`
      )
      outputChannel.appendLine(`    -----`)
   }
   outputChannel.appendLine('Marker positions')
   for (const markerRange of toUpdateMarkerRanges) {
      outputChannel.appendLine(`    ${markerRange.start.line} ${markerRange.start.character}`)
      outputChannel.appendLine(`    -----`)
   }
   // logging system
   for (const contentChange of sortedContentChanges) {
      for (let i = 0; i < toUpdateMarkerRanges.length; i++) {
         if (!toUpdateMarkerRanges[i]) {
            continue
         }
         let newMarkerPositionLine = toUpdateMarkerRanges[i].start.line
         let newMarkerPositionCharacter = toUpdateMarkerRanges[i].start.character
         // change before marker
         if (contentChange.range.end.isBefore(toUpdateMarkerRanges[i].start)) {
            // change consisted in deleting
            if (!contentChange.range.start.isEqual(contentChange.range.end)) {
               // change range is also on the marker's line
               if (contentChange.range.end.line === newMarkerPositionLine) {
                  const characterDelta =
                     contentChange.range.end.character - contentChange.range.start.character
                  newMarkerPositionCharacter -= characterDelta
               }
               const lineDelta = contentChange.range.end.line - contentChange.range.start.line
               newMarkerPositionLine -= lineDelta
               // change consisted also in insertion
               if (contentChange.text) {
                  // eslint-disable-next-line no-extra-semi
                  ;[newMarkerPositionLine, newMarkerPositionCharacter] =
                     updatePositionDueToInsertion(
                        newMarkerPositionLine,
                        newMarkerPositionCharacter,
                        contentChange
                     )
               }
               // change consisted in insertion
            } else {
               // eslint-disable-next-line no-extra-semi
               ;[newMarkerPositionLine, newMarkerPositionCharacter] = updatePositionDueToInsertion(
                  newMarkerPositionLine,
                  newMarkerPositionCharacter,
                  contentChange
               )
            }
            const position = new vscode.Position(newMarkerPositionLine, newMarkerPositionCharacter)
            toUpdateMarkerRanges[i] = new vscode.Range(position, position)
         } else if (
            contentChange.range.start.isBeforeOrEqual(toUpdateMarkerRanges[i].start) &&
            contentChange.range.end.isAfterOrEqual(toUpdateMarkerRanges[i].start)
         ) {
            toUpdateMarkerRanges[i] = null
         }
      }
   }
   const updatedMarkerRanges = toUpdateMarkerRanges.filter((range) => range)
   if (updatedMarkerRanges.length) {
      inactiveSelectionRanges[key] = updatedMarkerRanges
      for (const editor of vscode.window.visibleTextEditors) {
         if (editor.document.uri.toString() === event.document.uri.toString()) {
            editor.setDecorations(markerDecoration, updatedMarkerRanges)
         }
      }
   } else {
      for (const editor of vscode.window.visibleTextEditors) {
         if (editor.document.uri.toString() === event.document.uri.toString()) {
            editor.setDecorations(markerDecoration, [])
         }
      }
      delete inactiveSelectionRanges[key]
   }
})
