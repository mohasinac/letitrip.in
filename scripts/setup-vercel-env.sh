#!/bin/bash

# Vercel Environment Variables Setup Script for Unix/Linux/Mac
# Run this to get the commands to set up Vercel environment variables

echo "=================================="
echo "Vercel Environment Variables Setup"
echo "=================================="
echo ""
echo "Copy and run these commands in your terminal (after installing Vercel CLI):"
echo ""

# Read .env.production file
ENV_FILE=".env.production"

if [ -f "$ENV_FILE" ]; then
    echo "# Install Vercel CLI (if not installed)"
    echo "npm i -g vercel"
    echo ""
    
    echo "# Login to Vercel"
    echo "vercel login"
    echo ""
    
    echo "# Link your project"
    echo "vercel link"
    echo ""
    
    echo "# Set environment variables"
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ ! "$key" =~ ^# ]] && [[ -n "$key" ]] && [[ -n "$value" ]]; then
            echo "vercel env add $key production"
            echo "# When prompted, paste: $value"
            echo ""
        fi
    done < "$ENV_FILE"
    
    echo ""
    echo "=================================="
    echo "Alternative: Use Vercel Dashboard"
    echo "=================================="
    echo ""
    echo "1. Go to https://vercel.com/dashboard"
    echo "2. Select your project"
    echo "3. Go to Settings -> Environment Variables"
    echo "4. Add the following variables:"
    echo ""
    
    grep -v '^#' "$ENV_FILE" | grep '=' | cut -d'=' -f1 | while read -r key; do
        if [[ -n "$key" ]]; then
            echo "  $key"
        fi
    done
    
    echo ""
    echo "Environment variables file location: $ENV_FILE"
    echo ""
else
    echo "Error: .env.production file not found!"
    echo "Please ensure .env.production exists in the project root."
fi

echo "=================================="
echo "Quick Deploy Commands"
echo "=================================="
echo ""
echo "# Deploy to preview"
echo "vercel"
echo ""
echo "# Deploy to production"
echo "vercel --prod"
echo ""
