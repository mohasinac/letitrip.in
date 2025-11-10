#!/bin/bash

# Firebase Setup and Deployment Script
# This script helps deploy Firebase rules, indexes, and configuration

echo "=================================="
echo "Firebase Setup & Deployment"
echo "=================================="
echo ""

# Check if firebase-tools is installed
echo "Checking Firebase CLI installation..."
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Installing..."
    npm install -g firebase-tools
    echo "Firebase CLI installed successfully!"
else
    echo "Firebase CLI is already installed."
fi

echo ""
echo "=================================="
echo "Step 1: Login to Firebase"
echo "=================================="
echo ""
echo "Running: firebase login"
firebase login

echo ""
echo "=================================="
echo "Step 2: Set Firebase Project"
echo "=================================="
echo ""
echo "Setting project to: letitrip-in-app"
firebase use letitrip-in-app

echo ""
echo "=================================="
echo "Step 3: Deploy Firestore Rules"
echo "=================================="
echo ""
echo "Deploying Firestore security rules..."
firebase deploy --only firestore:rules

echo ""
echo "=================================="
echo "Step 4: Deploy Firestore Indexes"
echo "=================================="
echo ""
echo "Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

echo ""
echo "=================================="
echo "Step 5: Deploy Storage Rules"
echo "=================================="
echo ""
echo "Deploying Storage security rules..."
firebase deploy --only storage

echo ""
echo "=================================="
echo "Step 6: Deploy Realtime Database Rules"
echo "=================================="
echo ""
echo "Deploying Realtime Database rules..."
firebase deploy --only database

echo ""
echo "=================================="
echo "Deployment Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Go to Firebase Console: https://console.firebase.google.com/project/letitrip-in-app"
echo "2. Enable Authentication -> Email/Password provider"
echo "3. Verify Firestore Database is created"
echo "4. Verify Storage bucket is created"
echo "5. Verify Realtime Database is created"
echo ""
echo "Project Details:"
echo "  Project ID: letitrip-in-app"
echo "  Region: Asia Southeast 1"
echo "  Repository: https://github.com/mohasinac/letitrip.in"
echo ""
