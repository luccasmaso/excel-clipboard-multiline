import React from 'react'

var ExcelClipboardMultiline = () => {

  const process = async (event) => {
    const [header, rows, types] = await buildFromClipboard(event)
    const result = mapToJson(header, rows)

    console.log(result)
  }

  const mapToJson = (_, rows) => {
    const {headers, fills} = sheets.find((sheet) => type == sheet.type)

    var lastRefRow = null

    return rows.reduce((acc, row) => {
      return [
        ...acc, 
        headers.reduce((acc2, header, index) => {
          return {
            ...acc2,
            [header]: row[index]
          }
        }, {})
      ]
    }, [])
  }

  // Multiline columns cannot have explicit double quotes within \n or \t
  // '__' especial character
  const sanitize = (text) => {
    return text
      .replace(/\r/g, '')
      .replace(/(?<=\t|^)"([^"]|\n|"[^\n\t]+")*"(?:\t|\n|)/gm, (match, capture) => {
        return match.replace(/\n(?!$)/gm, "__")
      })
      .trim('\n')
  }

  const sanitizeColumn = (text) => {
    return text.trim()
      .replace(/^"([^\"]*)"$/m, '$1')
      .replace(/__/gm, '\n')
      .replace(/  +/gm, ' ')
  }

  const transformColumn = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  const separateRows = (text) => {
    const {headers} = sheets.find((sheet) => type == sheet.type)

    return text.match(new RegExp(`(^(?:[^\t]*\t){${headers.length - 1}}[^\t]*$)`, 'gm'))
  }

  const buildFromClipboard = (event) => {
    return new Promise((resolve, reject) => {
      var items = event.clipboardData.items
      var data
      
      for (var i = 0; i < items.length; i++) {
        if (items[i].type == 'text/plain') {
          data = items[i]
          break
        }
      }

      if (!data) reject()

      data.getAsString((text) => {
        text = sanitize(text)

        var rowsOfText = separateRows(text)
        var header = []
        var rows = []
        
        rowsOfText.forEach((rowAsText) => {
          var row = rowAsText.split('\t').map((colAsText) => transformColumn(sanitizeColumn(colAsText)))
          // The first row containing data is assumed to be the header
          if (header.length == 0) {
            // Remove empty columns
            while (row.length && !row[row.length - 1].trim()) row.pop()
            if (row.length == 0) return
            header = row
          } else {
            rows = [...rows, row.slice(0, header.length)]
          }
        })
        
        resolve([header, rows])
      })
    })
  }

  return (
    <input 
      onPaste={process} 
      placeholder="Import with ctrl + c ~> ctrl + v" 
      value="" 
    />
  )

}

export default ExcelClipboardMultiline
