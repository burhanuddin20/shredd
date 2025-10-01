#!/bin/bash

# Test script to run the app with mock paywall enabled
echo "🚀 Starting Shredd with Mock Paywall enabled..."
echo "📱 This will show the mock paywall for App Store screenshots"
echo ""

# Set the environment variable and start the app
USE_MOCK_PAYWALL=true npx expo start --clear
