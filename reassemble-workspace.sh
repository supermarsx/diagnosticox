#!/bin/bash
# Reassemble DiagnosticoX Workspace Archive
# Run this script after downloading all workspace-part-* files

echo "🏥 DiagnosticoX Workspace Reassembly Script"
echo "=========================================="

# Check if all parts are present
if [ ! -f "workspace-part-aa" ] || [ ! -f "workspace-part-ab" ] || [ ! -f "workspace-part-ac" ] || [ ! -f "workspace-part-ad" ]; then
    echo "❌ Error: Missing workspace parts!"
    echo "Please ensure you have all 4 parts:"
    echo "  - workspace-part-aa (30MB)"
    echo "  - workspace-part-ab (30MB)"
    echo "  - workspace-part-ac (30MB)"
    echo "  - workspace-part-ad (14MB)"
    exit 1
fi

echo "✅ All workspace parts found!"
echo "📊 Parts information:"
ls -lah workspace-part-*

echo ""
echo "🔄 Reassembling workspace archive..."

# Reassemble the files
cat workspace-part-aa workspace-part-ab workspace-part-ac workspace-part-ad > complete-workspace-root.tar.gz

if [ $? -eq 0 ]; then
    echo "✅ Reassembly completed successfully!"
    echo "📦 Archive created: complete-workspace-root.tar.gz"
    echo "📏 Archive size: $(du -h complete-workspace-root.tar.gz | cut -f1)"
    echo ""
    echo "🚀 To extract your workspace:"
    echo "  tar -xzf complete-workspace-root.tar.gz"
    echo "  cd workspace"
    echo "  ls -la"
    echo ""
    echo "🏥 Main application is in: diagnosticox/"
    echo "📚 Documentation is in: docs/"
    echo "🔬 Research data is in: data/"
    echo ""
    echo "Happy coding! 🎉"
else
    echo "❌ Reassembly failed! Please try again."
    exit 1
fi