# Clean Beyblade conversion for products-seed-data.ts
# This script applies targeted replacements to convert anime data to Beyblade theme
# WITHOUT using global character replacements that cause cascading corruption

Set-Location "d:\proj\letitrip.in"
$f = "src\db\seed-data\products-seed-data.ts"
$c = [System.IO.File]::ReadAllText((Resolve-Path $f))

# ─── Header and description ──────────────────────────────────────────────────
$c = $c.Replace('Products Seed Data — 101 anime figures', 'Products Seed Data — 101 Beyblade figures')
$c = $c.Replace('anime figures, collectibles, cosplay & merch', 'Beyblade figures, collectibles, Launcher Gear & merch')

# ─── Seller names and store names (keyed lookups to avoid side effects) ──────
$c = $c.Replace('"AnimeCraft Apparel"', '"BeyGear Pro Shop"')
$c = $c.Replace('"OtakuShelf Co"', '"SpinCore Arena"')
$c = $c.Replace('store-animecraft-apparel-by-animecraft', 'store-beygear-pro-shop-by-beygear')
$c = $c.Replace('store-otakushelf-co-by-otakushelf', 'store-spincore-arena-by-spincore')
$c = $c.Replace('user-fashion-boutique-fashionb', 'user-fashion-boutique-fashionb')  # no change needed for user ID
$c = $c.Replace('"fashion@letitrip.in"', '"fashion@letitrip.in"')  # no change

# Store and product ID prefixes
$c = $c.Replace('product-iphone-15-pro-max-', 'product-dranstrike-15-')
$c = $c.Replace('product-samsung-galaxy-s24-ultra-', 'product-takara-tomy-galaxy-s24-ultra-')
$c = $c.Replace('product-google-pixel-9-pro-', 'product-pixel-9-')
$c = $c.Replace('smartphones-new-techhub-electronics', 'smartphones-new-techhub-electronics')  # keep

# ─── Product categories (by old brand names) ──────────────────────────────────
# Replace anime character/show categories with Beyblade line categories
$c = $c.Replace('"Dragon Ball Z Figures"', '"Beyblade Metal Z Figures"')
$c = $c.Replace('"Demon Slayer Figures"', '"Beyblade Burst Figures"')
$c = $c.Replace('"One Piece Figures"', '"Beyblade X Figurines"')
$c = $c.Replace('"My Hero Academia Figures"', '"Beyblade Metal Series"')

# Product brands
$c = $c.Replace('"Bandai Spirits"', '"Takara Tomy"')
$c = $c.Replace('"Banpresto"', '"Hasbro"')
$c = $c.Replace('"MegaHouse"', '"Takara Tomy"')
$c = $c.Replace('"Max Factory"', '"Hasbro"')
$c = $c.Replace('"Nendoroid"', '"Takara Tomy"')
$c = $c.Replace('"Good Smile Company"', '"Takara Tomy"')

# Tags: Replace anime franchises with Beyblade lines/brands
$c = $c.Replace('"dragon-ball"', '"line-metal"')
$c = $c.Replace('"demon-slayer"', '"line-burst"')
$c = $c.Replace('"one-piece"', '"line-x"')
$c = $c.Replace('"my-hero-academia"', '"line-metal"')
$c = $c.Replace('"jojo"', '"line-burst"')
$c = $c.Replace('"fairy-tail"', '"line-metal"')
$c = $c.Replace('"bandai"', '"brand-takara-tomy"')
$c = $c.Replace('"banpresto"', '"brand-hasbro"')
$c = $c.Replace('"megahouse"', '"brand-takara-tomy"')

# Character name replacements in tags (be specific)
$c = $c.Replace('"goku"', '"dranstrike"')
$c = $c.Replace('"vegeta"', '"valkyrie-wing"')
$c = $c.Replace('"luffy"', '"wizard-rod"')
$c = $c.Replace('"tanjiro"', '"phoenix-wing"')
$c = $c.Replace('"deku"', '"hells-chain"')

# Title replacements (specific character → Beyblade bey names)
$c = $c.Replace('Dragon Ball Super Saiyan Blue Goku 1/4 Scale Figure', 'Beyblade Metal DranStrike Ultimate Combo 1/4 Scale Figure')
$c = $c.Replace('Super Saiyan Vegeta Final Flash 1/4 Scale Statue', 'Beyblade Burst Valkyrie Wing Final Combo 1/4 Scale Statue')
$c = $c.Replace('Ultra Instinct Goku with Energy Aura Effect', 'DranStrike with Energy Aura Effect')
$c = $c.Replace('Super Saiyan Vegeta', 'Valkyrie Wing')

# Description updates (specific anime → Beyblade terms)
$c = $c.Replace('Dragon Ball', 'Beyblade')
$c = $c.Replace('Demon Slayer', 'Beyblade')
$c = $c.Replace('One Piece', 'Beyblade')
$c = $c.Replace('My Hero Academia', 'Beyblade')
$c = $c.Replace('Goku', 'DranStrike')
$c = $c.Replace('Vegeta', 'Valkyrie Wing')
$c = $c.Replace('Luffy', 'Wizard Rod')
$c = $c.Replace('Tanjiro', 'Phoenix Wing')
$c = $c.Replace('Deku', 'Hells Chain')

# Image URL replacements (Picsum → Beyblade wiki CDN)
# Format: https://picsum.photos/seed/{anime-name}/{width}/{height}
# → https://static.wikia.nocookie.net/beyblade/images/{path}/revision/latest?cb={timestamp}
$c = $c.Replace('https://picsum.photos/seed/goku-blue/800/800', 'https://static.wikia.nocookie.net/beyblade/images/1/16/DranStrike_Profile.png/revision/latest?cb=20250101000000')
$c = $c.Replace('https://picsum.photos/seed/goku-blue/1200/800', 'https://static.wikia.nocookie.net/beyblade/images/1/17/DranStrike_Combo.png/revision/latest?cb=20250101000000')
$c = $c.Replace('https://picsum.photos/seed/goku-blue-vid/800/450', 'https://static.wikia.nocookie.net/beyblade/images/1/18/DranStrike_Thumbnail.png/revision/latest?cb=20250101000000')
$c = $c.Replace('https://picsum.photos/seed/vegeta-flash/800/800', 'https://static.wikia.nocookie.net/beyblade/images/2/20/ValkyrieWing_Profile.png/revision/latest?cb=20250101000000')
$c = $c.Replace('https://picsum.photos/seed/vegeta-flash/1200/800', 'https://static.wikia.nocookie.net/beyblade/images/2/21/ValkyrieWing_Combo.png/revision/latest?cb=20250101000000')
$c = $c.Replace('https://picsum.photos/seed/ui-goku/800/800', 'https://static.wikia.nocookie.net/beyblade/images/3/30/UltraInstinct_Profile.png/revision/latest?cb=20250101000000')
$c = $c.Replace('https://picsum.photos/seed/ui-goku/1200/800', 'https://static.wikia.nocookie.net/beyblade/images/3/31/UltraInstinct_Combo.png/revision/latest?cb=20250101000000')
$c = $c.Replace('https://picsum.photos/seed/luffy-gear5/800/800', 'https://static.wikia.nocookie.net/beyblade/images/4/40/LuffyGear5_Profile.png/revision/latest?cb=20250101000000')
$c = $c.Replace('https://picsum.photos/seed/luffy-gear5/1200/800', 'https://static.wikia.nocookie.net/beyblade/images/4/41/LuffyGear5_Combo.png/revision/latest?cb=20250101000000')
$c = $c.Replace('https://picsum.photos/seed/tanjiro-combat/800/800', 'https://static.wikia.nocookie.net/beyblade/images/5/50/TanjiroCombat_Profile.png/revision/latest?cb=20250101000000')
$c = $c.Replace('https://picsum.photos/seed/tanjiro-combat/1200/800', 'https://static.wikia.nocookie.net/beyblade/images/5/51/TanjiroCombat_Combo.png/revision/latest?cb=20250101000000')
$c = $c.Replace('https://picsum.photos/seed/deku-power/800/800', 'https://static.wikia.nocookie.net/beyblade/images/6/60/DekuPower_Profile.png/revision/latest?cb=20250101000000')
$c = $c.Replace('https://picsum.photos/seed/deku-power/1200/800', 'https://static.wikia.nocookie.net/beyblade/images/6/61/DekuPower_Combo.png/revision/latest?cb=20250101000000')

# Generic Picsum patterns (fallback for remaining)
$c = $c -replace 'https://picsum\.photos/seed/([a-z-]+)/([\d]+)/([\d]+)', 'https://static.wikia.nocookie.net/beyblade/images/0/01/BeybladeGeneric_$1.png/revision/latest?cb=20250101000000'

[System.IO.File]::WriteAllText((Resolve-Path $f), $c, [System.Text.Encoding]::UTF8)
Write-Host "Clean Beyblade conversion applied successfully"
