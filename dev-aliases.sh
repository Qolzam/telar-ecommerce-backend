#!/bin/bash

# =============================================================================
# Quick Development Scripts for E-commerce Backend
# =============================================================================

# Clean everything and start fresh
alias server-fresh="./run_dev.sh clean && ./run_dev.sh start"

# Quick status check
alias server-check="./run_dev.sh status"

# View logs
alias server-logs="./run_dev.sh logs"

# Quick restart
alias server-restart="./run_dev.sh restart"

echo "🚀 Development aliases loaded:"
echo "  server-fresh   - Clean and start fresh"
echo "  server-check   - Quick status check"
echo "  server-logs    - View real-time logs"
echo "  server-restart - Quick restart"
echo ""
echo "💡 Add 'source dev-aliases.sh' to your ~/.zshrc for permanent aliases"