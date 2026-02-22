#!/bin/bash
set -e

echo "┌─────────────────────────────────────┐"
echo "│   Ion Slack Bot - Package Script   │"
echo "└─────────────────────────────────────┘"
echo ""

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARCHIVE_NAME="ion-slack-bot-v${VERSION}-${TIMESTAMP}.tar.gz"

echo "Version: $VERSION"
echo "Archive: $ARCHIVE_NAME"
echo ""

# Create temporary directory
TMP_DIR=$(mktemp -d)
PACKAGE_DIR="$TMP_DIR/ion-slack-bot"

echo "Preparing package..."

# Copy files
mkdir -p "$PACKAGE_DIR"
cp -r . "$PACKAGE_DIR/"

# Remove files we don't want to package
cd "$PACKAGE_DIR"
rm -rf node_modules
rm -rf .git
rm -f .env
rm -f .env.local
rm -f *.log
rm -rf .DS_Store

echo "Creating archive..."

# Create archive
cd "$TMP_DIR"
tar -czf "$ARCHIVE_NAME" ion-slack-bot/

# Move to original directory
ORIGINAL_DIR=$(dirname "$(pwd)")
mv "$ARCHIVE_NAME" "$OLDPWD/"

# Cleanup
rm -rf "$TMP_DIR"

# Show result
cd "$OLDPWD"
SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)

echo ""
echo "✅ Package created successfully!"
echo ""
echo "File: $ARCHIVE_NAME"
echo "Size: $SIZE"
echo ""
echo "To deploy on another machine:"
echo "  1. Copy $ARCHIVE_NAME to target machine"
echo "  2. Extract: tar -xzf $ARCHIVE_NAME"
echo "  3. Run: cd ion-slack-bot && ./scripts/setup.sh"
echo ""
