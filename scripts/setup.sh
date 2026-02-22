#!/bin/bash
set -e

echo "┌─────────────────────────────────────┐"
echo "│   Ion Slack Bot - Setup Script     │"
echo "└─────────────────────────────────────┘"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo "Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found${NC}"
    echo "Install Node.js 18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js version too old (need 18+)${NC}"
    echo "Current: $(node --version)"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version)${NC}"

# Check npm
echo "Checking npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Install dependencies
echo ""
echo "Installing Node.js dependencies..."
npm install

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Check PostgreSQL
echo ""
echo "Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠ PostgreSQL not found${NC}"
    echo ""
    echo "Install PostgreSQL:"
    echo "  macOS:   brew install postgresql@17"
    echo "  Ubuntu:  sudo apt install postgresql postgresql-contrib"
    echo "  Debian:  sudo apt install postgresql postgresql-contrib"
    echo ""
    read -p "Continue without PostgreSQL? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    PG_VERSION=$(psql --version | grep -oP '\d+' | head -1)
    echo -e "${GREEN}✓ PostgreSQL $PG_VERSION${NC}"
    
    # Check if PostgreSQL is running
    echo "Checking if PostgreSQL is running..."
    if pg_isready &> /dev/null; then
        echo -e "${GREEN}✓ PostgreSQL is running${NC}"
    else
        echo -e "${YELLOW}⚠ PostgreSQL not running${NC}"
        echo ""
        echo "Start PostgreSQL:"
        echo "  macOS:   brew services start postgresql@17"
        echo "  Linux:   sudo systemctl start postgresql"
        echo ""
        read -p "Try to start PostgreSQL now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v brew &> /dev/null; then
                brew services start postgresql@17
            else
                sudo systemctl start postgresql
            fi
        fi
    fi
    
    # Create database
    echo ""
    echo "Creating database..."
    if psql -lqt | cut -d \| -f 1 | grep -qw ion_slack; then
        echo -e "${YELLOW}⚠ Database 'ion_slack' already exists${NC}"
        read -p "Drop and recreate? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            dropdb ion_slack
            createdb ion_slack
            echo -e "${GREEN}✓ Database recreated${NC}"
        fi
    else
        createdb ion_slack
        echo -e "${GREEN}✓ Database created${NC}"
    fi
    
    # Run schema
    echo "Running database schema..."
    if [ -f "db/schema.sql" ]; then
        psql -d ion_slack -f db/schema.sql > /dev/null 2>&1
        echo -e "${GREEN}✓ Schema created${NC}"
        
        # Check pgvector
        if psql -d ion_slack -c "SELECT * FROM pg_extension WHERE extname = 'vector';" | grep -q vector; then
            echo -e "${GREEN}✓ pgvector extension enabled${NC}"
        else
            echo -e "${RED}✗ pgvector extension not found${NC}"
            echo ""
            echo "Install pgvector:"
            echo "  macOS:   brew install pgvector"
            echo "  Ubuntu:  sudo apt install postgresql-17-pgvector"
            echo ""
        fi
    else
        echo -e "${YELLOW}⚠ db/schema.sql not found${NC}"
    fi
fi

# Check for .env file
echo ""
echo "Checking configuration..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    
    # Validate required variables
    MISSING_VARS=()
    
    if ! grep -q "SLACK_BOT_TOKEN=xoxb-" .env; then
        MISSING_VARS+=("SLACK_BOT_TOKEN")
    fi
    
    if ! grep -q "SLACK_SIGNING_SECRET=" .env || grep -q "SLACK_SIGNING_SECRET=$" .env; then
        MISSING_VARS+=("SLACK_SIGNING_SECRET")
    fi
    
    if ! grep -q "SLACK_APP_TOKEN=xapp-" .env; then
        MISSING_VARS+=("SLACK_APP_TOKEN")
    fi
    
    if ! grep -q "OPENAI_API_KEY=sk-" .env; then
        MISSING_VARS+=("OPENAI_API_KEY")
    fi
    
    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        echo -e "${YELLOW}⚠ Missing or incomplete environment variables:${NC}"
        for var in "${MISSING_VARS[@]}"; do
            echo "  - $var"
        done
        echo ""
        echo "Edit .env and add these values"
    else
        echo -e "${GREEN}✓ All required environment variables set${NC}"
    fi
else
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from template${NC}"
        echo ""
        echo -e "${YELLOW}⚠ Edit .env and add your tokens${NC}"
    else
        echo -e "${RED}✗ .env.example not found${NC}"
    fi
fi

# Summary
echo ""
echo "┌─────────────────────────────────────┐"
echo "│   Setup Complete!                   │"
echo "└─────────────────────────────────────┘"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure Slack app:"
echo "   - Go to https://api.slack.com/apps"
echo "   - Create app from manifest: slack-app-manifest.yaml"
echo "   - Copy tokens to .env"
echo ""
echo "2. Add OpenAI API key to .env"
echo ""
echo "3. Start the bot:"
echo "   npm start"
echo ""
echo "Documentation:"
echo "  - Setup:    SETUP_CHECKLIST.md"
echo "  - Slack:    SLACK_SETUP.md"
echo "  - Deploy:   DEPLOYMENT.md"
echo "  - Memory:   docs/MEMORY_SYSTEM.md"
echo ""
echo "Optional:"
echo "  - Cursor integration: ./mcp/setup-cursor.sh"
echo "    (Search Slack from your code editor)"
echo ""
