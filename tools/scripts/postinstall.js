#!/usr/bin/env node
/**
 * Postinstall script for nstreamdown-workspace
 * Creates symlink for @nstudio/nstreamdown to enable Angular package builds
 */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distPath = path.join(rootDir, 'dist', 'packages', 'nstreamdown');
const symlinkDir = path.join(rootDir, 'node_modules', '@nstudio');
const symlinkPath = path.join(symlinkDir, 'nstreamdown');

console.log('Setting up @nstudio/nstreamdown symlink...');

// Ensure @nstudio directory exists
if (!fs.existsSync(symlinkDir)) {
  fs.mkdirSync(symlinkDir, { recursive: true });
  console.log('Created @nstudio directory in node_modules');
}

// Remove existing symlink if it exists
try {
  const stat = fs.lstatSync(symlinkPath);
  if (stat.isSymbolicLink() || stat.isDirectory()) {
    fs.unlinkSync(symlinkPath);
    console.log('Removed existing symlink');
  }
} catch (e) {
  // Path doesn't exist, which is fine
}

// Check if dist exists, if not create placeholder
if (!fs.existsSync(distPath)) {
  console.log('dist/packages/nstreamdown not found - will be created on first build');
  console.log('Run: npx nx build nstreamdown');

  // Create placeholder directory so symlink works
  fs.mkdirSync(distPath, { recursive: true });

  // Create minimal package.json placeholder
  const placeholderPackage = {
    name: '@nstudio/nstreamdown',
    version: '0.0.0-placeholder',
    main: 'index.js',
  };
  fs.writeFileSync(path.join(distPath, 'package.json'), JSON.stringify(placeholderPackage, null, 2));

  // Create empty index.js
  fs.writeFileSync(path.join(distPath, 'index.js'), '// Placeholder - run npx nx build nstreamdown\n');
}

// Create symlink
try {
  fs.symlinkSync(distPath, symlinkPath, 'dir');
  console.log(`✓ Created symlink: node_modules/@nstudio/nstreamdown -> dist/packages/nstreamdown`);
} catch (e) {
  console.error('Failed to create symlink:', e.message);
  process.exit(1);
}

console.log('Symlink setup complete!');
