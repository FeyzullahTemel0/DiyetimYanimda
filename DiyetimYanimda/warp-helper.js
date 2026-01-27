#!/usr/bin/env node

/**
 * Warp Helper - Auto-detect IP and update env files
 * Usage: node warp-helper.js
 * 
 * This script detects your machine's local IP (when Warp is active) and updates
 * both frontend and backend .env files to use that IP instead of localhost.
 * Run before starting dev servers when Warp VPN is enabled.
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function updateEnvFile(filePath, ip) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${filePath} not found, skipping.`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Update REACT_APP_BACKEND_URL
  if (content.includes('REACT_APP_BACKEND_URL')) {
    content = content.replace(
      /REACT_APP_BACKEND_URL=.*/,
      `REACT_APP_BACKEND_URL=http://${ip}:5000`
    );
  }
  
  // Update FRONTEND_URL
  if (content.includes('FRONTEND_URL')) {
    content = content.replace(
      /FRONTEND_URL=.*/,
      `FRONTEND_URL=http://${ip}:3000`
    );
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Updated ${filePath}`);
}

const rootDir = path.resolve(__dirname);
const frontendEnv = path.join(rootDir, 'frontend', '.env');
const backendEnv = path.join(rootDir, 'backend', '.env');

const localIP = getLocalIP();
console.log(`\n🌐 Local IP detected: ${localIP}\n`);

if (process.argv[2] === '--localhost') {
  console.log('Using localhost mode (Warp disabled)...\n');
  updateEnvFile(frontendEnv, 'localhost');
  updateEnvFile(backendEnv, 'localhost');
} else {
  updateEnvFile(frontendEnv, localIP);
  updateEnvFile(backendEnv, localIP);
}

console.log(`\n🚀 Ready to start! Frontend will connect to http://${process.argv[2] === '--localhost' ? 'localhost' : localIP}:5000\n`);
