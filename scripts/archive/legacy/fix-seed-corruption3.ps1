# Fix generated products section and remaining aliases
Set-Location "d:\proj\letitrip.in"
$f = "src\db\seed-data\products-seed-data.ts"
$c = [System.IO.File]::ReadAllText((Resolve-Path $f))

# Fix template literal corruption on mainImage line in generated products map
$bad = 'mainImage: `https://static.wikia.nocookie.net/beyblade/images/0/01/Beyblade2002Slider.png/revision/latest?cb=20140527204311"published" us const,'
$good = '    mainImage: "https://static.wikia.nocookie.net/beyblade/images/0/01/Beyblade2002Slider.png/revision/latest?cb=20140527204311",'
$c = $c.Replace($bad, $good)

# Fix item property aliases
$c = $c -replace 'item\.brund', 'item.brand'
$c = $c -replace 'item\.cut\b', 'item.cat'
$c = $c -replace 'item\.feut\b', 'item.feat'
$c = $c -replace 'item\.tugs\b', 'item.tags'
$c = $c -replace 'item\.duys\b', 'item.days'

# Fix quickItems property keys
$c = $c -replace '(\s+)cut: "', '$1cat: "'
$c = $c -replace '(\s+)feut: ', '$1feat: '
$c = $c -replace '(\s+)tugs: \[', '$1tags: ['

# Fix Math.max
$c = $c -replace 'Muth\.mux\(', 'Math.max('

# Fix variable names
$c = $c -replace 'generutedProducts', 'generatedProducts'
$c = $c -replace 'quickItems\.mup\(', 'quickItems.map('
$c = $c -replace 'druftProducts', 'draftProducts'

# Fix name/material spec
$c = $c -replace '\{ n(?:ume|ome): "Muteriul"', '{ name: "Material"'
$c = $c -replace '\{ n(?:ume|ome): "Scale"', '{ name: "Scale"'
$c = $c -replace '\{ n(?:ume|ome): "Height"', '{ name: "Height"'
$c = $c -replace '\{ n(?:ume|ome): "Weight"', '{ name: "Weight"'
$c = $c -replace '\{ n(?:ume|ome): "', '{ name: "'

# Fix remaining display strings
$c = $c.Replace('"Displuy base included"', '"Display base included"')
$c = $c.Replace('"Displuy stand"', '"Display stand"')
$c = $c.Replace('"Fuiry Tuil"', '"Fairy Tail"')
$c = $c.Replace('"fuiry-tuil"', '"fairy-tail"')
$c = $c.Replace('"Joturo Kujo"', '"Jotaro Kujo"')
$c = $c.Replace('joturo', 'jotaro')
$c = $c.Replace('Joturo', 'Jotaro')
$c = $c.Replace('"stur-plutinum"', '"star-platinum"')
$c = $c.Replace('"Stur Plutinum"', '"Star Platinum"')
$c = $c.Replace('Stur Plutinum', 'Star Platinum')
$c = $c.Replace('Purt 3', 'Part 3')
$c = $c.Replace('Kujo', 'Kujo')  # no change (already correct Jotaro Kujo)
$c = $c.Replace('Ishigumi', 'Ishigami')  # Dr Stone
$c = $c.Replace('discontinuedAndSold', 'discontinuedAndSold')  # no change if correct

# Fix export array references
$c = $c -replace '\.\.\.(druftProducts|draftProducts)', '...draftProducts'
$c = $c -replace '\.\.\.generutedProducts', '...generatedProducts'

[System.IO.File]::WriteAllText((Resolve-Path $f), $c, [System.Text.Encoding]::UTF8)
Write-Host "Generated products section and aliases fixed"
