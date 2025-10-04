#!/bin/bash

# =============================================================================
# E-commerce Backend Development Server Management Script
# =============================================================================
# This script provides complete lifecycle management for the development server
# Usage: ./run_dev.sh [start|stop|restart|status|logs|clean]
# =============================================================================

set -e  # Exit on any error

# Configuration
SERVER_NAME="ecommerce-backend"
SERVER_PORT="8088"
PID_FILE=".server.pid"
LOG_FILE="logs/server.log"
ERROR_LOG_FILE="logs/server.error.log"
NODE_ENV="development"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Create logs directory if it doesn't exist
mkdir -p logs

# =============================================================================
# Helper Functions
# =============================================================================

print_banner() {
    echo -e "${BLUE}"
    echo "🚀===============================================🚀"
    echo "🚀     E-commerce Backend Server Manager      🚀"
    echo "🚀===============================================🚀"
    echo -e "${NC}"
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    echo -e "${CYAN}[DEBUG]${NC} $1"
}

# Check if server is running
is_server_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            return 0  # Server is running
        else
            # Stale PID file
            rm -f "$PID_FILE"
            return 1  # Server is not running
        fi
    else
        return 1  # Server is not running
    fi
}

# Get server PID
get_server_pid() {
    if [ -f "$PID_FILE" ]; then
        cat "$PID_FILE"
    else
        echo ""
    fi
}

# Check if port is in use
is_port_in_use() {
    lsof -i :$SERVER_PORT >/dev/null 2>&1
}

# Kill processes on port
kill_port_processes() {
    log_info "Killing any processes using port $SERVER_PORT..."
    
    # Find and kill processes using the port
    local pids=$(lsof -ti :$SERVER_PORT 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        for pid in $pids; do
            log_debug "Killing process $pid using port $SERVER_PORT"
            kill -TERM "$pid" 2>/dev/null || true
            
            # Wait a moment and force kill if still running
            sleep 2
            if kill -0 "$pid" 2>/dev/null; then
                log_warn "Force killing process $pid"
                kill -KILL "$pid" 2>/dev/null || true
            fi
        done
        log_info "Port $SERVER_PORT cleaned up"
    else
        log_debug "No processes found using port $SERVER_PORT"
    fi
}

# Clean up stale processes and files
cleanup_stale() {
    log_info "Cleaning up stale processes and files..."
    
    # Remove stale PID file if process is not running
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ! kill -0 "$pid" 2>/dev/null; then
            log_debug "Removing stale PID file for process $pid"
            rm -f "$PID_FILE"
        fi
    fi
    
    # Kill any node processes running our server
    pkill -f "node.*index.js" 2>/dev/null || true
    
    # Clean up port
    kill_port_processes
}

# =============================================================================
# Server Management Functions
# =============================================================================

start_server() {
    print_banner
    log_info "Starting $SERVER_NAME server..."
    
    # Check if already running
    if is_server_running; then
        local pid=$(get_server_pid)
        log_warn "Server is already running with PID: $pid"
        log_info "Use './run_dev.sh stop' to stop it first, or './run_dev.sh restart' to restart"
        return 1
    fi
    
    # Clean up any stale processes
    cleanup_stale
    
    # Check Node.js dependencies
    if [ ! -d "node_modules" ]; then
        log_warn "Node modules not found. Installing dependencies..."
        npm install
    fi
    
    # Start server in background with logging
    log_info "Starting server on port $SERVER_PORT..."
    
    # Set environment variables
    export NODE_ENV="$NODE_ENV"
    export PORT="$SERVER_PORT"
    
    # Start the server with proper logging
    nohup node index.js > "$LOG_FILE" 2> "$ERROR_LOG_FILE" &
    
    # Wait a moment for server to start
    sleep 3
    
    # Check if server started successfully
    if is_server_running; then
        local pid=$(get_server_pid)
        log_info "✅ Server started successfully!"
        log_info "🆔 Process ID: $pid"
        log_info "🌐 Server URL: http://localhost:$SERVER_PORT"
        log_info "📊 Environment: $NODE_ENV"
        log_info "📝 Logs: $LOG_FILE"
        log_info "❌ Error logs: $ERROR_LOG_FILE"
        echo ""
        log_info "Use './run_dev.sh logs' to view real-time logs"
        log_info "Use './run_dev.sh stop' to stop the server"
    else
        log_error "Failed to start server"
        log_error "Check error logs: $ERROR_LOG_FILE"
        cat "$ERROR_LOG_FILE" 2>/dev/null || true
        return 1
    fi
}

stop_server() {
    log_info "Stopping $SERVER_NAME server..."
    
    if is_server_running; then
        local pid=$(get_server_pid)
        log_info "Stopping server with PID: $pid"
        
        # Send SIGTERM for graceful shutdown
        kill -TERM "$pid" 2>/dev/null || true
        
        # Wait for graceful shutdown
        local count=0
        while kill -0 "$pid" 2>/dev/null && [ $count -lt 10 ]; do
            sleep 1
            count=$((count + 1))
            log_debug "Waiting for graceful shutdown... ($count/10)"
        done
        
        # Force kill if still running
        if kill -0 "$pid" 2>/dev/null; then
            log_warn "Graceful shutdown timeout. Force killing..."
            kill -KILL "$pid" 2>/dev/null || true
        fi
        
        # Clean up
        rm -f "$PID_FILE"
        log_info "✅ Server stopped successfully"
    else
        log_warn "Server is not running"
    fi
    
    # Clean up any remaining processes
    cleanup_stale
}

restart_server() {
    log_info "Restarting $SERVER_NAME server..."
    stop_server
    sleep 2
    start_server
}

server_status() {
    print_banner
    
    if is_server_running; then
        local pid=$(get_server_pid)
        log_info "✅ Server is RUNNING"
        log_info "🆔 Process ID: $pid"
        log_info "🌐 Server URL: http://localhost:$SERVER_PORT"
        log_info "📊 Environment: $NODE_ENV"
        
        # Show memory usage
        if command -v ps >/dev/null 2>&1; then
            local memory=$(ps -o pid,ppid,rss,vsz,pcpu,pmem,comm -p "$pid" 2>/dev/null || true)
            if [ -n "$memory" ]; then
                echo ""
                log_info "📈 Process Information:"
                echo "$memory"
            fi
        fi
        
        # Test server health
        echo ""
        log_info "🏥 Health Check:"
        if curl -s "http://localhost:$SERVER_PORT/health" >/dev/null 2>&1; then
            log_info "✅ Server is responding to health checks"
        else
            log_warn "⚠️  Server is not responding to health checks"
        fi
        
    else
        log_warn "❌ Server is NOT running"
        
        # Check if port is still in use
        if is_port_in_use; then
            log_warn "⚠️  Port $SERVER_PORT is still in use by another process"
            log_info "Processes using port $SERVER_PORT:"
            lsof -i :$SERVER_PORT 2>/dev/null || true
        fi
    fi
}

show_logs() {
    if [ ! -f "$LOG_FILE" ]; then
        log_warn "Log file not found: $LOG_FILE"
        return 1
    fi
    
    log_info "📝 Showing real-time logs (Ctrl+C to exit):"
    echo ""
    tail -f "$LOG_FILE"
}

clean_environment() {
    log_info "🧹 Cleaning development environment..."
    
    # Stop server if running
    if is_server_running; then
        stop_server
    fi
    
    # Clean up files
    rm -f "$PID_FILE"
    
    # Clean up logs (keep last 5 files)
    if [ -d "logs" ]; then
        find logs -name "*.log" -type f -mtime +5 -delete 2>/dev/null || true
    fi
    
    # Clean up any stale processes
    cleanup_stale
    
    log_info "✅ Environment cleaned"
}

show_help() {
    print_banner
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start the development server"
    echo "  stop      Stop the development server"
    echo "  restart   Restart the development server"
    echo "  status    Show server status and health"
    echo "  logs      Show real-time server logs"
    echo "  clean     Clean up environment and stale processes"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start          # Start the server"
    echo "  $0 restart        # Restart the server"
    echo "  $0 status         # Check if server is running"
    echo "  $0 logs           # View real-time logs"
    echo ""
}

# =============================================================================
# Main Script Logic
# =============================================================================

case "${1:-help}" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        server_status
        ;;
    logs)
        show_logs
        ;;
    clean)
        clean_environment
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac