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

$xl = New-Object -comobject Excel.Application
$xl.Visible = $false
$wb = $xl.Workbooks.Open($doc)
$ws = $wb.Worksheets.Item($sheetIndex)
# $range = $ws.Range($dataRange)
$data = $ws.Range($dataRange) | Select text
ForEach ()
$xl.quit()
