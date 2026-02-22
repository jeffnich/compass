#!/bin/bash
set -e

echo "┌─────────────────────────────────────┐"
echo "│   Cursor MCP Setup for Ion         │"
echo "└─────────────────────────────────────┘"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get the absolute path to mcp/server.js
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SERVER_PATH="$SCRIPT_DIR/server.js"

echo "MCP Server location: $SERVER_PATH"
echo ""

# Create .cursor directory
echo "Setting up Cursor MCP config..."
mkdir -p ~/.cursor

# Create mcp.json with correct path
cat > ~/.cursor/mcp.json << EOF
{
  "mcpServers": {
    "ion": {
      "command": "node",
      "args": [
        "$SERVER_PATH"
      ],
      "env": {
        "DATABASE_URL": "postgresql://localhost/ion_slack"
      }
    }
  }
}
EOF

echo -e "${GREEN}✓ Created ~/.cursor/mcp.json${NC}"
echo ""

# Seed test data
echo "Seeding test data..."
psql -d ion_slack -f "$SCRIPT_DIR/../db/seed-test-data.sql" > /dev/null 2>&1
echo -e "${GREEN}✓ Test data seeded (33 messages)${NC}"
echo ""

# Test MCP server
echo "Testing MCP server..."
if node "$SERVER_PATH" 2>&1 | grep -q "Ion MCP Server running"; then
    echo -e "${GREEN}✓ MCP server works!${NC}"
else
    echo -e "${YELLOW}⚠ MCP server test failed - check manually${NC}"
fi
echo ""

echo "┌─────────────────────────────────────┐"
echo "│   Setup Complete!                   │"
echo "└─────────────────────────────────────┘"
echo ""
echo "Next steps:"
echo ""
echo "1. Restart Cursor completely (Cmd+Q or Alt+F4)"
echo ""
echo "2. Open Cursor and press Cmd+L (or Ctrl+L)"
echo ""
echo "3. Test with this prompt:"
echo "   ${GREEN}Use the ion tool to list all channels${NC}"
echo ""
echo "4. Full test prompts:"
echo "   cat $SCRIPT_DIR/CURSOR_TEST.md"
echo ""
echo "Troubleshooting: $SCRIPT_DIR/CURSOR_SETUP.md"
echo ""
