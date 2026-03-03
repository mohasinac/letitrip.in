# Fix raw HTML tags in layout primitive files
$base = "D:\proj\letitrip.in\src\components\layout"

# AutoBreadcrumbs.tsx - needs nav/ol/li/Link
$file = "$base\AutoBreadcrumbs.tsx"
$c = Get-Content $file -Raw
$c = $c -replace 'import Link from "next/link";\r?\n', ''
$c = $c -replace 'from "next/navigation"', 'from "@/i18n/navigation"'
$c = $c -replace '<nav(\s|>)', '<Nav$1'
$c = $c -replace '</nav>', '</Nav>'
$c = $c -replace '<ol(\s|>)', '<Ol$1'
$c = $c -replace '</ol>', '</Ol>'
$c = $c -replace '<li(\s|>)', '<Li$1'
$c = $c -replace '</li>', '</Li>'
$c = $c -replace '<Link(\s)', '<TextLink$1'
$c = $c -replace '</Link>', '</TextLink>'
# Add imports after THEME_CONSTANTS import
$c = $c -replace '(import \{ THEME_CONSTANTS \} from "@/constants";)', '$1
import { Nav, Ol, Li } from "../semantic/Semantic";
import { TextLink } from "../typography/TextLink";'
Set-Content $file $c -NoNewline

# Breadcrumbs.tsx - needs nav/ol/li/button/a->TextLink
$file = "$base\Breadcrumbs.tsx"
$c = Get-Content $file -Raw
$c = $c -replace '<nav(\s|>)', '<Nav$1'
$c = $c -replace '</nav>', '</Nav>'
$c = $c -replace '<ol(\s|>)', '<Ol$1'
$c = $c -replace '</ol>', '</Ol>'
$c = $c -replace '<li(\s|>)', '<Li$1'
$c = $c -replace '</li>', '</Li>'
$c = $c -replace '<button(\s|>)', '<Button$1'
$c = $c -replace '</button>', '</Button>'
$c = $c -replace '<a\b', '<TextLink'
$c = $c -replace '</a>', '</TextLink>'
# Add imports after React import
$c = $c -replace '(import React from "react";)', '$1
import { Nav, Ol, Li } from "../semantic/Semantic";
import { Button } from "../ui/Button";
import { TextLink } from "../typography/TextLink";'
Set-Content $file $c -NoNewline

# LocaleSwitcher.tsx - needs button
$file = "$base\LocaleSwitcher.tsx"
$c = Get-Content $file -Raw
$c = $c -replace '<button(\s)', '<Button$1'
$c = $c -replace '</button>', '</Button>'
# Add Button import before first non-comment code
$c = $c -replace '("use client";\r?\n)', '$1import { Button } from "../ui/Button";' + "`r`n"
Set-Content $file $c -NoNewline

# NavItem.tsx - needs Link->TextLink
$file = "$base\NavItem.tsx"
$c = Get-Content $file -Raw
$c = $c -replace 'import Link from "next/link";\r?\n', ''
$c = $c -replace '<Link(\s)', '<TextLink$1'
$c = $c -replace '</Link>', '</TextLink>'
$c = $c -replace '(import \{ THEME_CONSTANTS \} from "@/constants";)', '$1
import { TextLink } from "../typography/TextLink";'
Set-Content $file $c -NoNewline

# Sidebar.tsx - needs aside
$file = "$base\Sidebar.tsx"
$c = Get-Content $file -Raw
$c = $c -replace '<aside(\s)', '<Aside$1'
$c = $c -replace '</aside>', '</Aside>'
$c = $c -replace 'import \{ AvatarDisplay, Heading, Nav, Ul, Li, TextLink, Span, Button, Text \} from "@/components"', 'import { Aside, AvatarDisplay, Button, Heading, Li, Nav, Span, Text, TextLink, Ul } from "@/components"'
Set-Content $file $c -NoNewline

# TitleBar.tsx - needs Link->TextLink + button
$file = "$base\TitleBar.tsx"
$c = Get-Content $file -Raw
$c = $c -replace 'import Link from "next/link";\r?\n', ''
$c = $c -replace '<Link(\s)', '<TextLink$1'
$c = $c -replace '</Link>', '</TextLink>'
$c = $c -replace '<button(\s)', '<Button$1'
$c = $c -replace '</button>', '</Button>'
$c = $c -replace 'import \{ AvatarDisplay, NotificationBell, LocaleSwitcher \} from "@/components"', 'import { AvatarDisplay, Button, LocaleSwitcher, NotificationBell, TextLink } from "@/components"'
Set-Content $file $c -NoNewline

Write-Host "Done. Verifying..."
$all_ok = $true
foreach ($name in @("AutoBreadcrumbs.tsx","Breadcrumbs.tsx","LocaleSwitcher.tsx","NavItem.tsx","Sidebar.tsx","TitleBar.tsx")) {
  $hits = Select-String -CaseSensitive -Path "$base\$name" -Pattern '<nav[\s>]|</nav>|<ol[\s>]|</ol>|<li[\s>]|</li>|<button[\s>]|</button>|<aside[\s>]|</aside>|import Link from|from "next/navigation"' | Measure-Object | Select-Object -ExpandProperty Count
  if ($hits -gt 0) { Write-Host "REMAINING: $name => $hits"; $all_ok = $false }
}
if ($all_ok) { Write-Host "ALL CLEAN" }
