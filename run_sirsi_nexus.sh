#!/bin/zsh

# This script runs the unified sirsi-nexus binary in production mode

# Navigate to the directory containing the executable
cd "$(dirname "$0")"

# Start the platform
./sirsi-nexus start
