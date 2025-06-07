#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting Supabase Next.js Starter Development Environment${NC}"
echo -e "${BLUE}================================================${NC}"

# Check if stripe CLI is installed
if ! command -v stripe &> /dev/null; then
    echo -e "${YELLOW}⚠️  Stripe CLI is not installed!${NC}"
    echo "Please install it first:"
    echo "  macOS: brew install stripe/stripe-cli/stripe"
    echo "  Windows: scoop install stripe"
    echo "  Or visit: https://stripe.com/docs/stripe-cli"
    exit 1
fi

# Check if bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${YELLOW}⚠️  Bun is not installed!${NC}"
    echo "Please install it first: https://bun.sh"
    exit 1
fi

# Store PIDs
BUN_PID=""
STRIPE_PID=""

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down development environment...${NC}"
    
    # Kill bun process if it exists
    if [ ! -z "$BUN_PID" ]; then
        kill $BUN_PID 2>/dev/null
    fi
    
    # Kill stripe process if it exists
    if [ ! -z "$STRIPE_PID" ]; then
        kill $STRIPE_PID 2>/dev/null
    fi
    
    # Give processes time to shut down
    sleep 1
    
    # Force kill if still running
    if [ ! -z "$BUN_PID" ]; then
        kill -9 $BUN_PID 2>/dev/null
    fi
    
    if [ ! -z "$STRIPE_PID" ]; then
        kill -9 $STRIPE_PID 2>/dev/null
    fi
    
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start Next.js development server in background
echo -e "${GREEN}Starting Next.js development server on port 3001...${NC}"
PORT=3001 bun dev &
BUN_PID=$!

# Give the server a moment to start
sleep 3

# Start Stripe webhook listener in background
echo -e "${GREEN}Starting Stripe webhook listener...${NC}"
echo -e "${YELLOW}Note: Watch for the webhook signing secret (whsec_...) below${NC}"
echo -e "${YELLOW}and update STRIPE_WEBHOOK_SECRET in .env.local if needed${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "Next.js app: ${GREEN}http://localhost:3001${NC}"
echo -e "Stripe webhooks forwarding to: ${GREEN}http://localhost:3001/api/webhooks/stripe${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Run stripe listen and capture its PID
stripe listen --forward-to localhost:3001/api/webhooks/stripe &
STRIPE_PID=$!

# Wait for processes
wait