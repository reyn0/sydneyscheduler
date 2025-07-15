#!/bin/bash
# Production build script with environment variables
# Run this on your DigitalOcean server

echo "🚀 Building Frontend for Production"
echo "=================================="

# Navigate to frontend directory
cd /srv/sydneyscheduler/frontend || exit 1

# Check if production environment file exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    echo "Create it with your real Google Analytics ID:"
    echo "REACT_APP_GA_MEASUREMENT_ID=G-YOUR-REAL-ID"
    exit 1
fi

echo "📋 Building with production environment..."

# Build with production environment
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    
    # Copy build files to nginx directory
    echo "📁 Copying files to nginx directory..."
    sudo cp -r build/* /srv/sydneyscheduler/frontend/build/
    
    # Fix permissions
    sudo chown -R www-data:www-data /srv/sydneyscheduler/frontend/build/
    sudo chmod -R 755 /srv/sydneyscheduler/frontend/build/
    
    echo "✅ Deployment complete!"
    echo "🌐 Your site should now have Google Analytics enabled"
else
    echo "❌ Build failed!"
    exit 1
fi
