#!/bin/bash

# Automated Vercel Production Deployment Script
# This script updates all environment variables and deploys to production

set -e

SKIP_ENV_UPDATE=false
FORCE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --skip-env-update)
      SKIP_ENV_UPDATE=true
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

echo "============================================"
echo "Vercel Production Deployment Automation"
echo "============================================"
echo ""

# Check if Vercel CLI is installed
echo "Checking Vercel CLI installation..."
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✓ Vercel CLI installed successfully"
else
    echo "✓ Vercel CLI is installed"
fi

echo ""

# Check if project is linked
echo "Checking Vercel project link..."
if [ ! -d ".vercel" ]; then
    echo "Project not linked to Vercel. Linking now..."
    vercel link
fi
echo "✓ Project is linked to Vercel"
echo ""

# Update environment variables if not skipped
if [ "$SKIP_ENV_UPDATE" = false ]; then
    echo "============================================"
    echo "Updating Environment Variables"
    echo "============================================"
    echo ""

    ENV_FILE=".env.production"
    if [ ! -f "$ENV_FILE" ]; then
        echo "Error: $ENV_FILE not found!"
        exit 1
    fi

    echo "Reading environment variables from $ENV_FILE..."
    
    # Remove all existing production environment variables
    echo "Removing existing production environment variables..."
    vercel env ls production 2>/dev/null | grep -v "name" | grep -v "^$" | awk '{print $1}' | while read -r key; do
        if [ ! -z "$key" ]; then
            echo "  Removing: $key"
            vercel env rm "$key" production --yes 2>/dev/null || true
        fi
    done
    echo "✓ Existing variables removed"
    echo ""

    # Add new environment variables
    echo "Adding environment variables to Vercel production..."
    SUCCESS_COUNT=0
    FAIL_COUNT=0

    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ $key =~ ^#.* ]] || [[ -z "$key" ]]; then
            continue
        fi

        # Remove leading/trailing whitespace
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)

        # Remove surrounding quotes if present
        value="${value#\"}"
        value="${value%\"}"

        # Skip empty values
        if [[ -z "$value" ]]; then
            echo "  Skipping $key (empty value)"
            continue
        fi

        echo "  Setting: $key"
        
        if echo "$value" | vercel env add "$key" production 2>/dev/null; then
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
            echo "    ✓ Success"
        else
            FAIL_COUNT=$((FAIL_COUNT + 1))
            echo "    ✗ Failed"
        fi
    done < "$ENV_FILE"

    echo ""
    echo "Environment Variables Summary:"
    echo "  Success: $SUCCESS_COUNT"
    echo "  Failed: $FAIL_COUNT"
    echo ""

    if [ $FAIL_COUNT -gt 0 ] && [ "$FORCE" = false ]; then
        read -p "Some environment variables failed to update. Continue with deployment? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Deployment cancelled."
            exit 1
        fi
    fi
else
    echo "Skipping environment variable update (--skip-env-update flag)"
    echo ""
fi

# Deploy to production
echo "============================================"
echo "Deploying to Production"
echo "============================================"
echo ""

echo "Starting production deployment..."
echo ""

if vercel --prod --yes; then
    echo ""
    echo "============================================"
    echo "✓ Deployment Successful!"
    echo "============================================"
    echo ""
    echo "Your application is now live in production!"
    echo ""
    echo "Next steps:"
    echo "  1. Visit your production URL"
    echo "  2. Check the Vercel dashboard for deployment details"
    echo "  3. Monitor logs for any issues"
    echo ""
else
    echo ""
    echo "============================================"
    echo "✗ Deployment Failed!"
    echo "============================================"
    echo ""
    echo "Please check the error messages above and try again."
    echo ""
    echo "Common issues:"
    echo "  1. Build errors - Check your code for compilation issues"
    echo "  2. Missing dependencies - Run 'npm install' locally"
    echo "  3. Environment variables - Verify all required vars are set"
    echo ""
    exit 1
fi
