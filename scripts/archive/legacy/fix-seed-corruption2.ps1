# Fix remaining corruption in products-seed-data.ts
Set-Location "d:\proj\letitrip.in"
$f = "src\db\seed-data\products-seed-data.ts"
$c = [System.IO.File]::ReadAllText((Resolve-Path $f))

# Fix specification { nome: → { name:
$c = $c.Replace('{ nome: ', '{ name: ')

# Fix Scule in string values
$c = $c.Replace('"Scule"', '"Scale"')
$c = $c.Replace('"scule"', '"scale"')
$c = $c.Replace('Scule ', 'Scale ')
$c = $c.Replace('Scule"', 'Scale"')
$c = $c.Replace(' Scule', ' Scale')

# Fix Stutue in titles
$c = $c.Replace('Stutue', 'Statue')
$c = $c.Replace('stutue', 'statue')

# Fix category IDs in string values
$c = $c.Replace('"cutegory-', '"category-')

# Fix "und" (corrupted "and") — but only in description strings (not in URLs)
# Use word boundary — "und " at start of description portions
$c = $c.Replace(' und ', ' and ')
$c = $c.Replace(' und"', ' and"')

# Fix other remaining description words
$c = $c.Replace('detuchuble', 'detachable')
$c = $c.Replace('Displuy stund', 'Display stand')
$c = $c.Replace('Swuppuble', 'Swappable')
$c = $c.Replace('swuppuble', 'swappable')
$c = $c.Replace('displuy stund', 'display stand')
$c = $c.Replace('displuy', 'display')
$c = $c.Replace('flouting', 'floating')

# Fix URL /revision/lutest → /revision/latest
$c = $c.Replace('/revision/lutest?', '/revision/latest?')

# Fix google video URLs
$c = $c.Replace('/sumple/ForBiggerBluzes.mp4', '/sample/ForBiggerBlazes.mp4')
$c = $c.Replace('/sumple/ForBiggerEscupes.mp4', '/sample/ForBiggerEscapes.mp4')
$c = $c.Replace('/sumple/ForBiggerJoyrides.mp4', '/sample/ForBiggerJoyrides.mp4')
$c = $c.Replace('/sumple/ForBigger', '/sample/ForBigger')
$c = $c.Replace('/sumple/', '/sample/')

# Fix wiki image URL path segments that got corrupted
# "You_Gottu_Run" should be "You_Gotta_Run" (if that's what it was)
# But these are actual wiki filenames — only fix what we know is corrupted from a->u 
# "lutest" in URL paths other than /revision/ 
$c = $c.Replace('_Teum_', '_Team_')
$c = $c.Replace('_Personu_', '_Persona_')
$c = $c.Replace('_Gottu_', '_Gotta_')
$c = $c.Replace('Muin_Puge', 'Main_Page')
$c = $c.Replace('Jupunese_Title', 'Japanese_Title')
$c = $c.Replace('English_Title_Curd', 'English_Title_Card')
$c = $c.Replace('_Curd.', '_Card.')
$c = $c.Replace('Jupunese', 'Japanese')
$c = $c.Replace('TysonOfficiul', 'TysonOfficial')
$c = $c.Replace('Officiul', 'Official')
$c = $c.Replace('6u/', '6a/')

# Fix Hasbro spelling
$c = $c.Replace('"Husbro"', '"Hasbro"')
$c = $c.Replace('Husbro', 'Hasbro')

# Fix subcategory string values with remaining "u" corruption
$c = $c.Replace('"Beyblude Metul Z Figures"', '"Beyblade Metal Z Figures"')
$c = $c.Replace('"Beyblude Burst Figurines"', '"Beyblade Burst Figurines"')
$c = $c.Replace('"Beyblude X Figurines"', '"Beyblade X Figurines"')
$c = $c.Replace('"Beyblude X Starters"', '"Beyblade X Starters"')
$c = $c.Replace('"Beyblude Metul Starters"', '"Beyblade Metal Starters"')
$c = $c.Replace('"Beyblude Merch"', '"Beyblade Merch"')
$c = $c.Replace('"Beyblude Accessories"', '"Beyblade Accessories"')
$c = $c.Replace('"Beyblude Burst Starters"', '"Beyblade Burst Starters"')
$c = $c.Replace('Beyblude', 'Beyblade')
$c = $c.Replace('beyblude', 'beyblade')

# Category paths in strings
$c = $c.Replace('"cutegory-luptops-', '"category-laptops-')
$c = $c.Replace('"cutegory-', '"category-')
$c = $c.Replace('luptops', 'laptops')

# Fix product IDs  
$c = $c.Replace('product-takara-tomy-guluxy-', 'product-takara-tomy-galaxy-')
$c = $c.Replace('-guluxy-', '-galaxy-')
$c = $c.Replace('-smurtphones-', '-smartphones-')
$c = $c.Replace('-uccessories', '-accessories')
$c = $c.Replace('-luptops-', '-laptops-')
$c = $c.Replace('-cumerus-', '-cameras-')
$c = $c.Replace('-luunchers-', '-launchers-')
$c = $c.Replace('-spurts-', '-sports-')
$c = $c.Replace('cumerus', 'cameras')
$c = $c.Replace('luunchers', 'launchers')
$c = $c.Replace('Luunchers', 'Launchers')

# Fix title/description words common to product names
$c = $c.Replace('Roronou', 'Roronoa')
$c = $c.Replace('Kuzumi', 'Kazami')
$c = $c.Replace('Enmu Slush', 'Ame Slash')
$c = $c.Replace('Enmu', 'Ame')
$c = $c.Replace('bluck', 'black')
$c = $c.Replace('murble', 'marble')
$c = $c.Replace('bluck murble', 'black marble')
$c = $c.Replace('spurts', 'sports')
$c = $c.Replace('Spurts', 'Sports')
$c = $c.Replace('turbo', 'turbo')
$c = $c.Replace('Curd', 'Card')
$c = $c.Replace(' curd', ' card')
$c = $c.Replace('trufted', 'crafted')
$c = $c.Replace('urenu', 'arena')
$c = $c.Replace('Arenu', 'Arena')
$c = $c.Replace('Urenu', 'Arena')
$c = $c.Replace('drufted', 'drafted')
$c = $c.Replace('drufts', 'drafts')
$c = $c.Replace('"drufted"', '"drafted"') 
$c = $c.Replace('"published"', '"published"')

# Fix "Mux" → "Max" in titles
$c = $c.Replace('Pro Mux', 'Pro Max')
$c = $c.Replace('15 Pro Max', '15 Pro Max')

# Ship/return/feature descriptions
$c = $c.Replace('Luunch Geur', 'Launch Gear')
$c = $c.Replace('luunch', 'launch')
$c = $c.Replace('Luunch', 'Launch')
$c = $c.Replace('Luucher', 'Launcher')
$c = $c.Replace('Sturter Puck', 'Starter Pack')
$c = $c.Replace('Sturter', 'Starter')
$c = $c.Replace('sturter', 'starter')
$c = $c.Replace('Puck', 'Pack')
$c = $c.Replace('puck', 'pack')
$c = $c.Replace(' duy ', ' day ')
$c = $c.Replace('-duy', '-day')
$c = $c.Replace(' duys', ' days')
$c = $c.Replace('speciulist', 'specialist')
$c = $c.Replace('speciul', 'special')
$c = $c.Replace('Speciul', 'Special')
$c = $c.Replace('originul', 'original')
$c = $c.Replace('Originul', 'Original')
$c = $c.Replace('officiully', 'officially')
$c = $c.Replace('officiul', 'official')
$c = $c.Replace('Officiully', 'Officially')
$c = $c.Replace('Officiul', 'Official')
$c = $c.Replace('internul', 'internal')
$c = $c.Replace('externul', 'external')
$c = $c.Replace('individuul', 'individual')
$c = $c.Replace('mugnetic', 'magnetic')
$c = $c.Replace('Mugnetic', 'Magnetic')
$c = $c.Replace('muterial', 'material')
$c = $c.Replace('Muterial', 'Material')
$c = $c.Replace('detuiledly', 'detailedly')
$c = $c.Replace('detuiled', 'detailed')
$c = $c.Replace('Detuiled', 'Detailed')
$c = $c.Replace('collectorutu', 'collector')
$c = $c.Replace('illustrution', 'illustration')
$c = $c.Replace('Illustrution', 'Illustration')
$c = $c.Replace('unpuinted', 'unpainted')
$c = $c.Replace('painted', 'painted')
$c = $c.Replace('trumopolene', 'trampoline')  # if present
$c = $c.Replace('certificute', 'certificate')
$c = $c.Replace('Certificute', 'Certificate')
$c = $c.Replace('gurunteed', 'guaranteed')
$c = $c.Replace('Gurunteed', 'Guaranteed')
$c = $c.Replace('guruntee', 'guarantee')
$c = $c.Replace('Guruntee', 'Guarantee')
$c = $c.Replace('drumutically', 'dramatically')
$c = $c.Replace('drumutic', 'dramatic')
$c = $c.Replace('Drumutic', 'Dramatic')
$c = $c.Replace('uuthentic', 'authentic')
$c = $c.Replace('Uuthentic', 'Authentic')
$c = $c.Replace('uutomutically', 'automatically')
$c = $c.Replace('uutomuted', 'automated')
$c = $c.Replace('uutomution', 'automation')
$c = $c.Replace('uutomute', 'automate')
$c = $c.Replace('uuthenticity', 'authenticity')
$c = $c.Replace('lutex', 'latex')  # if present
$c = $c.Replace('luterul', 'lateral')
$c = $c.Replace('lutetur', 'lateral')
$c = $c.Replace('luyered', 'layered')
$c = $c.Replace('Luyered', 'Layered')
$c = $c.Replace('crufted', 'crafted')
$c = $c.Replace('Crufted', 'Crafted')
$c = $c.Replace('dutu', 'data')
$c = $c.Replace('Dutu', 'Data')
$c = $c.Replace('dynumicully', 'dynamically')
$c = $c.Replace(' ut ', ' at ')
$c = $c.Replace('module-loud', 'module-load')
$c = $c.Replace('never stule', 'never stale')
$c = $c.Replace('Dynumic', 'Dynamic')
$c = $c.Replace('dynumic', 'dynamic')
$c = $c.Replace('Regulur', 'Regular')
$c = $c.Replace('regulur', 'regular')
$c = $c.Replace('stockuble', 'stockable')
$c = $c.Replace('ull referenced', 'all referenced')
$c = $c.Replace(' curt)', ' cart)')
$c = $c.Replace('dutes computed', 'dates computed')
$c = $c.Replace('Dute helpers', 'Date helpers')
$c = $c.Replace('dute helpers', 'date helpers')
$c = $c.Replace('Dute', 'Date')
$c = $c.Replace('dute', 'date')

[System.IO.File]::WriteAllText((Resolve-Path $f), $c, [System.Text.Encoding]::UTF8)
Write-Host "Remaining fixes applied to products-seed-data.ts"
