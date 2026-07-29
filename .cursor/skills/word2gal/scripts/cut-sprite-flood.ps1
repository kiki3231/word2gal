param(
  [Parameter(Mandatory = $true)][string]$InputPath,
  [Parameter(Mandatory = $true)][string]$OutputPath,
  [int]$Tolerance = 42
)

Add-Type -AssemblyName System.Drawing

$bmp = [System.Drawing.Bitmap]::FromFile((Resolve-Path $InputPath))
$w = $bmp.Width
$h = $bmp.Height
$out = New-Object System.Drawing.Bitmap $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

function ColorDist([System.Drawing.Color]$a, [System.Drawing.Color]$b) {
  $dr = [int]$a.R - [int]$b.R
  $dg = [int]$a.G - [int]$b.G
  $db = [int]$a.B - [int]$b.B
  return [Math]::Sqrt($dr * $dr + $dg * $dg + $db * $db)
}

# Sample background from four corners (typical AI sprite canvas)
$corners = @(
  $bmp.GetPixel(2, 2),
  $bmp.GetPixel($w - 3, 2),
  $bmp.GetPixel(2, $h - 3),
  $bmp.GetPixel($w - 3, $h - 3)
)
$bgR = 0; $bgG = 0; $bgB = 0
foreach ($c in $corners) { $bgR += $c.R; $bgG += $c.G; $bgB += $c.B }
$bg = [System.Drawing.Color]::FromArgb(255, [int]($bgR / 4), [int]($bgG / 4), [int]($bgB / 4))

# Copy source
for ($y = 0; $y -lt $h; $y++) {
  for ($x = 0; $x -lt $w; $x++) {
    $out.SetPixel($x, $y, $bmp.GetPixel($x, $y))
  }
}

$visited = New-Object 'bool[,]' $w, $h
$queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

function EnqueueEdge([int]$x, [int]$y) {
  if ($x -lt 0 -or $y -lt 0 -or $x -ge $w -or $y -ge $h) { return }
  if ($visited[$x, $y]) { return }
  $pix = $bmp.GetPixel($x, $y)
  if ((ColorDist $pix $bg) -gt $Tolerance) { return }
  $visited[$x, $y] = $true
  $queue.Enqueue([System.Drawing.Point]::new($x, $y))
}

for ($x = 0; $x -lt $w; $x++) {
  EnqueueEdge $x 0
  EnqueueEdge $x ($h - 1)
}
for ($y = 0; $y -lt $h; $y++) {
  EnqueueEdge 0 $y
  EnqueueEdge ($w - 1) $y
}

$transparent = [System.Drawing.Color]::FromArgb(0, 0, 0, 0)
$dirs = @(
  @(1, 0), @(-1, 0), @(0, 1), @(0, -1)
)

while ($queue.Count -gt 0) {
  $p = $queue.Dequeue()
  $out.SetPixel($p.X, $p.Y, $transparent)
  foreach ($d in $dirs) {
    $nx = $p.X + $d[0]
    $ny = $p.Y + $d[1]
    if ($nx -lt 0 -or $ny -lt 0 -or $nx -ge $w -or $ny -ge $h) { continue }
    if ($visited[$nx, $ny]) { continue }
    $pix = $bmp.GetPixel($nx, $ny)
    if ((ColorDist $pix $bg) -le $Tolerance) {
      $visited[$nx, $ny] = $true
      $queue.Enqueue([System.Drawing.Point]::new($nx, $ny))
    }
  }
}

$dir = Split-Path -Parent $OutputPath
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
$out.Save((Join-Path (Resolve-Path $dir) (Split-Path -Leaf $OutputPath)), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$out.Dispose()
Write-Output "flood-cut OK: $OutputPath"
