#!/bin/bash

# Deployment script for Social Post Downloader App
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
echo "🚀 Starting deployment for environment: $ENVIRONMENT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed - Docker deployment will not be available"
    fi
    
    print_status "Dependencies check completed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm ci
    cd server && npm ci && cd ..
    print_status "Dependencies installed"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    npm run lint
    npm run type-check
    npm test -- --watchAll=false
    npm run test:server
    print_status "All tests passed"
}

# Build the application
build_app() {
    print_status "Building application..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        npm run build:server
        print_status "Server built successfully"
    else
        print_status "Skipping build for development environment"
    fi
}

# Deploy server with Docker
deploy_docker() {
    if command -v docker &> /dev/null; then
        print_status "Deploying with Docker..."
        docker-compose down
        docker-compose up --build -d
        print_status "Docker deployment completed"
    else
        print_warning "Docker not available, skipping Docker deployment"
    fi
}

# Deploy to EAS (Expo Application Services)
deploy_mobile() {
    if command -v eas &> /dev/null; then
        print_status "Deploying mobile app with EAS..."
        
        if [ "$ENVIRONMENT" = "production" ]; then
            eas build --platform all --profile production
        else
            eas build --platform all --profile preview
        fi
        
        print_status "Mobile app deployment initiated"
    else
        print_warning "EAS CLI not installed, skipping mobile deployment"
        print_status "To deploy mobile app, install EAS CLI: npm install -g eas-cli"
    fi
}

# Main deployment function
main() {
    print_status "Starting deployment process..."
    
    check_dependencies
    install_dependencies
    run_tests
    build_app
    
    case $ENVIRONMENT in
        "production")
            print_status "Production deployment"
            deploy_docker
            deploy_mobile
            ;;
        "staging")
            print_status "Staging deployment"
            deploy_docker
            ;;
        "development")
            print_status "Development deployment"
            print_status "Starting development servers..."
            npm run dev
            ;;
        *)
            print_error "Unknown environment: $ENVIRONMENT"
            print_status "Available environments: production, staging, development"
            exit 1
            ;;
    esac
    
    print_status "Deployment completed successfully! 🎉"
}

# Run main function
main
