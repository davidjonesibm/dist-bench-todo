#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PB_DIR="$SCRIPT_DIR/../pocketbase"
PB_BIN="$PB_DIR/pocketbase"

if [ ! -f "$PB_BIN" ]; then
  echo "PocketBase binary not found. Downloading..."
  
  # Detect OS and architecture
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  ARCH=$(uname -m)
  
  if [ "$ARCH" = "arm64" ]; then
    ARCH="arm64"
  else
    ARCH="amd64"
  fi
  
  if [ "$OS" = "darwin" ]; then
    PLATFORM="darwin"
  elif [ "$OS" = "linux" ]; then
    PLATFORM="linux"
  else
    echo "Unsupported OS: $OS"
    exit 1
  fi
  
  VERSION="0.22.20"
  URL="https://github.com/pocketbase/pocketbase/releases/download/v${VERSION}/pocketbase_${VERSION}_${PLATFORM}_${ARCH}.zip"
  
  cd "$PB_DIR"
  curl -L -o pocketbase.zip "$URL"
  unzip -o pocketbase.zip pocketbase
  rm pocketbase.zip
  chmod +x pocketbase
  echo "PocketBase downloaded successfully!"
else
  echo "PocketBase binary already exists."
fi

echo ""
echo "=== SETUP COMPLETE ==="
echo ""
echo "Next steps:"
echo "1. Start PocketBase:  cd pocketbase && ./pocketbase serve --dev"
echo "2. Open the Admin UI: http://127.0.0.1:8090/_/"
echo "3. Create an admin account"
echo "4. The 'todos' collection will be created automatically via migrations"
echo "5. Update .env with your admin credentials"
echo ""
