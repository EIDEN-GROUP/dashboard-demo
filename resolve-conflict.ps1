$path = "src/routes/dashboard.familles.tsx"
$c = Get-Content $path -Raw

$conflictStart = $c.IndexOf("<<<<<<< HEAD")
$equalSign = $c.IndexOf("=======")
$endMarker = $c.IndexOf(">>>>>>> b2e6351 (Add superadmin panel, support button, i18n updates, and dashboard improvements)")
$end = $endMarker + 100

$afterMarker = $c.Substring($end)
$keepStartLocal = $equalSign + 7
$keepLength = $end - $keepStartLocal - 1
$keepLocal = $c.Substring($keepStartLocal, $keepLength)

$c = $c.Substring(0, $conflictStart) + $keepLocal + $afterMarker
Set-Content $path -Value $c
