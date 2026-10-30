# 作品データを作るスクリプト
# 「works」フォルダの中身を変えたら、右クリック >「PowerShell で実行」してください。
# works の各フォルダ（work.json とソースコード）を読み、works-data.js を作ります。
# index.html はこの works-data.js を使って、作品カードとコードビューアーを表示します。
#
# work.json の例（featured が true だと大きなカードになります）:
#   { "title": "...", "en": "...", "cat": "oop", "desc": "...", "tech": ["Java"], "order": 10,
#     "featured": false, "preview": "menu.html", "visual": "terminal", "screen": ["行1", "行2"] }

$root = $PSScriptRoot
$codeTypes = @(".java", ".jsp", ".csv", ".sql", ".html", ".css")

$list = @()
foreach ($dir in Get-ChildItem "$root\works" -Directory) {
  $metaPath = "$($dir.FullName)\work.json"
  if (-not (Test-Path $metaPath)) { continue }
  $meta = Get-Content $metaPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $files = @()
  $lines = 0
  foreach ($f in Get-ChildItem $dir.FullName -Recurse -File | Sort-Object FullName) {
    if ($f.Name -eq "work.json") { continue }
    $path = $f.FullName.Substring($dir.FullName.Length + 1).Replace("\", "/")
    if ($path -like "details/*") { continue }  # 自動で作られた詳細ページはプレビューで見る
    if ($codeTypes -notcontains $f.Extension.ToLower()) { continue }
    $text = [IO.File]::ReadAllText($f.FullName, [Text.Encoding]::UTF8)
    if ($f.Extension -eq ".java") { $lines += ($text -split "`n").Count }
    # 見やすくするため、よくある前半部分を省略する
    $short = $path -replace '^src/main/java/', '' -replace '^src/main/webapp/', 'webapp/' -replace '^src/', ''
    $files += [ordered]@{ path = $short; text = $text }
  }
  $item = [ordered]@{ id = $dir.Name; lines = $lines; fileCount = $files.Count; files = $files }
  foreach ($p in $meta.PSObject.Properties) { $item[$p.Name] = $p.Value }
  $list += $item
}
$list = @($list | Sort-Object { [int]$_.order })

$json = ConvertTo-Json -InputObject $list -Depth 6 -Compress
$utf8 = New-Object Text.UTF8Encoding $false
[IO.File]::WriteAllText("$root\works-data.js", "window.WORKS = $json;`n", $utf8)
Write-Host "works-data.js を更新しました: $($list.Count) 件"
