"""
Final cleanup pass - fix remaining anime refs after v2 script
"""
import os, re

SEED_DIR = r'd:\proj\letitrip.in\appkit\src\seed'

fixes = {
    'products-seed-data.ts': [
        # Tags: beyblade variants -> pokemon
        ('"beyblade-x"',       '"pokemon-tcg"'),
        ('"beyblade-burst"',   '"pokemon-tcg"'),
        ('"beyblade"',         '"pokemon"'),
        ('"jojo"',             '"pokemon-battle"'),
        ('"jotaro"',           '"mewtwo"'),
        ('"star-platinum"',    '"star-force"'),
        ('"frieren"',          '"pokemon-legends-arceus"'),
        ('"fern"',             '"gardevoir"'),
        # Remaining description text
        ('Custom Shenron LED lamp with 7 beyblade base', 'Custom Charizard LED lamp with flame effects'),
        ('Alter Frieren with 3 face plates and floating spell effect parts',
         'Gardevoir with 3 expression plates and floating Pok\u00e9ball effect parts'),
        # Remaining Frieren / Jojo in text
        ('Frieren', 'Pok\u00e9mon Legends Arceus'),
        ('frieren', 'pokemon-legends-arceus'),
        ('JoJo', 'Pok\u00e9mon Battle'),
        ('jojo', 'pokemon-battle'),
        # picsum seeds still referencing anime
        ('picsum.photos/seed/beyblade-', 'picsum.photos/seed/pokemon-'),
        ('picsum.photos/seed/frieren-', 'picsum.photos/seed/gardevoir-'),
        # remaining tags
        ('"dran-sword"',           '"charizard"'),
        ('"valkyrie"',             '"blastoise"'),
        ('"ultra-instinct"',       '"venusaur"'),
        ('"takara-tomy"',          '"the-pokemon-company"'),
        ('"phoenix-wing"',         '"pokemon-phoenix"'),
        ('"nezuko"',               '"misty"'),
        ('"kimono"',               '"trainer-outfit"'),
        ('"capsule-corp"',         '"poke-ball"'),
        ('"infinity"',             '"eeveelution"'),
        ('"hells-chain"',          '"umbreon"'),
        ('"bankai"',               '"dark-type"'),
        ('"shfiguarts"',           '"pokemon-center"'),
        ('"scouter"',              '"pokedex"'),
        ('"gift-set"',             '"gift-set"'),
        ('"son-family"',           '"gold-collection"'),
        ('"shenron"',              '"charizard-led"'),
        ('"cobalt-drake"',         '"mewtwo"'),
        ('"rendran-sword"',        '"jolteon"'),
        ('"bijuu"',                '"eeveelutions"'),
        ('"toshiro"',              '"glaceon"'),
        ('"daima"',                '"dragonite"'),
        ('"chibi"',                '"mini-figure"'),
        ('"nobara"',               '"trainer-leaf"'),
        ('"inosuke"',              '"arcanine"'),
        ('"byakuya"',              '"leafeon"'),
        ('"gohan"',                '"hydreigon"'),
        ('"muichiro"',             '"suicune"'),
        ('"tamayo"',               '"nurse-joy"'),
        ('"vegito"',               '"dragonite-punch"'),
        ('"zenitsu"',              '"raichu"'),
        ('"yuji"',                 '"lucario"'),
        ('"cell"',                 '"dragonite-cell"'),
    ],

    'categories-seed-data.ts': [
        # SEO title/description Beyblade -> Pokemon
        ('Premium Beyblade products and collectibles', 'Premium Pok\u00e9mon products and collectibles'),
        ('Scale Figures \ufffd Beyblade Collectibles', 'Scale Figures \u2014 Pok\u00e9mon Collectibles'),
        ('Shop premium Beyblade products including Beyblade Z, Beyblade, Beyblade, and more',
         'Shop premium Pok\u00e9mon products including graded cards, TCG singles, figures, and more'),
        ('"beyblade figures"', '"pok\u00e9mon figures"'),
        ('"beyblade"', '"pok\u00e9mon"'),
        # Category name/descriptions
        ('"Beyblade Figures"', '"Pok\u00e9mon Figures"'),
        ('Beyblade Z and Beyblade Super scale figures', 'Pok\u00e9mon scale figures and collectibles'),
        ('Beyblade Figures \ufffd Dran Sword, Valkyrie & More', 'Pok\u00e9mon Figures \u2014 Charizard, Mewtwo & More'),
        ('Shop Beyblade Z and Super scale figures by Takara Tomy, Takara Tomy, and Hasbro',
         'Shop Pok\u00e9mon scale figures by The Pok\u00e9mon Company, Bandai, and GSC'),
        ('"beyblade-x"', '"pokemon-figures"'),
        ('Large-scale Beyblade, Beyblade X, and premium beyblade statues',
         'Large-scale Pok\u00e9mon, Pok\u00e9mon Legends, and premium Pok\u00e9mon statues'),
        ('Premium Beyblade Statues \ufffd Beyblade, Beyblade X',
         'Premium Pok\u00e9mon Statues \u2014 Charizard, Mewtwo'),
        ('Browse large-scale Beyblade, Beyblade X, and premium beyblade statues by Takara Tomy and Takara Tom',
         'Browse large-scale Pok\u00e9mon, Pok\u00e9mon Legends, and premium Pok\u00e9mon statues by The Pok\u00e9mon Company'),
        ('"beyblade-x"', '"pokemon-statues"'),
        ('Limited and sold-out exclusive beyblade figures',
         'Limited and sold-out exclusive Pok\u00e9mon figures'),
        ('Limited Edition Beyblade Figures', 'Limited Edition Pok\u00e9mon Figures'),
        ('Shop exclusive, limited-run beyblade figures \ufffd Alter Co., Union Creative, limited releases',
         'Shop exclusive, limited-run Pok\u00e9mon figures \u2014 Pok\u00e9mon Center, GSC, limited releases'),
        ('"rare beyblade"', '"rare pok\u00e9mon"'),
        ('Signed production art, original cels, and rare Beyblade collectibles',
         'Signed production art, original cels, and rare Pok\u00e9mon collectibles'),
        ('Signed Beyblade Art & Rare Collectibles', 'Signed Pok\u00e9mon Art & Rare Collectibles'),
        ('Beyblade cosplay, apparel, and accessories',
         'Pok\u00e9mon cosplay, apparel, and accessories'),
        ('Cosplay & Beyblade Apparel', 'Cosplay & Pok\u00e9mon Apparel'),
        ('Shop beyblade cosplay outfits, graphic tees, hoodies, and official licensed apparel',
         'Shop Pok\u00e9mon cosplay outfits, graphic tees, hoodies, and official licensed apparel'),
        ('"beyblade apparel"', '"pok\u00e9mon apparel"'),
        ('"beyblade tee"', '"pok\u00e9mon tee"'),
        ("Men's Cosplay & Beyblade Apparel", "Men's Cosplay & Pok\u00e9mon Apparel"),
        ('"beyblade jacket"', '"pok\u00e9mon jacket"'),
        ('Cosplay dresses, kimono sets, and beyblade apparel for women',
         'Cosplay dresses, kimono sets, and Pok\u00e9mon apparel for women'),
        ("Women's Cosplay & Beyblade Apparel", "Women's Cosplay & Pok\u00e9mon Apparel"),
        ('Beyblade Collectibles & Display Sets', 'Pok\u00e9mon Collectibles & Display Sets'),
        ('Beyblade Figures by Takara Tomy',
         'Pok\u00e9mon Figures by The Pok\u00e9mon Company'),
        ('Shop Pok\u00e9mon TCG Perfect Grade, Master Grade model kits, ship models, and Beyblade Figures',
         'Shop Pok\u00e9mon TCG binders, accessories, display models, and Pok\u00e9mon figures'),
        # Generic remaining
        ('Beyblade', 'Pok\u00e9mon'),
        ('beyblade', 'pokemon'),
        # frieren leftover
        ('"frieren"', '"pokemon-legends-arceus"'),
        ('frieren', 'pokemon-legends-arceus'),
    ],

    'bids-seed-data.ts': [
        # Mixed partial replacements - fix full product names
        ('Neon Genesis Pok\u00e9mon Art 1995 First-Run Signed Poster \u2014 AUCTION',
         'Pok\u00e9mon Base Set 1st Edition Booster Box \u2014 SEALED \u2014 AUCTION'),
        ('Jujutsu Kaisen Ryomen Mewtwo King of Curses 1/6 Scale \u2014 AUCTION',
         'Mewtwo Base Set Holo Rare \u2014 PSA 9 \u2014 AUCTION'),
        ('Fate/Stay Night Pok\u00e9mon Base Set Booster Box Wedding Dress 1/7 Scale \u2014 AUCTION',
         'Pok\u00e9mon Base Set Booster Box \u2014 SEALED \u2014 AUCTION'),
        ('Re:Zero Pikachu Illustrator Card Dress 1/7 Scale \u2014 Good Smile Company \u2014 AUCTION',
         'Pikachu Illustrator Card \u2014 PSA 8 \u2014 AUCTION'),
        ('Pok\u00e9mon TCG 25th Anniversary Artbook Signed by Eiichiro Oda \u2014 AUCTION',
         'Pok\u00e9mon World Championships Deck 2023 \u2014 Signed \u2014 AUCTION'),
        ('King of Curses', 'Legendary Collection'),
        ('Neon Genesis', 'Pok\u00e9mon'),
        ('Jujutsu Kaisen', 'Pok\u00e9mon GO'),
        ('Fate/Stay Night', 'Pok\u00e9mon Base Set'),
        ('Re:Zero', 'Pok\u00e9mon Eeveelution'),
        ('Eiichiro Oda', 'Ken Sugimori'),
    ],

    'blog-posts-seed-data.ts': [
        # Template literal content
        ('AT-Field base', 'prismatic foil base'),
        ('Eva collection', 'Pok\u00e9mon collection'),
        ('Re:Zero Pikachu Illustrator 1/7 \u2014 Good Smile Company',
         'Pikachu Illustrator Card \u2014 PSA 8 \u2014 AUCTION'),
        ('Alter \u2014 Frieren 1/7 Scale (Beyond Journey\'s End)',
         'Gardevoir Pok\u00e9mon Center 1/7 Scale'),
        ("Alter's 2025", "Pok\u00e9mon Center's 2025"),
        ('Pok\u00e9mon Base Set Booster Box Wedding Dress (Fate/Stay Night)',
         'Pok\u00e9mon Base Set Booster Box \u2014 Sealed Edition'),
        ('Fate/Stay Night', 'Pok\u00e9mon Base Set'),
        ('Eiichiro Oda', 'Ken Sugimori'),
        ('Re:Zero', 'Pok\u00e9mon Eeveelution'),
        ('Frieren', 'Gardevoir'),
        ('frieren', 'gardevoir'),
    ],

    'stores-seed-data.ts': [
        # Comment lines
        ('preorder-frieren', 'preorder-gardevoir-pokemon-center-1'),
        ('rezero-rem-wedding', 'auction-pikachu-illustrator-psa8-techhub-1'),
        ('one-piece-signed-artbook', 'auction-pokemon-wcs-deck-techhub-1'),
        ('fate-saber-alter', 'auction-pokemon-base-set-booster-box-techhub-1'),
        ('one-piece-artbook', 'auction-pokemon-wcs-deck-techhub-1'),
        ('one-piece', 'pokemon-tcg'),
        ('rezero', 'eeveelution'),
        ('frieren', 'gardevoir'),
    ],
}


def fix_file(fname):
    fpath = os.path.join(SEED_DIR, fname)
    if not os.path.exists(fpath):
        return
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    if fname in fixes:
        for old, new in fixes[fname]:
            content = content.replace(old, new)
    if content != original:
        with open(fpath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)
        print(f'FIXED: {fname}')
    else:
        print(f'  NO CHANGES: {fname}')


if __name__ == '__main__':
    for fname in fixes:
        fix_file(fname)
    print('Done.')
