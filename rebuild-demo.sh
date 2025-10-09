#!/bin/bash

# Quick rebuild and restart demo script

echo "🔨 Building SDK..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build complete!"
echo ""
echo "🧹 Clearing Vite cache in demo..."
rm -rf demo/node_modules/.vite

echo "✅ Cache cleared!"
echo ""
echo "📝 Next steps:"
echo "   1. Go to your demo terminal"
echo "   2. Stop the dev server (Ctrl+C)"
echo "   3. Run: npm run dev"
echo ""
echo "Or run this to start demo:"
echo "   cd demo && npm run dev"

