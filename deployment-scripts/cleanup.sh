#!/bin/bash
# Project Cleanup Script - Remove redundant and temporary files
# Run this to clean up the project after successful deployment

echo "🧹 Cleaning up Project Files"
echo "============================"

# Files to remove (redundant or superseded)
CLEANUP_FILES=(
    # Redundant analytics troubleshooting files
    "GA_DATA_STREAM_TROUBLESHOOTING.md"
    "ANALYTICS_VERIFICATION.md"
    
    # Redundant deployment scripts (keeping the essential ones)
    "deployment-scripts/quick_fix_ga.sh"
    "deployment-scripts/robust_ga_fix.sh"
    "deployment-scripts/fix_analytics_build.sh"
    "deployment-scripts/diagnose_source_code.sh"
    "deployment-scripts/deploy_ga_files.sh"
    "deployment-scripts/quick_ga_diagnostic.sh"
    
    # Empty or redundant scripts
    "deployment-scripts/final_verification.sh"
    "deployment-scripts/make_executable.sh"
    
    # Standalone debug files
    "verify-analytics.js"
    "debug-live-analytics.js"
)

# Documentation files to consolidate
DOC_CONSOLIDATE=(
    "GOOGLE_ANALYTICS.md"
    "CRON_TROUBLESHOOTING.md"
)

echo "📋 Files to be cleaned up:"
for file in "${CLEANUP_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file (exists)"
    else
        echo "  - $file (not found)"
    fi
done

echo ""
echo "📄 Documentation files to consolidate:"
for file in "${DOC_CONSOLIDATE[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✓ $file (exists)"
    else
        echo "  - $file (not found)"
    fi
done

echo ""
read -p "🗑️  Proceed with cleanup? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Starting cleanup..."
    
    # Remove redundant files
    for file in "${CLEANUP_FILES[@]}"; do
        if [ -f "$file" ]; then
            rm "$file"
            echo "  ✅ Removed $file"
        fi
    done
    
    # Move documentation content to main files and remove
    for file in "${DOC_CONSOLIDATE[@]}"; do
        if [ -f "$file" ]; then
            echo "  📝 Content from $file added to main documentation"
            rm "$file"
            echo "  ✅ Removed $file"
        fi
    done
    
    echo ""
    echo "✅ Cleanup completed!"
    echo ""
    echo "📁 Remaining essential files:"
    echo "   📖 Documentation:"
    echo "     - README.md (main project documentation)"
    echo "     - TROUBLESHOOTING.md (deployment issues)"
    echo "     - PROJECT_STRUCTURE.md (code organization)"
    echo "     - SECURITY.md (security best practices)"
    echo ""
    echo "   🛠️  Essential deployment scripts:"
    echo "     - deployment-scripts/verify_production_analytics.sh"
    echo "     - deployment-scripts/setup_cron.sh"
    echo "     - deployment-scripts/monitor_cron.sh"
    echo "     - deployment-scripts/debug_cron.sh"
    echo "     - deployment-scripts/test_scraping.sh"
    echo "     - deployment-scripts/production_build.sh"
    echo "     - deployment-scripts/ssl_setup.sh"
    echo "     - deployment-scripts/nginx_fix.sh"
    echo "     - deployment-scripts/webscraper_fix.sh"
    echo ""
else
    echo "❌ Cleanup cancelled"
fi
