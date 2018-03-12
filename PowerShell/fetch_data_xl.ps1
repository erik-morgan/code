# fetch_data_xl.ps
# http://houston/ErpWeb/NCRStatus.aspx?NCRNumber=177940
# Write-Host '# ImportHTML adds simple web scraping functionality to excel.
# # There are two ways to run this: 
# # 
# # 
# #
# # IMPORTANT! This script always uses the first sheet in the workbook
# #
# # IMPORTANT! If only two parameters are given programatically, or the base url and query value point to the same
# #
# # Three pieces of information are required to process a sheet:
# #     1. The base URL
# #     2. The query value (eg 2-602835 in "http://houston/ErpWeb/PartDetails.aspx?PartNumber=2-602835")
# #     3. The 0-based index of the desired table
# # The script can be run interactively, like now, or programmatically. If programmatically, you must
# # provide the required data as arguments like so:
# #
# #     importHTML "http://houston/ErpWeb/PartDetails.aspx?PartNumber=" 2 4
# #
# # This means that the query values can be found in column C (zero-based index 2), and that it will
# # scrape the FIFTH (zero-based index 4) table on the page.
# '
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

Write-Host '# ImportHTML adds simple web scraping functionality to excel.
# Currently only supports data on first sheet of a workbook.
# All indexes are zero-based (Cell B5 is Row 4 of Column 1).'

# Measure-Command cmdlet for timing
# PS4 has collection.ForEach METHOD (vs statement)
# 

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
    $tableIndex = Read-Host -Prompt 'Index of table to scrape (one-based)'
}
Until ($tableIndex -gt 0)

$xl = New-Object -comobject Excel.Application
$xl.Visible = $false
$wb = $xl.Workbooks.Open($doc)
$ws = $wb.Worksheets.Item($sheetIndex)
# $range = $ws.Range($dataRange)
$data = @($ws.Range($dataRange) | Select text)
$dataHeader = $baseURL -replace '.+\?(\w+)=', '$1'
$scraped = New-Object System.Collections.ArrayList
foreach ($val in $data) {
    $tableData = New-Object System.Collections.Specialized.OrderedDictionary
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
# Test difference if using arraylist of hashtables vs arraylist vs array
# $([xml]$web).html.body.table.tr[5].td[1].b
# Add-Type -AssemblyName System.Xml.Linq
# $txt=[IO.File]::ReadAllText("c:\myhtml.html")
# $xml = [System.Xml.Linq.XDocument]::Parse($txt)
# $ns='http://www.w3.org/1999/xhtml'
# $divs=$cells = $xml.Descendants("{$ns}td")
# 
# USE XML!
# html empty tags: area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr
# regex to find: <(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)( [^>]+)?>

$xl.quit()

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
# foreach ($head in $headerNodes) {
    
# }
