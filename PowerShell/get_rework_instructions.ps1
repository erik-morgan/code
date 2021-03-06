$doc = "C:\Users\morganel\Desktop\NCRs.xlsx"
$baseURL = "http://houston/ErpWeb/NCRStatus.aspx?NCRNumber="
$dataRange = "A2:A101"
try {
    $xl = [Runtime.Interopservices.Marshal]::GetActiveObject('Excel.Application')
}
catch {
    $xl = New-Object -ComObject Excel.Application
}
$sw = [Diagnostics.Stopwatch]::StartNew()
$wbName = Split-Path $doc -Leaf
$wb = ($xl.Workbooks | Where-Object { $_.Name -eq $wbName })
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
$offsetCols = $ws.UsedRange.Columns.Count - $range.Column + 1
$data = ($range | Select-Object -ExpandProperty Value2)
Write-Host $sw.Elapsed
$dataCount = $data.Count
$scraped = New-Object "object[,]" $dataCount,1
$ie = New-Object -ComObject InternetExplorer.Application
$ie.Visible = $false
for ($row = 0; $row -lt $dataCount; $row++) {
    $ie.Navigate("$url")
    do {
        sleep -Milliseconds 200
    }
    Until ($ie.ReadyState -eq 4)
    $scraped[$row,0] = $ie.Document.getElementById("DMRList_ctl00_ReworkInstructionTableCell").innerText.Trim()
    Write-Host "Page $row of $dataCount"
}
Write-Host $sw.Elapsed
Write-Host "Scraping Complete! Putting data into Excel..."
if ($range.Row -gt 1) {
    $ws.Cells.Item($range.Row - 1, $range.Column + $offsetCols).Value2 = "Rework Instructions"
}
$range.Offset(0, $offsetCols).Value2 = $scraped
$range.Offset(0, $offsetCols).WrapText = $false
$ie.Quit()
$xl.Visible = $true
$sw.Stop()
Write-Host $sw.Elapsed
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($ie)
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($xl)