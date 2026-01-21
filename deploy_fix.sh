#!/bin/bash

echo "=========================================="
echo "🚀 EPOCH 2026 - Deploy Production Fix"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "app.py" ]; then
    echo "❌ Error: Not in EPOCH project directory"
    echo "   Please run this from /home/mohan/Desktop/Epoch"
    exit 1
fi

echo "📋 Step 1: Checking Git status..."
git status

echo ""
echo "📦 Step 2: Adding requirements.txt..."
git add requirements.txt

echo ""
echo "✍️  Step 3: Committing changes..."
git commit -m "Fix: Add requests library for reCAPTCHA verification in production"

echo ""
echo "🔼 Step 4: Pushing to repository..."
git push origin main

echo ""
echo "=========================================="
echo "✅ Deployment Initiated!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Check your EPOCH project deployments"
echo "3. Wait for deployment to show 'Ready' status (2-3 minutes)"
echo "4. Test registration at your production URL"
echo ""
echo "📖 For full instructions, see: production_fix.md"
echo ""
