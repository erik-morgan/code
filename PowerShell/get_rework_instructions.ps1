# get_rework_instructions.ps

Write-Host "# ImportHTML adds simple web scraping functionality to excel.
# This is a customized version for NCR Rework Instructions, and will not work with ANYTHING else.
# I'll need some information to process the data:
#     - The base URL (http://houston/ErpWeb/NCRStatus.aspx?NCRNumber=)
#     - The location of the data in excel (workbook, worksheet index, and data range)"

Do {
    $doc = Read-Host -Prompt 'Workbook Path (Hint: drag file onto this window)'
}
Until ([System.IO.File]::Exists($doc))

Do {
    $baseURL = Read-Host -Prompt 'Base URL (eg http://houston/ErpWeb/NCRStatus.aspx?NCRNumber=)'
}
Until ($baseURL -like 'http://houston/*=')

Do {
    $dataRange = Read-Host -Prompt 'Data range (MUST be in one column; Do NOT include header cell)'
}
Until ($dataRange -match '([A-Z]+[0-9]+:\1[0-9]+')

$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false
$wb = $xl.Workbooks.Open($doc)
if ($xl.Workbooks.Count -gt 1) {
    Do {
        $sheetIndex = Read-Host -Prompt 'Index of worksheet containing data'
    }
    Until ($sheetIndex -gt 0)
    $ws = $wb.Worksheets[$sheetIndex] # $wb.Worksheets.Item($sheetIndex)
}
else {
    $ws = $wb.ActiveSheet
}
$range = $ws.Range($dataRange)
$dataHeader = 'Rework Instructions'
$scraped = New-Object System.Collections.ArrayList
$range.Text | % {
    $doc = (Invoke-WebRequest "$baseURL$_").ParsedHtml
    $desiredId = 'DMRList_ctl00_ReworkInstructionTableCell'
    $scraped.Add($doc.getElementById($desiredId).innerText.Trim())
}
$offsetCols = $ws.UsedRange.Columns.Count - $range.Column + 1
$range.Offset(-1, $offsetCols).Value2 = $dataHeader
$range = $range.Offset(0, $offsetCols)
$range.Value2 = $tableData
$xl.Visible = $true
