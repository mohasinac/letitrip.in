# VS Code AI Command Approval Settings

You can add these settings to your VS Code user settings to reduce AI command approval prompts:

## Option 1: Through VS Code UI

1. Press `Ctrl + Shift + P` to open command palette
2. Type "Preferences: Open User Settings (JSON)"
3. Add the following settings:

```json
{
  // GitHub Copilot Chat Settings
  "github.copilot.chat.terminalChatLocation": "terminal",
  "github.copilot.chat.welcomeMessage": "never",

  // Reduce terminal warnings and prompts
  "terminal.integrated.enableMultiLinePasteWarning": "never",
  "terminal.integrated.confirmOnExit": "never",
  "terminal.integrated.confirmOnKill": "panel",

  // Security settings (be careful with these)
  "security.workspace.trust.banner": "never",
  "security.workspace.trust.startupPrompt": "never",
  "security.workspace.trust.emptyWindow": false,

  // Git settings to reduce prompts
  "git.confirmSync": false,
  "git.enableSmartCommit": true,
  "git.autofetch": true,

  // AI assistance settings
  "github.copilot.enable": {
    "*": true,
    "yaml": true,
    "plaintext": true,
    "markdown": true,
    "jsonc": true
  },

  // Editor enhancements
  "editor.inlineSuggest.enabled": true,
  "editor.suggestSelection": "first"
}
```

## Option 2: Command Palette Method

1. Press `Ctrl + Shift + P`
2. Type "GitHub Copilot: Enable"
3. Select options to enable various Copilot features

## Option 3: Workspace Trust

If you're still getting prompts about workspace trust:

1. Press `Ctrl + Shift + P`
2. Type "Workspaces: Manage Workspace Trust"
3. Mark your project folder as trusted

## Notes:

- Some security prompts are there for your protection
- Git push/commit commands will still require approval for security
- You can always re-enable prompts if needed
- These settings affect your entire VS Code experience, not just this project
