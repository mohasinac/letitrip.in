# Vercel Environment Variables Sync Script

This script automatically reads environment variables from `vercel.json` and synchronizes them with your Vercel project using the Vercel CLI.

## Features

- ✅ **Automatic sync**: Reads all environment variables from `vercel.json`
- 🔄 **Update existing**: Automatically updates variables that have changed
- ➕ **Add new**: Adds new environment variables that don't exist
- ⏭️ **Skip unchanged**: Skips variables that are already up to date
- 📊 **Progress tracking**: Real-time progress bar with ETA and status
- 🎨 **Colorful output**: Beautiful terminal output with status indicators
- ⚡ **Loading spinners**: Visual feedback for long-running operations
- 🛡️ **Error handling**: Graceful error handling and detailed reporting

## Prerequisites

1. **Vercel CLI**: Make sure you have the Vercel CLI installed

   ```bash
   npm install -g vercel
   ```

2. **Authentication**: You must be logged in to Vercel

   ```bash
   vercel login
   ```

3. **Project setup**: Your project should be linked to a Vercel project
   ```bash
   vercel link
   ```

## Usage

### Method 1: Using npm script (Recommended)

```bash
npm run vercel:env-sync
```

### Method 2: Direct execution

```bash
node scripts/sync-vercel-env.js
```

### Method 3: Full deployment with env sync

```bash
npm run vercel:setup
```

## How it works

1. **Validation**: Checks if Vercel CLI is installed and user is authenticated
2. **Reading**: Reads environment variables from `vercel.json`
3. **Comparison**: Fetches existing environment variables from Vercel
4. **Synchronization**:
   - Adds new variables that don't exist
   - Updates variables that have changed values
   - Skips variables that are already up to date
5. **Reporting**: Provides detailed results of the sync operation

## Configuration

The script reads environment variables from the `env` section of your `vercel.json` file:

```json
{
  "env": {
    "JWT_SECRET": "your-jwt-secret",
    "NEXT_PUBLIC_API_URL": "https://your-api.com",
    "DATABASE_URL": "your-database-url"
  }
}
```

## Output Example

```
🚀 Vercel Environment Variables Sync
══════════════════════════════════════════════════

🔍 Checking Vercel CLI installation...
✅ Vercel CLI is installed

🔐 Checking Vercel authentication...
✅ Authenticated as: your-email@example.com

⠋ Reading vercel.json configuration...
✅ Found 15 environment variables in vercel.json

⠙ Fetching existing environment variables...
✅ Found 12 existing environment variables

🚀 Syncing 15 environment variables...
──────────────────────────────────────────────────
[██████████████████████████████] 100% (15/15) 12.3s ETA: 0s ⚡ All variables processed

──────────────────────────────────────────────────
📊 Sync Results:
✅ Added: 3
🔄 Updated: 2
⏭️  Skipped: 10
❌ Failed: 0

🎉 Successfully synced 5 environment variables!
Your environment variables are now up to date.

💡 Next Steps:
• Run your deployment: vercel --prod
• Check your variables: vercel env ls production
• View your project: https://vercel.com/dashboard
```

## Error Handling

The script handles various error scenarios:

- **Vercel CLI not installed**: Provides installation instructions
- **Not authenticated**: Prompts to run `vercel login`
- **No vercel.json**: Clear error message about missing configuration
- **Invalid JSON**: Detailed parsing error information
- **Network issues**: Graceful handling of API failures
- **Permission issues**: Clear error messages for access problems

## Environment Targets

Currently, the script syncs variables to the **production** environment. You can modify the script to target different environments by changing the `production` parameter in the Vercel CLI commands.

## Security Notes

- The script handles sensitive environment variables securely
- Private keys and secrets are not logged to the console
- All communication with Vercel API is encrypted

## Troubleshooting

### Common Issues

1. **"Vercel CLI not found"**

   - Install the CLI: `npm install -g vercel`

2. **"Not authenticated"**

   - Login to Vercel: `vercel login`

3. **"No vercel.json found"**

   - Make sure you're running the script from the root directory
   - Ensure `vercel.json` exists in your project root

4. **"Permission denied"**
   - Make sure you have access to the Vercel project
   - Check if you're the owner or have appropriate permissions

### Debug Mode

For detailed debugging, you can modify the script to show more verbose output by changing `silent: true` to `silent: false` in the `executeCommand` calls.

## Contributing

If you find any issues or have suggestions for improvements, please:

1. Check existing issues
2. Create a new issue with detailed description
3. Submit a pull request with your changes

## License

This script is part of the JustForView project and follows the same license terms.
