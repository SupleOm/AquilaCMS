#!/bin/bash
# Check if the Node.js server is running
if curl -s http://localhost:3000 | grep -q "Aquila"; then
  echo "Application is running successfully."
  exit 0
else
  echo "Application failed to start."
  exit 1
fi
