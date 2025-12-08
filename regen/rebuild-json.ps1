$src = ".\cards\wom_cards_vB.fixed.min.json"
$out = ".\cards\json_new"

$cards = Get-Content $src -Raw | ConvertFrom-Json

if ($cards.cards) {
  $cards = $cards.cards
}

function Normalize-Name($s) {
  $s = $s.ToLower()
  $s = $s.Normalize([Text.NormalizationForm]::FormD)
  $s = -join ($s.ToCharArray() | Where-Object {
    [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne "NonSpacingMark"
  })
  $s -replace "[^a-z0-9 ]", "" -replace "\s+", " "
}

$count = 0

foreach ($c in $cards) {
  if (-not $c.id) { continue }

  $obj = [ordered]@{
    id = $c.id
    name = $c.name
    name_normalized = Normalize-Name $c.name
    type = $c.type
    color = $c.color
    expansion = $c.expansion
    number = $c.number
    image_url = "https://raw.githubusercontent.com/Gogeth-parlante/WoM-Cards/main/cards/$($c.id).jpg"
  }

  $json = $obj | ConvertTo-Json -Depth 5
  $file = "$out\$($c.id).json"

  $json | Out-File -Encoding utf8 -FilePath $file
  $count++
}

Write-Host "Creati $count file JSON"
