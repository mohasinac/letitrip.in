"""
Comprehensive Pokemon seed data fix - v2
Handles: IDs, slugs, SEO, tags, titles, descriptions, encoding corruption
across ALL seed files.
"""
import os

SEED_DIR = r'd:\proj\letitrip.in\appkit\src\seed'

# ── Encoding corruption fixes (apply first) ────────────────────────────────
ENCODING_FIXES = [
    ('\u00e2\u20ac\u201d', '\u2014'),   # â€" -> —
    ('\u00e2\u20ac\u2122', '\u2019'),   # â€™ -> '
    ('\u00e2\u20ac\u0153', '\u201c'),   # â€œ -> "
    ('\u00e2\u201a\u00b9', '\u20b9'),   # â‚¹  -> ₹
    ('\u00c3\u00a9', '\u00e9'),          # Ã©  -> é
    ('\u00f0\u0178\u017d\u2030', '\U0001F389'),  # ðŸŽ‰ -> 🎉
    ('\u00f0\u0178\u017d\u0152', '\U0001F38C'),  # ðŸŽŒ -> 🎌
    ('\u00f0\u0178\u017d\u00a6', '\U0001F3A6'),  # ðŸŽ¦ -> 🎦
    ('\u00f0\u0178\u2020', '\U0001F3C6'),         # ðŸ†  -> 🏆
]

# ── Cross-file ID renames (applied to every file) ─────────────────────────
PRODUCT_ID_RENAMES = [
    ('auction-chainsaw-man-makima-figure-fashion-1',   'auction-charizard-1st-ed-psa10-fashion-1'),
    ('auction-jjk-cobalt-drake-figure-homeessentials-1','auction-mewtwo-base-set-psa9-homeessentials-1'),
    ('auction-jjk-mewtwo-figure-homeessentials-1',     'auction-mewtwo-base-set-psa9-homeessentials-1'),
    ('auction-fate-saber-alter-figure-techhub-1',      'auction-pokemon-base-set-booster-box-techhub-1'),
    ('auction-spirited-away-cel-homeessentials-1',     'auction-ken-sugimori-artwork-homeessentials-1'),
    ('auction-gunpla-pg-wing-zero-techhub-1',          'auction-pokemon-25th-anniversary-gold-techhub-1'),
    ('auction-rezero-rem-wedding-figure-techhub-1',    'auction-pikachu-illustrator-psa8-techhub-1'),
    ('auction-one-piece-signed-artbook-techhub-1',     'auction-pokemon-wcs-deck-techhub-1'),
    ('preorder-chainsaw-man-makima-gsc-1',             'preorder-charizard-vmax-secret-rare-gsc-1'),
    ('preorder-frieren-alter-1',                       'preorder-gardevoir-pokemon-center-1'),
    ('preorder-solo-leveling-jinwoo-1',                'preorder-mewtwo-shadow-strike-1'),
    ('preorder-gear5-nika-mega-1',                     'preorder-pikachu-mega-scale-1'),
    ('preorder-daima-mini-dran-sword-1',               'preorder-dragonite-mini-scale-1'),
    ('preorder-closed-phoenix-wing-domain-1',          'preorder-closed-gengar-mega-evolution-1'),
    ('preorder-closed-infinity-castle-1',              'preorder-closed-indigo-league-diorama-1'),
    ('product-draft-beyblade-x-toshiro-1',             'product-draft-glaceon-crystal-snow-1'),
    ('product-draft-fire-force-shinra-1',              'product-draft-flareon-flame-burst-1'),
    ('product-draft-spy-family-bond-plush-1',          'product-draft-eevee-pokemon-center-plush-1'),
    ('product-disc-beyblade-original-sage-1',          'product-disc-jynx-original-run-1'),
    ('product-disc-eren-founding-titan-1',             'product-disc-tyranitar-rampage-statue-1'),
    ('product-sold-cell-perfect-form-1',               'product-sold-dragonite-final-evolution-1'),
    ('product-sold-ace-memorial-1',                    'product-sold-hooh-memorial-statue-1'),
    ('product-phoenix-wing-hollow-purple-oos-1',       'product-mewtwo-psychic-strike-oos-1'),
    ('product-aot-colossal-titan-oos-1',               'product-snorlax-deluxe-scale-oos-1'),
    ('product-cobalt-drake-finger-set-oos-1',          'product-pokemon-tera-crystal-replica-oos-1'),
    ('product-bakugo-explosion-oos-1',                 'product-electabuzz-thunder-punch-oos-1'),
    # Coupon IDs
    ('coupon-ANIMECON15',    'coupon-POKEFEST15'),
    ('coupon-ANIMECRAFT10',  'coupon-TRAINERS-CLOSET10'),
    ('coupon-OTAKUSHELF15',  'coupon-PROF-OAKS15'),
    # Payout IDs
    ('payout-animecraft-jan-2026-completed',  'payout-trainers-closet-jan-2026-completed'),
    ('payout-animecraft-feb-2026-pending',    'payout-trainers-closet-feb-2026-pending'),
    ('payout-otakushelf-jan-2026-failed',     'payout-prof-oaks-jan-2026-failed'),
    ('payout-otakushelf-feb-2026-pending',    'payout-prof-oaks-feb-2026-pending'),
    ('payout-otakushelf-jan2-2026-completed', 'payout-prof-oaks-jan2-2026-completed'),
    # Notification IDs
    ('notif-bid-outbid-john-evangelion-art',              'notif-bid-outbid-john-charizard-sketch'),
    ('notif-promotion-john-animecon-2026',                'notif-promotion-john-pokefest-2026'),
    ('notif-bid-won-jane-evangelion-art',                 'notif-bid-won-jane-charizard-sketch'),
    ('notif-bid-lost-mike-evangelion-art',                'notif-bid-lost-mike-charizard-sketch'),
    ('notif-bid-placed-vikram-evangelion-poster-20260219','notif-bid-placed-vikram-base-set-booster-20260219'),
    ('notif-promotion-ananya-animecon-2026',              'notif-promotion-ananya-pokefest-2026'),
    ('notif-bid-placed-pooja-saber-alter-20260303',       'notif-bid-placed-pooja-base-set-booster-20260303'),
    ('notif-promotion-pooja-animecon-2026',               'notif-promotion-pooja-pokefest-2026'),
    ('notif-bid-placed-sneha-wing-zero-20260304',         'notif-bid-placed-sneha-25th-anniversary-20260304'),
    ('notif-promotion-sneha-animecon-2026',               'notif-promotion-sneha-pokefest-2026'),
    # Event entry IDs
    ('entry-poll-franchise-john-one-piece',    'entry-poll-franchise-john-gen-2'),
    ('entry-poll-franchise-jane-demon-slayer', 'entry-poll-franchise-jane-gen-4'),
    ('entry-poll-franchise-mike-jjk',          'entry-poll-franchise-mike-gen-3'),
]

# ── Product title exact replacements ──────────────────────────────────────
PRODUCT_TITLE_MAP = [
    ('Beyblade Super Saiyan Blue Dran Sword 1/4 Scale Figure',        'Charizard Vmax Full Art Secret Rare \u2014 Sword & Shield'),
    ('Super Saiyan Valkyrie Final Flash 1/4 Scale Statue',            'Blastoise Base Set Holo Rare \u2014 PSA 9'),
    ('Ultra Instinct Dran Sword Premium 1/6 Scale Figure',            'Venusaur Base Set Holo Rare \u2014 PSA 9'),
    ('Monkey D. Xcalibur Gear 5 Sun God 1/4 Scale Scene Figure',      'Pikachu Illustrator Promo Card \u2014 PSA 9'),
    ('Wizard Rod Enma Slash Diorama 1/7 Scale',                       'Pok\u00e9mon Base Set Booster Box \u2014 Sealed'),
    ('Beyblade Phoenix Wing Kamado Graphic T-Shirt',                  'Pok\u00e9mon Trainer Graphic T-Shirt'),
    ('Nezuko Kamado Pink Kimono Hoodie Dress',                        'Misty Water Pok\u00e9mon Trainer Hoodie Dress'),
    ('My Neighbour Totoro Nendoroid Deluxe Set',                      'Bulbasaur Pok\u00e9mon Center Mini Figure Set'),
    ('Gundam RX-78-2 Perfect Grade 1/60 Model Kit',                   'Pok\u00e9mon TCG Premium Binder \u2014 9-Pocket Pro'),
    ('Attack on Titan Scout Regiment Cosplay Jacket',                 'Pok\u00e9mon Trainer Ash Ketchum Cosplay Jacket'),
    ('Beyblade Burst Neo Queen Serenity Cosplay Dress Set',           'Pok\u00e9mon Trainer Erika Cosplay Dress Set'),
    ('Beyblade X Ganyu Qixing Cosplay Dress',                         'Pok\u00e9mon Trainer Sabrina Cosplay Dress'),
    ('Totoro Forest Spirit Embroidered Canvas Tote Bag',              'Pikachu Embroidered Canvas Tote Bag'),
    ('Rem & Ram Re:Zero Nendoroid Duo Set',                           'Pikachu & Eevee Pok\u00e9mon Center Nendoroid Duo Set'),
    ('Attack on Titan 3D Maneuver Gear Wall Replica',                 'Pok\u00e9mon TCG Card Sleeve Bundle (200-pack)'),
    ('Evangelion Unit-01 Berserker Mode Garage Kit 1/35',             'Mewtwo Strikes Back Diorama Resin Kit 1/35'),
    ("Studio Ghibli Collector's Display Shelf Set (8 Figures)",       'Pok\u00e9mon Generation 1 Collector Display Set (8 Figures)'),
    ('Beyblade Sage Mode Toad Sage 1/7 Scale Figure',                 'Jigglypuff Pok\u00e9mon Center Exclusive 1/7 Scale Figure'),
    ('Gundam Wing Zero Custom 1/100 Master Grade Kit',                'Pok\u00e9mon TCG Master Ball Tin Collection'),
    ('Beyblade Going Merry Ship 1/144 Resin Model',                   'S.S. Anne Pok\u00e9mon Resin Diorama 1/144 Scale'),
    ('Beyblade X Phoenix Wing Infinity Domain 1/7 Scale',             'Gengar Pok\u00e9mon Halloween Exclusive 1/7 Scale'),
    ('Beyblade X Hells Chain Bankai Tensa Zangetsu 1/6 Scale',        'Umbreon Eeveelution Pok\u00e9mon Center 1/6 Scale'),
    ('Beyblade Z Scouter Replica & Beyblade X Gift Set',              'Pok\u00e9dex Prop Replica & Pok\u00e9 Ball Gift Set'),
    ('Spirited Away No-Face Resin Miniature Twin Pack',               'Snorlax & Marill Resin Miniature Twin Pack'),
    ('Phoenix Wing Hinokami Kagura 1/7 Scale \ufffd SOLD OUT',        'Charizard Pok\u00e9mon Center Exclusive 1/7 Scale \u2014 SOLD OUT'),
    ('Phoenix Wing Hollow Purple 1/4 Scale \ufffd SOLD OUT',          'Mewtwo Psychic Strike 1/4 Scale \u2014 SOLD OUT'),
    ('AoT Colossal Titan 1/6 Scale \ufffd SOLD OUT',                  'Snorlax Deluxe Scale Figure 1/6 \u2014 SOLD OUT'),
    ('Cobalt Drake Finger Box Set (20 pcs) \ufffd SOLD OUT',          'Pok\u00e9mon Tera Crystal Replica Set (20 pcs) \u2014 SOLD OUT'),
    ('MHA Bakugo Explosion 1/4 Scale \ufffd SOLD OUT',                'Electabuzz Thunder Punch 1/4 Scale \u2014 SOLD OUT'),
    ('Evangelion Unit-01 Original Production Cel \ufffd AUCTION',     'Ken Sugimori Original Pok\u00e9mon Artwork \u2014 Charizard Sketch \u2014 AUCTION'),
    ('Beyblade Z Complete Son Family 7-Piece Set \ufffd AUCTION',     'Pok\u00e9mon 25th Anniversary Gold Card Collection \u2014 Complete Set \u2014 AUCTION'),
    ('Neon Genesis Evangelion 1995 Signed Poster \ufffd AUCTION',     'Pok\u00e9mon Base Set 1st Edition Booster Box \u2014 SEALED \u2014 AUCTION'),
    ('Chainsaw Man Makima 1/7 Kotobukiya ARTFX J \ufffd AUCTION',     'Charizard 1st Edition Base Set Holo \u2014 PSA 10 \u2014 AUCTION'),
    ('Beyblade X Metal Cobalt Drake King of Curses 1/6 Scale \ufffd AUCTION', 'Mewtwo Base Set Holo Rare \u2014 PSA 9 \u2014 AUCTION'),
    ('Fate/Stay Night Saber Alter Wedding 1/7 \ufffd AUCTION',        'Pok\u00e9mon Base Set Booster Box \u2014 SEALED \u2014 AUCTION'),
    ('Spirited Away 2001 Production Cel \ufffd Studio Ghibli',        'Ken Sugimori Original Artwork \u2014 Pikachu Sketch \u2014 AUCTION'),
    ('PG Wing Zero Custom Full Build with LED \ufffd AUCTION',        'Pok\u00e9mon 25th Anniversary Gold Card Collection \u2014 Complete Set \u2014 AUCTION'),
    ('Re:Zero Rem Wedding Dress 1/7 GSC \ufffd AUCTION',              'Pikachu Illustrator Card \u2014 PSA 8 \u2014 AUCTION'),
    ('Beyblade Z Battle of Gods Blu-ray Signed Box \ufffd AUCTION',   'Pok\u00e9mon World Championship Trophy Card 2006 \u2014 AUCTION'),
    ('Beyblade Shark Edge Flame Art Print (Signed by VA) \ufffd AUCTION', 'Ken Sugimori Signed Art Print \u2014 Charizard \u2014 Limited \u2014 AUCTION'),
    ('Beyblade 25th Anniversary Premium Card Collection \ufffd AUCTION',  'Pok\u00e9mon 25th Anniversary Premium Card Collection \u2014 AUCTION'),
    ('Beyblade 25th Anniversary Artbook Signed by Oda \ufffd ENDED',  'Pok\u00e9mon World Championships Deck 2023 \u2014 Signed \u2014 ENDED'),
    ('Beyblade Complete Bijuu (9 Tailed Beasts) Set \ufffd ENDED',    'Pok\u00e9mon Eeveelutions Complete Evolution Set \u2014 ENDED'),
    ('Beyblade Z Shenron LED Lamp Sculpture \ufffd ENDED',            'Charizard Dragon Flame LED Sculpture \u2014 ENDED'),
    ('Studio Ghibli Limited Cel \ufffd Princess Mononoke \ufffd ENDED','Pok\u00e9mon Ken Sugimori Limited Cel \u2014 Mew \u2014 ENDED'),
    ('Beyblade X Original Signed Manuscript Page \ufffd ENDED',       'Pok\u00e9mon Original Signed Concept Art Page \u2014 ENDED'),
    ('Beyblade X Phoenix Wing Unsigned Limited Print #50/100 \ufffd ENDED', 'Pok\u00e9mon Unsigned Limited Print #50/100 \u2014 ENDED'),
    ('Chainsaw Man Makima 1/7 GSC (Pre-Order)',                       'Charizard VMAX Secret Rare Figure (Pre-Order)'),
    ("Frieren: Beyond Journey's End 1/7 Alter Co. (Pre-Order)",      'Gardevoir Pok\u00e9mon Center Exclusive 1/7 (Pre-Order)'),
    ('Solo Leveling Sung Jinwoo Shadow Monarch 1/7 (Pre-Order)',      'Mewtwo Shadow Strike 1/7 Scale (Pre-Order)'),
    ('Beyblade Gear 5 Nika MEGA 1/4 Scale (Pre-Order)',               'Pikachu MEGA 1/4 Scale (Pre-Order)'),
    ('Beyblade Daima Mini Dran Sword 1/6 (Pre-Order)',                'Dragonite Mini 1/6 Scale (Pre-Order)'),
    ('Beyblade X Phoenix Wing Domain Expansion 1/6 \ufffd CLOSED (Shipped)', 'Gengar Mega Evolution 1/6 \u2014 CLOSED (Shipped)'),
    ('Beyblade Infinity Castle Diorama \ufffd CLOSED (Shipped)',      'Pok\u00e9mon Indigo League Diorama \u2014 CLOSED (Shipped)'),
    ('Beyblade X Toshiro Hitsugaya Bankai 1/7 [DRAFT]',              'Glaceon Crystal Snow 1/7 [DRAFT]'),
    ("Fire Force Dran Buster Devil's Footprints 1/8 [DRAFT]",        'Flareon Flame Burst 1/8 [DRAFT]'),
    ('Spy \ufffd Family Bond Forger Plush (35 cm) [DRAFT]',          'Eevee Pok\u00e9mon Center Plush (35 cm) [DRAFT]'),
    ('Beyblade Original Run Sage 1/8 \ufffd DISCONTINUED',           'Jynx Original Run 1/8 \u2014 DISCONTINUED'),
    ('AoT Eren Founding Titan Statue \ufffd DISCONTINUED',           'Tyranitar Rampage Statue \u2014 DISCONTINUED'),
    ('DBZ Cell Perfect Form 1/4 \ufffd SOLD',                        'Dragonite Final Evolution 1/4 \u2014 SOLD'),
    ('Beyblade Ace Memorial Statue \ufffd SOLD',                     'Ho-Oh Memorial Statue \u2014 SOLD'),
    # Gen products
    ('Beyblade Z Cobalt Dragoon Final Form 1/8 Scale',   'Dragonite 1/8 Scale Premium Figure'),
    ('Beyblade Nami Cat Burglar 1/7 Scale',               'Misty Waterflower 1/7 Scale Premium Figure'),
    ('Beyblade Wizard Rod Hatake Nendoroid #724',         'Ash Ketchum Pok\u00e9mon Center Nendoroid #724'),
    ('Beyblade X Nobara Kugisaki Straw Doll 1/7',         'Pok\u00e9mon Trainer Leaf 1/7 Scale Premium Figure'),
    ('Beyblade Inosuke Beast Breathing 1/8',              'Arcanine Wild Charge 1/8 Scale Figure'),
    ('AoT Mikasa Ackerman 1/7 Scale',                     'Pok\u00e9mon Trainer Misty 1/7 Scale'),
    ('MHA Todoroki Half-Cold Half-Hot 1/8',               'Froslass & Magmar Dual Type 1/8'),
    ('Spy \ufffd Family Yor Thorn Princess 1/7',          'Pok\u00e9mon Trainer Sabrina Psychic 1/7'),
    ("Kiki's Delivery Service Kiki & Jiji Wind-up",       'Ash & Pikachu Wind-up Duo Figure'),
    ('Gundam Barbatos Lupus Rex 1/100 Kit',               'Pok\u00e9mon TCG Premium Binder \u2014 Charizard Edition'),
    ('Beyblade X Byakuya Senbonzakura 1/7',               'Leafeon Petal Dance 1/7 Scale Figure'),
    ('Chainsaw Man Power Blood Fiend 1/7',                'Absol Dark Force 1/7 Scale Figure'),
    ('Beyblade Sanji Diable Jambe 1/8',                   'Charizard Flamethrower 1/8 Scale Figure'),
    ('AoT Levi Ackerman Captain 1/7',                     'Pok\u00e9mon Trainer Brock 1/7 Scale'),
    ('Beyblade X Yuji Itadori Black Flash 1/7',           'Lucario Aura Sphere 1/7 Scale Figure'),
    ('Beyblade Shark Edge Flame Hashira 1/7',             'Entei Sacred Fire Pok\u00e9mon 1/7 Scale'),
    ('Beyblade Wizard Rod Yellow Flash 1/8',              'Jolteon Thunder Wave 1/8 Scale Figure'),
    ('Re:Zero Emilia Crystal Dress 1/7',                  'Gardevoir Crystal Dress 1/7 Scale'),
    ('Beyblade Super Hells Chain Beast 1/6',              'Hydreigon Triple Head 1/6 Scale'),
    ('Beyblade Muichiro Mist Hashira 1/8',                'Suicune Aurora Wave 1/8 Scale'),
    ('Beyblade Nico Robin Demon Child 1/7',               'Lillie Moonlight 1/7 Scale Figure'),
    ('Black Clover Asta Devil Union 1/7',                 'Darkrai Shadow Force 1/7 Scale'),
    ('MHA Shigaraki Tomura Decay 1/8',                    'Gengar Hex 1/8 Scale'),
    ('Beyblade Tamayo & Yushiro Nendoroid Pair',          'Nurse Joy & Officer Jenny Nendoroid Pair'),
    ('Spy \ufffd Family Loid Forger Twilight 1/7',        'Pok\u00e9mon Trainer Gary Oak 1/7 Scale'),
    ('Beyblade Super Phoenix Wing Blue Kamehameha 1/6',   'Dragonite Mega Punch 1/6 Scale'),
    ("Frieren: Beyond Journey's End Fern 1/7",            'Cynthia Pok\u00e9mon Champion 1/7 Scale'),
    ('Mob Psycho 100 Shigeo ???% Form 1/7',               'Alakazam 100% Power 1/7 Scale'),
    ('Chainsaw Man Pochita Premium Plush (40 cm)',         'Eevee Pok\u00e9mon Center Premium Plush (40 cm)'),
    ('Spy \ufffd Family Anya Forger Nendoroid #1902',     'Dawn Pok\u00e9mon Center Nendoroid #1902'),
    ('Beyblade Shippuden Jogger Pants (Beyblade X Red Cloud)', 'Pok\u00e9mon Trainer Jogger Pants (Red & Blue Edition)'),
    ('Beyblade Z Beyblade X Sneakers',                    'Pok\u00e9mon Trainer High-Top Sneakers'),
    ('Beyblade Zenitsu Thunderclap Flash 1/7',            'Raichu Thunderbolt 1/7 Scale'),
    ('MHA Deku Full Cowling 100% 1/7',                    'Pok\u00e9mon Trainer Red Full Power 1/7'),
    ('Beyblade Trafalgar Law Room 1/7',                   'Mewtwo Psystrike 1/7 Scale'),
    ('KonoSuba Megumin Explosion 1/7',                    'Chandelure Flame Body 1/7 Scale'),
    ('Fairy Tail Erza Scarlet Requip 1/7',                'Blaziken Mega Kick 1/7 Scale'),
    ('Dr. Stone Senku Ishigami 1/8',                      'Professor Oak Science Lab 1/8 Scale'),
    ('JoJo Part 3 Jotaro Kujo Star Platinum 1/6',         'Mewtwo Star Force 1/6 Scale'),
]

# ── Tag replacements (products-seed-data.ts tags arrays) ──────────────────
TAG_MAP = [
    ('"one-piece"',       '"pokemon-tcg"'),
    ('"xcalibur"',        '"sword-and-shield"'),
    ('"gear-5"',          '"gen-1"'),
    ('"sun-god-nika"',    '"pikachu"'),
    ('"wizard-rod"',      '"pokemon-card"'),
    ('"ghibli"',          '"pokemon-center"'),
    ('"totoro"',          '"bulbasaur"'),
    ('"nendoroid"',       '"mini-figure"'),
    ('"gundam"',          '"pokemon-tcg"'),
    ('"rx-78-2"',         '"base-set"'),
    ('"perfect-grade"',   '"psa-graded"'),
    ('"rezero"',          '"eeveelution"'),
    ('"rem"',             '"eevee"'),
    ('"ram"',             '"pikachu"'),
    ('"evangelion"',      '"pokemon-vintage"'),
    ('"unit-01"',         '"charizard"'),
    ('"garage-kit"',      '"diorama-kit"'),
    ('"spirited-away"',   '"pokemon-artwork"'),
    ('"production-cel"',  '"original-artwork"'),
    ('"gunpla"',          '"booster-box"'),
    ('"wing-zero"',       '"25th-anniversary"'),
    ('"hand-built"',      '"collector-grade"'),
    ('"fate"',            '"pokemon-base-set"'),
    ('"saber-alter"',     '"booster-box-sealed"'),
    ('"wedding"',         '"psa-graded"'),
    ('"chainsaw-man"',    '"pokemon-scarlet-violet"'),
    ('"makima"',          '"charizard-1st-ed"'),
    ('"going-merry"',     '"ss-anne"'),
    ('"ship-model"',      '"diorama-model"'),
    ('"hideaki-anno"',    '"ken-sugimori"'),
    ('"oda"',             '"sugimori"'),
    ('"mononoke"',        '"mew"'),
    ('"no-face"',         '"snorlax"'),
    ('"production-art"',  '"original-artwork"'),
    ('"collector-set"',   '"complete-set"'),
    ('"ace"',             '"ho-oh"'),
    ('"kiki"',            '"pikachu"'),
    ('"barbatos"',        '"charizard-binder"'),
    ('"power"',           '"absol"'),
    ('"sanji"',           '"charizard-flamethrower"'),
    ('"law"',             '"mewtwo"'),
    ('"emilia"',          '"gardevoir"'),
    ('"robin"',           '"lillie"'),
    ('"pochita"',         '"eevee-plush"'),
]

# ── Per-file additional replacements ──────────────────────────────────────
FILE_REPLACEMENTS = {

    'products-seed-data.ts': [
        # Header
        ('101 Beyblade products', '101 Pok\u00e9mon products'),
        # Subcategories (various quote styles)
        ('subcategory: "Nendoroids"',          'subcategory: "Pok\u00e9mon Mini Figures"'),
        ('subcategory: "Perfect Grade Gunpla"','subcategory: "TCG Premium Accessories"'),
        ('subcategory: "Master Grade Gunpla"', 'subcategory: "TCG Master Accessories"'),
        ('subcategory: "Built Models"',         'subcategory: "Display Models"'),
        ('subcategory: "Production Art"',       'subcategory: "Original Artwork"'),
        ('subcategory: "Signed Art"',           'subcategory: "Signed Artwork"'),
        ('subcategory: "Limited Figures"',      'subcategory: "Limited Edition Figures"'),
        ('subcategory: "Beyblade Z Figures"',  'subcategory: "Pok\u00e9mon Figures"'),
        ('subcategory: "Beyblade X Figures"',  'subcategory: "Pok\u00e9mon Premium Figures"'),
        ('subcategory: "Beyblade Figures"',    'subcategory: "Pok\u00e9mon Figures"'),
        ('subcategory: "Beyblade Tees"',       'subcategory: "Pok\u00e9mon Tees"'),
        ('subcategory: "Beyblade Bags"',       'subcategory: "Pok\u00e9mon Bags"'),
        ('subcategory: "Beyblade Plush"',      'subcategory: "Pok\u00e9mon Plush"'),
        ('subcategory: "Beyblade Pants"',      'subcategory: "Pok\u00e9mon Apparel"'),
        ('subcategory: "Beyblade Shoes"',      'subcategory: "Pok\u00e9mon Footwear"'),
        ('subcategory: "Beyblade Decor"',      'subcategory: "Pok\u00e9mon Decor"'),
        ('sub: "Nendoroids"',                   'sub: "Pok\u00e9mon Mini Figures"'),
        ('sub: "Beyblade Z Figures"',          'sub: "Pok\u00e9mon Figures"'),
        ('sub: "Beyblade X Figures"',          'sub: "Pok\u00e9mon Premium Figures"'),
        ('sub: "Ghibli Minis"',                'sub: "Pok\u00e9mon Minis"'),
        ('sub: "MG Gunpla"',                   'sub: "TCG Master Accessories"'),
        # Brands
        ('brand: "Kotobukiya"',       'brand: "Pok\u00e9mon Center"'),
        ('brand: "Takara Tomy"',      'brand: "The Pok\u00e9mon Company"'),
        ('brand: "Alter Co."',        'brand: "Pok\u00e9mon Center Exclusive"'),
        ('brand: "Studio Ghibli"',    'brand: "Ken Sugimori Art"'),
        ('brand: "Good Smile Company"','brand: "Pok\u00e9mon Center"'),
        ('brand: "Bandai"',           'brand: "Pok\u00e9mon Company"'),
        ('brand: "Shueisha"',         'brand: "Pok\u00e9mon TCG"'),
        # Remaining anime in descriptions
        ('Chainsaw Man Makima', 'Charizard 1st Ed PSA 10'),
        ('Chainsaw Man', 'Pok\u00e9mon Scarlet & Violet'),
        ('Fate/Stay Night', 'Pok\u00e9mon Base Set'),
        ('Saber Alter', 'Base Set Booster Box'),
        ('Good Smile Rem Wedding', 'Pok\u00e9mon Center Pikachu Illustrator'),
        ('Re:Zero Rem Wedding', 'Pikachu Illustrator Card PSA 8'),
        ('Re:Zero Emilia', 'Gardevoir Crystal Dress'),
        ('Re:Zero', 'Pok\u00e9mon Eeveelution'),
        ('Rem Wedding', 'Pikachu Illustrator'),
        ('Spirited Away', 'Pok\u00e9mon Center Artwork'),
        ('Studio Ghibli', 'Ken Sugimori Art'),
        ('Ghibli Museum', 'Pok\u00e9mon Center'),
        ('Ghibli', 'Pok\u00e9mon'),
        ('Totoro', 'Bulbasaur'),
        ('totoro', 'bulbasaur'),
        ('Neon Genesis Evangelion', 'Pok\u00e9mon Base Set 1st Edition'),
        ('Evangelion Unit-01', 'Mewtwo Strikes Back Diorama'),
        ('Evangelion', 'Pok\u00e9mon Vintage'),
        ('Cobalt Drake', 'Pok\u00e9mon Tera Crystal'),
        ('Cobalt Dragoon', 'Dragonite'),
        ('King of Curses', 'Legendary Collection'),
        ('cursed energy aura, tattooed skin, multiple arms',
         'prismatic aura foil, rare graded, in protective case'),
        ('Beyblade Burst', 'Pok\u00e9mon TCG'),
        ('BeybladeCraft', 'Pok\u00e9mon TCG'),
        ('Beyblade X', 'Pok\u00e9mon'),
        ('Beyblade Z', 'Pok\u00e9mon'),
        ('Beyblade', 'Pok\u00e9mon'),
        ('Gunpla', 'Pok\u00e9mon TCG Accessories'),
        ('Gundam', 'Pok\u00e9mon TCG'),
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
        ('One Piece', 'Pok\u00e9mon TCG'),
        ('Dragon Ball', 'Pok\u00e9mon'),
        ('AoT', 'Pok\u00e9mon'),
        ('MHA', 'Pok\u00e9mon'),
        ('Attack on Titan', 'Pok\u00e9mon Battle Scene'),
        ('Naruto', 'Pok\u00e9mon GO'),
        ('Sukuna', 'Mewtwo'),
        ('sukuna', 'mewtwo'),
        ('JJK', 'Pok\u00e9mon GO'),
        ('Eiichiro Oda', 'Ken Sugimori'),
        ('Den Den Mushi ink sketch', 'Pok\u00e9mon Center sketch'),
        ('Color Walk collection', 'Pok\u00e9mon Art Collection'),
        ('Hideaki Anno', 'Ken Sugimori'),
        ('Black Clover', 'Pok\u00e9mon Legends'),
        ('Mob Psycho', 'Pok\u00e9mon Psychic'),
        ('KonoSuba', 'Pok\u00e9mon Colo'),
        ('Fairy Tail', 'Pok\u00e9mon Scarlet'),
        ('Dr. Stone', 'Pok\u00e9mon Diamond'),
        ('JoJo', 'Pok\u00e9mon Battle'),
        ("Frieren: Beyond Journey's End", 'Pok\u00e9mon Legends Arceus'),
        ('Solo Leveling', 'Pok\u00e9mon Masters'),
        ('Fire Force', 'Pok\u00e9mon Fire'),
        ('Dran Sword', 'Pok\u00e9mon Card'),
        ('Dran Buster', 'Flareon'),
        ('Phoenix Wing', 'Pok\u00e9mon Phoenix'),
        ('Star Platinum', 'Star Force'),
        ('Jotaro Kujo', 'Mewtwo Star Force'),
        ('Levi Ackerman', 'Trainer Brock'),
        ('Yor Thorn Princess', 'Trainer Sabrina Psychic'),
        ('Anya Forger', 'Dawn Trainer'),
        ('Loid Forger', 'Gary Oak'),
        ('Inosuke', 'Arcanine'),
        ('Muichiro', 'Suicune'),
        ('Zenitsu', 'Raichu'),
        ('Toshiro Hitsugaya', 'Glaceon'),
        ('Hitsugaya', 'Glaceon'),
        ('Byakuya Senbonzakura', 'Leafeon Petal Dance'),
        ('Yuji Itadori', 'Lucario'),
        ('Nobara Kugisaki', 'Trainer Leaf'),
        ('Tamayo', 'Nurse Joy'),
        ('Yushiro', 'Officer Jenny'),
        ('Shigaraki', 'Gengar'),
        ('Todoroki', 'Froslass & Magmar'),
        ('Mikasa', 'Trainer Misty'),
        ('Sanji', 'Charizard Flamethrower'),
        ('Trafalgar Law', 'Mewtwo Psystrike'),
        ('Megumin', 'Chandelure'),
        ('Erza Scarlet', 'Blaziken'),
        ('Senku Ishigami', 'Professor Oak'),
        ('Pochita', 'Eevee'),
        ('Nami Cat Burglar', 'Misty Waterflower'),
        # Spy (careful - only in product context)
        ('Spy \ufffd Family', 'Pok\u00e9mon'),
        # picsum seed URLs - update to pokemon-themed names
        ('picsum.photos/seed/rx78-gundam', 'picsum.photos/seed/pokemon-binder'),
        ('picsum.photos/seed/ghibli-display', 'picsum.photos/seed/pokemon-gen1-display'),
    ],

    'notifications-seed-data.ts': [
        ('Dragon Ball Super Saiyan Blue Goku 1/4 Scale Figure',
         'Charizard Base Set Holo Rare \u2014 PSA 9'),
        ('Dragon Ball Super Saiyan Blue Goku 1/4 Scale Figure: "Thank you',
         'Charizard Base Set Holo Rare \u2014 PSA 9: "Thank you'),
        ('Bleach Ichigo Bankai Tensa Zangetsu 1/6 Scale Figure',
         "Pok\u00e9mon Misty's Tears Promo Card \u2014 PSA 9"),
        ('Gundam Wing Perfect Grade Wing Zero Custom \u2014 Full Build',
         'Pok\u00e9mon 25th Anniversary Gold Card Collection \u2014 Complete Set'),
    ],

    'bids-seed-data.ts': [
        ('Gunpla kit', 'Pok\u00e9mon booster box'),
        ('Anime Collector', 'Pok\u00e9mon Collector'),
        ('Anime', 'Pok\u00e9mon TCG'),
        ('Otaku', 'Pok\u00e9mon Trainer'),
        ('Evangelion', 'Pok\u00e9mon Art'),
        ('Dragon Ball', 'Pok\u00e9mon'),
        ('One Piece', 'Pok\u00e9mon TCG'),
        ('Chainsaw Man', 'Pok\u00e9mon Scarlet & Violet'),
        ('Sukuna', 'Mewtwo'),
        ('sukuna', 'mewtwo'),
        ('Saber Alter', 'Base Set Booster Box'),
        ('Spirited Away', 'Pok\u00e9mon Artwork'),
        ('Rem Wedding', 'Pikachu Illustrator'),
        ('Ghibli', 'Pok\u00e9mon'),
        ('Gunpla', 'Pok\u00e9mon booster'),
        ('Gundam', 'Pok\u00e9mon TCG'),
    ],

    'blog-posts-seed-data.ts': [
        ('Evangelion Unit-01 Ver. Ka \u2014 MegaHouse Master Grade',
         'Charizard Base Set 1st Edition \u2014 PSA 10'),
        ('Evangelion Unit-01 Ver. Ka', 'Charizard Base Set 1st Ed PSA 10'),
        ('Evangelion', 'Pok\u00e9mon Vintage'),
        ('MegaHouse Master Grade', 'PSA Graded Gem Mint'),
        ('Sukuna Ryomen Cursed Technique', 'Mewtwo Psychic Power'),
        ('Sukuna', 'Mewtwo'),
        ('AniCon 2025', 'Pok\u00e9Fest 2025'),
        ('AniCon', 'Pok\u00e9Fest'),
        ('anime', 'pok\u00e9mon'),
        ('Anime', 'Pok\u00e9mon'),
        ('otaku', 'pok\u00e9mon collector'),
        ('Otaku', 'Pok\u00e9mon Collector'),
        ('Gunpla', 'Pok\u00e9mon TCG Cards'),
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
        ('Ghibli', 'Pok\u00e9mon'),
        ('Dragon Ball', 'Pok\u00e9mon'),
        ('One Piece', 'Pok\u00e9mon TCG'),
        ('Chainsaw Man', 'Pok\u00e9mon Scarlet & Violet'),
        ('Saber Alter', 'Pok\u00e9mon Base Set Booster Box'),
        ('Spirited Away', 'Pok\u00e9mon Center Exclusive'),
        ('Rem Wedding', 'Pikachu Illustrator Card'),
    ],

    'categories-seed-data.ts': [
        ('Nendoroids & Chibis', 'Pok\u00e9mon Mini Figures'),
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
        ('nendoroid', 'pokemon-mini-figure'),
        ('Gunpla & Model Kits', 'Pok\u00e9mon TCG Binders & Accessories'),
        ('Gunpla', 'Pok\u00e9mon TCG Accessories'),
        ('Gundam', 'Pok\u00e9mon TCG'),
        ('gunpla', 'pokemon-tcg-accessories'),
        ('gundam', 'pokemon-tcg'),
        ('Chainsaw Man', 'Pok\u00e9mon Scarlet & Violet'),
        ('chainsaw', 'pokemon-tcg'),
        ('ghibli', 'pokemon-center'),
    ],

    'coupons-seed-data.ts': [
        ('ANIMECON15', 'POKEFEST15'),
        ('ANIMECRAFT10', 'TRAINERS-CLOSET10'),
        ('OTAKUSHELF15', 'PROF-OAKS15'),
        ('anime', 'pok\u00e9mon'),
        ('Anime', 'Pok\u00e9mon'),
        ('otaku', 'pok\u00e9mon collector'),
        ('Otaku', 'Pok\u00e9mon Collector'),
        ('AnimeCraft', "Trainer's Closet"),
        ('OtakuShelf', "Professor Oak's Collectibles"),
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
        ('Gunpla', 'Pok\u00e9mon TCG'),
        ('chainsaw', 'pokemon-tcg'),
        ('Chainsaw', 'Pok\u00e9mon TCG'),
        ('AniCon', 'Pok\u00e9Fest'),
    ],

    'payouts-seed-data.ts': [
        ('AnimeCraft', "Trainer's Closet"),
        ('animecraft', 'trainers-closet'),
        ('OtakuShelf', "Professor Oak's Collectibles"),
        ('otakushelf', 'prof-oaks'),
        ('anime', 'pok\u00e9mon'),
        ('Anime', 'Pok\u00e9mon'),
        ('otaku', 'pok\u00e9mon collector'),
        ('Otaku', 'Pok\u00e9mon Collector'),
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
        ('Bleach', 'Pok\u00e9mon Violet'),
        ('Ghibli', 'Pok\u00e9mon'),
    ],

    'events-seed-data.ts': [
        ('AniCon 2026', 'Pok\u00e9Fest 2026'),
        ('ANIMECON15', 'POKEFEST15'),
        ('AniCon', 'Pok\u00e9Fest'),
        ('opt-dragon-ball', 'opt-gen-1'),
        ('opt-one-piece', 'opt-gen-2'),
        ('opt-jjk', 'opt-gen-3'),
        ('opt-demon-slayer', 'opt-gen-4'),
        ('opt-bleach', 'opt-gen-5'),
        ('event-anicon-2026-coupon-drop-offer', 'event-pokefest-2026-coupon-drop-offer'),
        ('event-anime-winter-sale-2025', 'event-pokemon-winter-sale-2025'),
        ('Anime Winter Sale', 'Pok\u00e9mon Winter Sale'),
        ('Dragon Ball', 'Pok\u00e9mon'),
        ('One Piece', 'Pok\u00e9mon TCG'),
        ('Demon Slayer', 'Pok\u00e9mon Scarlet'),
        ('Bleach', 'Pok\u00e9mon Violet'),
        ('JJK', 'Pok\u00e9mon GO'),
        ('Sukuna', 'Mewtwo'),
        ('Gunpla', 'Pok\u00e9mon booster'),
        ('Gundam', 'Pok\u00e9mon TCG'),
        ('otaku', 'pok\u00e9mon collector'),
        ('Otaku', 'Pok\u00e9mon Trainer'),
        ('anime', 'pok\u00e9mon tcg'),
        ('Anime', 'Pok\u00e9mon TCG'),
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
    ],

    'site-settings-seed-data.ts': [
        ('anime figures', 'pok\u00e9mon cards'),
        ('Anime Figures', 'Pok\u00e9mon Cards'),
        ('nendoroid', 'pok\u00e9mon card'),
        ('Nendoroid', 'Pok\u00e9mon Card'),
        ('gunpla', 'pok\u00e9mon tcg'),
        ('Gunpla', 'Pok\u00e9mon TCG'),
        ('otaku', 'pok\u00e9mon collector'),
        ('Otaku', 'Pok\u00e9mon Collector'),
        ('anime', 'pok\u00e9mon'),
        ('Anime', 'Pok\u00e9mon'),
    ],

    'homepage-sections-seed-data.ts': [
        ('AniCon 2026', 'Pok\u00e9Fest 2026'),
        ('ANIMECON15', 'POKEFEST15'),
        ('AniCon', 'Pok\u00e9Fest'),
        ('Your Otaku Marketplace', 'Your Pok\u00e9mon Marketplace'),
        ('Otaku', 'Pok\u00e9mon Trainer'),
        ('otaku', 'pok\u00e9mon trainer'),
        ('Anime', 'Pok\u00e9mon TCG'),
        ('anime', 'pok\u00e9mon tcg'),
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
        ('1/7 scale figures', 'PSA-graded cards'),
        ('Scale Figures', 'Graded Cards'),
        ('scale figures', 'graded cards'),
    ],

    'store-addresses-seed-data.ts': [
        ('Anime Plaza', 'Pok\u00e9mon Centre Mall'),
        ("AnimeCraft Apparel", "Trainer's Closet"),
        ("OtakuShelf Co", "Professor Oak's Collectibles"),
        ('Otaku Market', 'Pok\u00e9mon Centre Mall'),
        ('otaku', 'pokemon'),
        ('anime', 'pokemon'),
        ('Anime', 'Pok\u00e9mon'),
    ],

    'carousel-slides-seed-data.ts': [
        ('Anime Figures & Collectibles', 'Pok\u00e9mon TCG & Collectibles'),
        ('Anime Figures', 'Pok\u00e9mon Cards'),
        ('Anime', 'Pok\u00e9mon TCG'),
        ('anime', 'pok\u00e9mon tcg'),
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
        ('Gunpla', 'Pok\u00e9mon TCG Accessories'),
        ('Evangelion', 'Pok\u00e9mon Base Set'),
        ('1/7 scale', 'PSA-graded'),
    ],

    'users-seed-data.ts': [
        ('anime', 'pok\u00e9mon'),
        ('Anime', 'Pok\u00e9mon'),
        ('otaku', 'pok\u00e9mon collector'),
        ('Otaku', 'Pok\u00e9mon Collector'),
    ],

    'stores-seed-data.ts': [
        ('anime', 'pok\u00e9mon'),
        ('Anime', 'Pok\u00e9mon'),
        ('otaku', 'pok\u00e9mon collector'),
        ('Otaku', 'Pok\u00e9mon Collector'),
        ('gunpla', 'pokemon-tcg'),
        ('Gunpla', 'Pok\u00e9mon TCG'),
        ('chainsaw', 'pokemon-tcg'),
        ('Chainsaw', 'Pok\u00e9mon TCG'),
        ('sukuna', 'mewtwo'),
        ('Sukuna', 'Mewtwo'),
        ('One Piece', 'Pok\u00e9mon TCG'),
        ('Dragon Ball', 'Pok\u00e9mon'),
        ('Spirited Away', 'Pok\u00e9mon Center'),
        ('Rem Wedding', 'Pikachu Illustrator'),
        ('Ghibli', 'Pok\u00e9mon'),
        ('Evangelion', 'Pok\u00e9mon Vintage'),
    ],

    'cart-seed-data.ts': [
        ('Naruto', 'Pok\u00e9mon GO'),
        ('Spirited Away', 'Pok\u00e9mon Center Exclusive'),
        ('Otaku', 'Pok\u00e9mon Collector'),
        ('otaku', 'pok\u00e9mon collector'),
        ('Bijuu', 'Eeveelutions'),
        ('9 Tailed Beasts', '9 Eeveelutions'),
        ('ENDED', 'ENDED'),
    ],

    'orders-seed-data.ts': [
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
        ('nendoroid', 'pokemon mini figure'),
        ('Totoro', 'Bulbasaur'),
        ('Rem', 'Pikachu'),
        ('Ram', 'Eevee'),
        ('Evangelion', 'Pok\u00e9mon Vintage'),
        ('Dragon Ball', 'Pok\u00e9mon'),
        ('One Piece', 'Pok\u00e9mon TCG'),
        ('Ghibli', 'Pok\u00e9mon'),
        ('Gunpla', 'Pok\u00e9mon TCG Accessories'),
        ('Gundam', 'Pok\u00e9mon TCG'),
    ],

    'reviews-seed-data.ts': [
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
        ('nendoroid', 'pokemon mini figure'),
        ('Totoro', 'Bulbasaur'),
        ('Rem ', 'Pikachu '),
        ('Ram', 'Eevee'),
        ('Evangelion', 'Pok\u00e9mon Vintage'),
        ('Dragon Ball', 'Pok\u00e9mon'),
        ('One Piece', 'Pok\u00e9mon TCG'),
        ('Ghibli', 'Pok\u00e9mon'),
        ('Gunpla', 'Pok\u00e9mon TCG Accessories'),
        ('Gundam', 'Pok\u00e9mon TCG'),
        ('anime', 'pok\u00e9mon'),
        ('Anime', 'Pok\u00e9mon'),
    ],
}


def fix_file(fname):
    fpath = os.path.join(SEED_DIR, fname)
    if not os.path.exists(fpath):
        print(f'SKIP (not found): {fname}')
        return

    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Fix encoding corruption
    for corrupted, fix in ENCODING_FIXES:
        content = content.replace(corrupted, fix)

    # 2. Cross-file ID renames (all files)
    for old_id, new_id in PRODUCT_ID_RENAMES:
        content = content.replace(old_id, new_id)

    # 3. Global name replacements
    content = content.replace('AniCon 2026', 'Pok\u00e9Fest 2026')
    content = content.replace('ANIMECON15', 'POKEFEST15')
    content = content.replace('AniCon', 'Pok\u00e9Fest')
    content = content.replace('FigureVault JP', 'Pok\u00e9Vault Cards')
    content = content.replace('AnimeCraft Apparel', "Trainer's Closet")
    content = content.replace('OtakuShelf Co', "Professor Oak's Collectibles")

    # 4. Products-specific: title map then tag map
    if fname == 'products-seed-data.ts':
        for old_title, new_title in PRODUCT_TITLE_MAP:
            content = content.replace(old_title, new_title)
        for old_tag, new_tag in TAG_MAP:
            content = content.replace(old_tag, new_tag)

    # 5. Per-file content replacements
    if fname in FILE_REPLACEMENTS:
        for old, new in FILE_REPLACEMENTS[fname]:
            content = content.replace(old, new)

    if content != original:
        with open(fpath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)
        print(f'FIXED: {fname}')
    else:
        print(f'  NO CHANGES: {fname}')


ALL_FILES = [
    'products-seed-data.ts',
    'notifications-seed-data.ts',
    'bids-seed-data.ts',
    'blog-posts-seed-data.ts',
    'categories-seed-data.ts',
    'coupons-seed-data.ts',
    'events-seed-data.ts',
    'homepage-sections-seed-data.ts',
    'payouts-seed-data.ts',
    'site-settings-seed-data.ts',
    'store-addresses-seed-data.ts',
    'carousel-slides-seed-data.ts',
    'users-seed-data.ts',
    'stores-seed-data.ts',
    'cart-seed-data.ts',
    'orders-seed-data.ts',
    'reviews-seed-data.ts',
]

if __name__ == '__main__':
    print('Fixing all seed files (IDs, slugs, SEO, content, tags)...')
    for fname in ALL_FILES:
        fix_file(fname)
    print('Done.')
"""
Fix all seed data files: repair encoding corruption + replace remaining anime refs with Pokemon theme.

Encoding corruption happened because PowerShell Get-Content (without -Encoding UTF8) read UTF-8 files
as Windows-1252, then Set-Content -Encoding UTF8 double-encoded the bytes.

Reverse mapping for corrupted characters:
  â‚¹  (U+00E2 U+201A U+00B9) -> ₹  (U+20B9 rupee sign)
  â€"  (U+00E2 U+20AC U+201D) -> —  (U+2014 em dash)
  â€™  (U+00E2 U+20AC U+2122) -> '  (U+2019 right single quote)
  â€œ  (U+00E2 U+20AC U+0153) -> "  (U+201C left double quote)
  Ã©  (U+00C3 U+00A9)         -> é  (U+00E9)
  ðŸŽ‰ (U+00F0 U+0178 U+017D U+2030) -> 🎉 (U+1F389)
  ðŸŽŒ (U+00F0 U+0178 U+017D U+0152) -> 🎌 (U+1F38C)
  ðŸŽ¦ (U+00F0 U+0178 U+017D U+00A6) -> 🎦 (U+1F3A6)
  ðŸ†  (U+00F0 U+0178 U+2020)        -> 🏆 (U+1F3C6)  -- control char dropped
"""

import os
import re

SEED_DIR = r'd:\proj\letitrip.in\appkit\src\seed'

# ── Encoding corruption fixes ──────────────────────────────────────────────
ENCODING_FIXES = [
    # Order matters: longer sequences first to avoid partial matches
    ('\u00e2\u20ac\u201d', '\u2014'),   # â€" -> em dash —
    ('\u00e2\u20ac\u2122', '\u2019'),   # â€™ -> right single quote '
    ('\u00e2\u20ac\u0153', '\u201c'),   # â€œ -> left double quote "
    ('\u00e2\u201a\u00b9', '\u20b9'),   # â‚¹  -> ₹ rupee
    ('\u00c3\u00a9', '\u00e9'),          # Ã©  -> é
    ('\u00c3\u00a0', '\u00e0'),          # Ã   -> à
    ('\u00f0\u0178\u017d\u2030', '\U0001F389'),  # ðŸŽ‰ -> 🎉
    ('\u00f0\u0178\u017d\u0152', '\U0001F38C'),  # ðŸŽŒ -> 🎌
    ('\u00f0\u0178\u017d\u00a6', '\U0001F3A6'),  # ðŸŽ¦ -> 🎦
    # 🏆 U+1F3C6 = F0 9F 8F 86 -> 0x8F is undefined in cp1252, control char dropped
    # so we match the visible 3-char sequence ðŸ† (U+00F0 U+0178 U+2020)
    ('\u00f0\u0178\u2020', '\U0001F3C6'),         # ðŸ†  -> 🏆
    # More emoji
    ('\u00f0\u0178\u017d\u0089', '\U0001F389'),  # alternate 🎉
    ('\u00f0\u0178\u2018', '\U0001F481'),         # ðŸ'  -> 💁
    ('\u00f0\u0178\u201e', '\U0001F4A1'),         # ðŸ'¡ -> 💡
    ('\u00f0\u0178\u0161\u00bb', '\U0001F57B'),   # 🖻
    ('\u00f0\u0178\u2013', '\U0001F4B0'),         # ðŸ'° -> 💰
    ('\u00f0\u0178\u2014', '\U0001F4B3'),         # 💳
]

# ── Global anime -> Pokemon replacements (apply to all files) ──────────────
GLOBAL_REPLACEMENTS = [
    # Coupon / Event names
    ('AniCon 2026 Drop \u2014 Extra 15% Off \U0001F38C',
     'Pok\u00e9Fest 2026 Drop \u2014 Extra 15% Off \U0001F389'),
    ('AniCon 2026 Drop — Extra 15% Off 🎌',
     'PokéFest 2026 Drop — Extra 15% Off 🎉'),
    ('ANIMECON15', 'POKEFEST15'),
    ('AniCon 2026', 'PokéFest 2026'),
    ('AniCon', 'PokéFest'),
    # Store name corrections
    ('FigureVault JP', 'PokéVault Cards'),
    ('AnimeCraft Apparel', "Trainer's Closet"),
    ('OtakuShelf Co', "Professor Oak's Collectibles"),
]

# ── Per-file replacements ──────────────────────────────────────────────────
FILE_REPLACEMENTS = {

    'notifications-seed-data.ts': [
        # Remaining anime product titles in messages
        ('Dragon Ball Super Saiyan Blue Goku 1/4 Scale Figure',
         'Charizard Base Set Holo Rare \u2014 PSA 9'),
        ('Bleach Ichigo Bankai Tensa Zangetsu 1/6 Scale Figure',
         'Pok\u00e9mon Misty\'s Tears Promo Card \u2014 PSA 9'),
        ('Gundam Wing Perfect Grade Wing Zero Custom \u2014 Full Build',
         'Pok\u00e9mon 25th Anniversary Gold Card Collection \u2014 Complete Set'),
        # ID still references anime (keep IDs as-is but fix text references)
        # Comment headers with anime
        ('-- John Doe', '-- John Doe'),  # no-op to keep order
        # Fix review-replied message that still has Dragon Ball title
        ('Dragon Ball Super Saiyan Blue Goku 1/4 Scale Figure: "Thank you',
         'Charizard Base Set Holo Rare \u2014 PSA 9: "Thank you'),
    ],

    'bids-seed-data.ts': [
        # Bid product titles
        ('Evangelion Unit-01 Production Art', 'Ken Sugimori Original Pok\u00e9mon Artwork \u2014 Charizard Sketch'),
        ('Evangelion Unit 01', 'Ken Sugimori Original Artwork'),
        ('Evangelion', 'Pok\u00e9mon Art'),
        ('Dragon Ball Z Complete Series Blu-ray Set', 'Pok\u00e9mon 25th Anniversary Gold Card Collection \u2014 Complete Set'),
        ('Dragon Ball Z', 'Pok\u00e9mon TCG'),
        ('Dragon Ball', 'Pok\u00e9mon'),
        ('Neon Genesis Evangelion', 'Pok\u00e9mon Base Set'),
        ('One Piece Roronoa Zoro Premium Figure', 'Pikachu \u0026 Friends Art Print \u2014 Signed by Ken Sugimori'),
        ('One Piece Artbook Vol 4', 'Pok\u00e9mon World Championships Deck 2023'),
        ('One Piece', 'Pok\u00e9mon TCG'),
        ('Chainsaw Man Makima 1/7 Scale Figure', 'Charizard 1st Edition Base Set Holo \u2014 PSA 10 \u2014 AUCTION'),
        ('Chainsaw Man', 'Pok\u00e9mon TCG'),
        ('chainsaw', 'pokemon tcg'),
        ('Sukuna Ryomen Cursed Technique Figure', 'Mewtwo Base Set Holo Rare \u2014 PSA 9'),
        ('Sukuna Ryomen', 'Mewtwo Holo Rare'),
        ('Sukuna', 'Mewtwo'),
        ('sukuna', 'mewtwo'),
        ('Saber Alter 1/7 Kotobukiya', 'Pok\u00e9mon Base Set Booster Box \u2014 SEALED'),
        ('Saber Alter', 'Pok\u00e9mon Base Set Booster Box'),
        ('Spirited Away Production Cel', 'Ken Sugimori Original Artwork \u2014 Pikachu Sketch'),
        ('Spirited Away', 'Pok\u00e9mon Artwork'),
        ('Rem Wedding Ver. 1/7 Scale', 'Pikachu Illustrator Card \u2014 PSA 8'),
        ('Rem Wedding', 'Pikachu Illustrator Card'),
        ('Ghibli Museum Limited Print', 'Pok\u00e9mon Center Limited Edition Print'),
        ('Ghibli', 'Pok\u00e9mon'),
        ('Anime Collector', 'Pok\u00e9mon Collector'),
        ('Anime', 'Pok\u00e9mon TCG'),
        ('Otaku', 'Pok\u00e9mon Trainer'),
        ('Gunpla kit', 'Pok\u00e9mon booster box'),
        ('Gunpla', 'Pok\u00e9mon booster'),
        ('Gundam Wing Perfect Grade Wing Zero Custom', 'Pok\u00e9mon 25th Anniversary Gold Metal Card'),
        ('Gundam', 'Pok\u00e9mon TCG Tin'),
    ],

    'blog-posts-seed-data.ts': [
        # Metadata and titles
        ('AniCon 2025', 'Pok\u00e9Fest 2025'),
        ('AniCon', 'Pok\u00e9Fest'),
        ('ANIMECON15', 'POKEFEST15'),
        # Content HTML - anime franchise names
        ('Evangelion Unit-01 Production Cel', 'Ken Sugimori Original Artwork \u2014 Charizard Sketch'),
        ('Evangelion Unit 01', 'Pok\u00e9mon Base Set 1st Edition'),
        ('Neon Genesis Evangelion', 'Pok\u00e9mon Base Set'),
        ('Rem Wedding Ver.', 'Pikachu Illustrator Card'),
        ('Rem Wedding', 'Pikachu Illustrator'),
        ('Makima 1/7 Scale', 'Charizard 1st Ed PSA 10'),
        ('Makima', 'Charizard PSA 10'),
        ('Saber Alter', 'Pok\u00e9mon Base Set Booster Box'),
        ('Spirited Away', 'Pok\u00e9mon Center Exclusive Print'),
        ('Studio Ghibli', 'Pok\u00e9mon Company'),
        ('Ghibli', 'Pok\u00e9mon'),
        ('Dragon Ball', 'Pok\u00e9mon'),
        ('One Piece', 'Pok\u00e9mon TCG'),
        ('Chainsaw Man', 'Pok\u00e9mon Scarlet \u0026 Violet'),
        # Gunpla -> TCG guide
        ('The Complete Gunpla Beginner\u2019s Guide', 'The Complete Pok\u00e9mon TCG Beginner\u2019s Guide'),
        ('The Complete Gunpla Beginner\'s Guide', 'The Complete Pok\u00e9mon TCG Beginner\'s Guide'),
        ('Complete Gunpla Guide', 'Complete Pok\u00e9mon TCG Guide'),
        ('Gunpla', 'Pok\u00e9mon TCG Cards'),
        ('Gundam', 'Pok\u00e9mon TCG'),
        ('gunpla', 'Pok\u00e9mon tcg'),
        # Nendoroids
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
        ('nendoroid', 'pok\u00e9mon mini figure'),
        # Otaku references
        ('Verified Otaku Seller', 'Verified Pok\u00e9mon Seller'),
        ('otaku collector community', 'Pok\u00e9mon collector community'),
        ('otaku', 'pok\u00e9mon collector'),
        ('Otaku', 'Pok\u00e9mon Collector'),
        ('anime collector', 'Pok\u00e9mon collector'),
        ('anime figure', 'Pok\u00e9mon card'),
        ('anime figures', 'Pok\u00e9mon cards'),
        ('Anime Figure', 'Pok\u00e9mon Card'),
        ('Anime', 'Pok\u00e9mon TCG'),
        ('anime', 'pok\u00e9mon tcg'),
    ],

    'categories-seed-data.ts': [
        ('Nendoroids & Chibis', 'Pok\u00e9mon Mini Figures'),
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
        ('nendoroid', 'pok\u00e9mon mini figure'),
        ('Gunpla & Model Kits', 'Pok\u00e9mon TCG Binders \u0026 Accessories'),
        ('Gunpla', 'Pok\u00e9mon TCG Accessories'),
        ('Gundam', 'Pok\u00e9mon TCG'),
        ('gunpla', 'pok\u00e9mon tcg accessories'),
        ('gundam', 'pok\u00e9mon tcg'),
        ('Chainsaw Man', 'Pok\u00e9mon Scarlet \u0026 Violet'),
        ('chainsaw', 'pok\u00e9mon tcg'),
        ('ghibli', 'pok\u00e9mon center'),
    ],

    'homepage-sections-seed-data.ts': [
        ('AniCon 2026', 'Pok\u00e9Fest 2026'),
        ('ANIMECON15', 'POKEFEST15'),
        ('AniCon', 'Pok\u00e9Fest'),
        ('Your Otaku Marketplace', 'Your Pok\u00e9mon Marketplace'),
        ('Otaku', 'Pok\u00e9mon Trainer'),
        ('otaku', 'pok\u00e9mon trainer'),
        ('Anime', 'Pok\u00e9mon TCG'),
        ('anime', 'pok\u00e9mon tcg'),
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
        ('1/7 scale figures', 'PSA-graded cards'),
        ('Scale Figures', 'Graded Cards'),
        ('scale figures', 'graded cards'),
    ],

    'site-settings-seed-data.ts': [
        ('anime figures', 'pok\u00e9mon cards'),
        ('Anime Figures', 'Pok\u00e9mon Cards'),
        ('nendoroid', 'pok\u00e9mon card'),
        ('Nendoroid', 'Pok\u00e9mon Card'),
        ('gunpla', 'pok\u00e9mon tcg'),
        ('Gunpla', 'Pok\u00e9mon TCG'),
        ('otaku', 'pok\u00e9mon collector'),
        ('Otaku', 'Pok\u00e9mon Collector'),
        ('anime', 'pok\u00e9mon'),
        ('Anime', 'Pok\u00e9mon'),
    ],

    'events-seed-data.ts': [
        ('Anime Winter Sale', 'Pok\u00e9mon Winter Sale'),
        ('AniCon 2026', 'Pok\u00e9Fest 2026'),
        ('ANIMECON15', 'POKEFEST15'),
        ('AniCon', 'Pok\u00e9Fest'),
        # Poll option votes referencing old IDs
        ('opt-dragon-ball', 'opt-gen-1'),
        ('opt-one-piece', 'opt-gen-2'),
        ('opt-jjk', 'opt-gen-3'),
        ('opt-demon-slayer', 'opt-gen-4'),
        ('opt-bleach', 'opt-gen-5'),
        # Old event IDs in entries
        ('event-anicon-2026-coupon-drop-offer', 'event-pokefest-2026-coupon-drop-offer'),
        ('event-anime-winter-sale-2025', 'event-pokemon-winter-sale-2025'),
        # Franchise names in event content
        ('Dragon Ball', 'Pok\u00e9mon'),
        ('One Piece', 'Pok\u00e9mon TCG'),
        ('Demon Slayer', 'Pok\u00e9mon Scarlet'),
        ('Bleach', 'Pok\u00e9mon Violet'),
        ('JJK', 'Pok\u00e9mon GO'),
        ('Sukuna', 'Mewtwo'),
        ('Gunpla kits', 'Pok\u00e9mon booster boxes'),
        ('Gunpla', 'Pok\u00e9mon booster'),
        ('otaku deals', 'pok\u00e9mon deals'),
        ('Otaku', 'Pok\u00e9mon Trainer'),
        ('otaku', 'pok\u00e9mon collector'),
        ('Anime sale', 'Pok\u00e9mon sale'),
        ('anime sale', 'pok\u00e9mon sale'),
        ('Anime', 'Pok\u00e9mon TCG'),
        ('anime', 'pok\u00e9mon tcg'),
        ('Golden Week Otaku', 'Pok\u00e9mon Day'),
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
    ],

    'store-addresses-seed-data.ts': [
        ('Anime Plaza', 'Pok\u00e9mon Centre Mall'),
        ('AnimeCraft Apparel', "Trainer's Closet"),
        ('OtakuShelf Co', "Professor Oak's Collectibles"),
        ('Otaku Market', 'Pok\u00e9mon Centre Mall'),
        ('otaku', 'pok\u00e9mon'),
        ('anime', 'pok\u00e9mon'),
        ('Anime', 'Pok\u00e9mon'),
    ],

    'carousel-slides-seed-data.ts': [
        ('Anime Figures & Collectibles', 'Pok\u00e9mon TCG \u0026 Collectibles'),
        ('Anime Figures', 'Pok\u00e9mon Cards'),
        ('Anime', 'Pok\u00e9mon TCG'),
        ('anime', 'pok\u00e9mon tcg'),
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
        ('Gunpla', 'Pok\u00e9mon TCG Accessories'),
        ('Evangelion', 'Pok\u00e9mon Base Set'),
        ('1/7 scale', 'PSA-graded'),
    ],

    'users-seed-data.ts': [
        ('anime', 'pok\u00e9mon'),
        ('Anime', 'Pok\u00e9mon'),
        ('otaku', 'pok\u00e9mon collector'),
        ('Otaku', 'Pok\u00e9mon Collector'),
    ],

    'stores-seed-data.ts': [
        ('anime', 'pok\u00e9mon'),
        ('Anime', 'Pok\u00e9mon'),
        ('otaku', 'pok\u00e9mon collector'),
        ('Otaku', 'Pok\u00e9mon Collector'),
    ],

    'cart-seed-data.ts': [
        ('Spirited Away', 'Pok\u00e9mon Center Exclusive Print'),
        ('Otaku', 'Pok\u00e9mon Collector'),
        ('otaku', 'pok\u00e9mon collector'),
    ],

    'orders-seed-data.ts': [
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
        ('nendoroid', 'pok\u00e9mon mini figure'),
    ],

    'reviews-seed-data.ts': [
        ('Nendoroid', 'Pok\u00e9mon Mini Figure'),
        ('nendoroid', 'pok\u00e9mon mini figure'),
    ],
}


def fix_file(fname):
    fpath = os.path.join(SEED_DIR, fname)
    if not os.path.exists(fpath):
        print(f'SKIP (not found): {fname}')
        return

    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # 1. Fix encoding corruption first
    for corrupted, original_char in ENCODING_FIXES:
        content = content.replace(corrupted, original_char)

    # 2. Apply global replacements
    for old, new in GLOBAL_REPLACEMENTS:
        content = content.replace(old, new)

    # 3. Apply per-file replacements
    if fname in FILE_REPLACEMENTS:
        for old, new in FILE_REPLACEMENTS[fname]:
            content = content.replace(old, new)

    if content != original:
        with open(fpath, 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)
        print(f'FIXED: {fname}')
    else:
        print(f'  NO CHANGES: {fname}')


ALL_FILES = [
    'notifications-seed-data.ts',
    'bids-seed-data.ts',
    'blog-posts-seed-data.ts',
    'categories-seed-data.ts',
    'homepage-sections-seed-data.ts',
    'site-settings-seed-data.ts',
    'events-seed-data.ts',
    'store-addresses-seed-data.ts',
    'carousel-slides-seed-data.ts',
    'users-seed-data.ts',
    'stores-seed-data.ts',
    'cart-seed-data.ts',
    'orders-seed-data.ts',
    'reviews-seed-data.ts',
]

if __name__ == '__main__':
    print('Fixing seed files...')
    for fname in ALL_FILES:
        fix_file(fname)
    print('Done.')
