# get_rework_instructions.ps

Write-Host "# ImportHTML adds simple web scraping functionality to excel."
Write-Host "# This is a customized version for NCR Rework Instructions, and will not work with ANYTHING else."
Write-Host "# I'll need some information to process the data:"
Write-Host "#     - The base URL (http://houston/ErpWeb/NCRStatus.aspx?NCRNumber=)"
Write-Host "#     - The location of the data in excel (workbook, worksheet index, and data range"

Do {
    $doc = Read-Host -Prompt "Workbook Path (Hint: shift+right click in Explorer & Copy as path)"
}
Until ([System.IO.File]::Exists($doc))

Do {
    $baseURL = Read-Host -Prompt "Base URL (eg http://houston/ErpWeb/NCRStatus.aspx?NCRNumber=)"
}
Until ($baseURL -like "http://houston/*=")

Do {
    $dataRange = Read-Host -Prompt "Data range (MUST be in one column; Do NOT include header cell)"
}
Until ($dataRange -match "([A-Z]+[0-9]+:\1[0-9]+")

$xl = [Runtime.Interopservices.Marshal]::GetActiveObject('Excel.Application')
if (!$xl) {
    $xl = New-Object -ComObject Excel.Application
}
$wbName = Split-Path $doc -Leaf
$wb = $xl | Where-Object -Property Name -eq $wbName
if (!$wb) {
    $wb = $xl.Workbooks.Open($doc)
}
$wb.Save()
$xl.Visible = $false
if ($wb.Worksheets.Count -gt 1) {
    Do {
        $sheetIndex = Read-Host -Prompt "Index of worksheet containing data"
    }
    Until ($sheetIndex -gt 0)
    $ws = $wb.Worksheets.Item($sheetIndex)
}
else {
    $ws = $wb.Worksheets.Item(1)
}

$range = $ws.Range($dataRange)
$dataHeader = "Rework Instructions"
$data = ($range | Select-Object -ExpandProperty Value2)
$dataCount = $data.Count
$scraped = New-Object "object[,]" $dataCount,1
$ie = New-Object -ComObject InternetExplorer.Application
$ie.Visible = $false
$id = "DMRList_ctl00_ReworkInstructionTableCell"
$row = 0
# $web = New-Object System.Net.WebClient
foreach ($val in $data) {
    $ie.Navigate("$baseURL$val")
    do {
        sleep -Milliseconds 100
    }
    Until ($ie.ReadyState -eq 4)
    $scraped[$i,0] = $ie.Document.getElementById($id).innerText.Trim()
    $i++
    Write-Host "Page $i of $dataCount"
}
$offsetCols = $ws.UsedRange.Columns.Count - $range.Column + 1
if ($range.Row -gt 1) {
    $ws.Cells.Item($range.Row - 1, $range.Column + $offsetCols).Value2 = $dataHeader
}
$range.Offset(0, $offsetCols).Value2 = $tableData
$range.Offset(0, $offsetCols).WrapText = $false
$ie.Quit()
$xl.Visible = $true
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ie)
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($xl)
