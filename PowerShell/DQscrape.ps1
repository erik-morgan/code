# fetch_data_xl.ps
# Measure-Command cmdlet for timing
# PS4 has collection.ForEach METHOD (vs statement)
# Test difference if using arraylist of hashtables vs arraylist vs array
# 

Write-Host '# ImportHTML adds simple web scraping functionality to excel.
# Several pieces of information are required to process a sheet:
#     1. The base URL
#     2. The location of the data in excel: This means it needs the workbook (file), worksheet (index), and range.
#        The range contains the query values (eg 2-602835 in "http://houston/ErpWeb/PartDetails.aspx?PartNumber=2-602835")
#     3. The 0-based index of the desired table
#     4. Whether it is a correctly marked-up table or not.'

Do {
    $doc = Read-Host -Prompt 'Workbook Path (Hint: drag file onto this window)'
}
Until ([System.IO.File]::Exists($doc))

Do {
    $baseURL = Read-Host -Prompt 'Base URL (eg http://houston/ErpWeb/PartDetails.aspx?PartNumber=)'
}
Until ($baseURL -like 'http://houston/*=')

Do {
    $sheetIndex = Read-Host -Prompt 'Index of worksheet containing data'
}
Until ($sheetIndex -gt 0)

Do {
    $dataRange = Read-Host -Prompt 'Data range (MUST be in one column)'
}
Until ($dataRange -match '([A-Z]+[0-9]+:\1[0-9]+')

Do {
    $tableIndex = Read-Host -Prompt 'Index of table to scrape (zero-based)'
}
Until ($tableIndex -gt 0)

$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false
$wb = $xl.Workbooks.Open($doc)
$ws = $wb.Worksheets.Item[$sheetIndex]
$data = @($ws.Range($dataRange) | Select text)
$dataHeader = $baseURL -replace '.+\?(\w+)=', '$1'
$scraped = New-Object System.Collections.ArrayList
foreach ($val in $data) {
    # $tableData = New-Object System.Collections.Specialized.OrderedDictionary
    $tableData = @{}
    $html = (Invoke-WebRequest "$baseURL$val").Content -replace '<(area|base|col|embed|hr|img|input|link|meta|param|source|track|wbr)( [^>]+)?>', ''
    [xml]$xdoc = $html -replace '&\S+;', ''
    $ns = new-object Xml.XmlNamespaceManager $xdoc.NameTable
    $ns.AddNamespace("ns", $xdoc.DocumentElement.Attributes.GetNamedItem('xmlns'))
    $table = $xdoc.getElementsByTagName('table')[$tableIndex]
    $headerClass = 'a'
    $tableData.Add($dataHeader, $val)
    $table.SelectNodes('.//ns:td[@class="a"]', $ns) | % {
        $tableData[$_.innerText.Trim()] = $_.NextSibling.InnerText.Trim()
    }
    $scraped.Add($tableData)
}
$ws = $wb.Worksheets.Add(,$wb.Worksheets[-1])
if (($wb.Worksheets | where Name -eq 'DQscrape').Count) {
    $ws.Name = $ws.Name -replace 'Sheet', 'DQscrape'
}
else {
    $ws.Name = 'DQscrape'
}
$range = $ws.Range('A1').Resize(1, $tableData.Count)
$range.Value2 = $tableData.Keys
foreach ($ht in $scraped) {
    $range = $range.Offset(1, 0)
    $range.Value2 = @($ht.Values)
}
$wb.save()
$xl.Visible = $true

# OPTIONS:
# 1. Get desired header values and use table.innerText + regex for data extraction
# 2. Use class names or other attributes to specify header vs data cells
# 3. Use colgroup and col tags
# if ($table.getElementsByTagName('th').Count -eq 0 -And $table.getElementsByTagName('thead').Count -eq 0) {
#     $headers = $table.SelectNodes('.//ns:td[not(@style)]')
#     if ($headers.Count -eq 0) {
#         Write-Host 'This html structure is really bad, and I need more information to get your data.'
#         $headerPath = Read-Host -Prompt 'Enter the relative xpath for header elements (prefixed with "ns:"; eg ".//ns:td[@class="a"]")'
#         $headerPath = Read-Host -Prompt 'Enter the relative xpath for data elements (prefixed with "ns:"; eg ".//ns:td[not(@class="a")]")'
#         $headers = $table.SelectNodes($headerPath)
#         if ($headers.Count -eq 0) {
#             Write-Host 'Sorry, better luck next time. Exiting...'
#             $xl.quit()
#             Exit 1
#         }
#     }
# }

# $cells = @($row.Cells)
# if ($cells[0].tagName -eq 'th') {
#     $headers = @($cells | foreach { $_.innerText.Trim() })
#     continue
# }
# $resultObject = [Ordered] @{}
# for($counter = 0; $counter -lt $cells.Count; $counter++) {
#     $title = $titles[$counter]
#     if(-not $title) { continue }
#     $resultObject[$title] = ("" + $cells[$counter].InnerText).Trim()
# }
# $headers = ($headerNodes | Select-Object -ExpandProperty InnerText).Trim()
# foreach ($head in $headerNodes) {}

# $ws.UsedRange.Columns.Item(1)
# TIME THE DIFFERENCE BETWEEN EXPORTING TO CSV AND GRABBING DATA FROM EXCEL
# $csvFile = $doc.Replace('.xlsx', '.csv')
# $ws.SaveAs($csvFile, 6)
# $csv = Import-Csv -path $csvFile
# foreach($line in $csv)
# {
#     $props = $line | Get-Member -MemberType Properties
#     for($i=0; $i -lt $props.Count; $i++)
#     {
#         $col = $props[$i]
#         $colval = $line | Select -ExpandProperty $col.Name
#     }
# }
