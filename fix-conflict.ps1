$c = Get-Content "src/routes/dashboard.familles.tsx" -Raw
$start = $c.IndexOf("<<<<<<< HEAD")
$end = $c.IndexOf(">>>>>>> 1bcdafa9ed6c4facab5db2d116e2015d46e9949c") + 44
$lineBreak = [Environment]::NewLine
$replacement = "import { listClients, createClient, updateClient, deleteClient, getClient, importClientsCsv, type ClientInput } from `"@/lib/server-clients`";" + $lineBreak
$replacement += "import { getSettings, listLevels } from `"@/lib/server-settings`";" + $lineBreak
$replacement += "import { StudentFields } from `"@/components/student-fields`";" + $lineBreak
$replacement += "import { usePagination, TablePagination } from `"@/components/table-pagination`";" + $lineBreak
$c = $c.Substring(0, $start) + $replacement + $c.Substring($end)
Set-Content "src/routes/dashboard.familles.tsx" -Value $c
