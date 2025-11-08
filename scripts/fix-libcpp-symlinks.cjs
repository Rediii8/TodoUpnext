#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

const CANDIDATE_FOLDERS = [
  path.join(root, "node_modules"),
  path.join(root, "apps", "native", "android"),
];

const TARGET_BASENAME = "libc++_shared.so";
let replacedCount = 0;

const seen = new Set();

function fixSymlink(filePath) {
  try {
    const stats = fs.lstatSync(filePath);
    if (!stats.isSymbolicLink() && stats.nlink <= 1) {
      return;
    }

    const data = fs.readFileSync(filePath);
    fs.unlinkSync(filePath);
    fs.writeFileSync(filePath, data);
    replacedCount += 1;
  } catch (error) {
    console.warn(`Failed to replace symlink at ${filePath}: ${error.message}`);
  }
}

function walk(dir) {
  if (seen.has(dir)) return;
  seen.add(dir);

  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    return;
  }

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath);
      continue;
    }

    if (entry.isSymbolicLink()) {
      try {
        const targetStats = fs.statSync(entryPath);
        if (targetStats.isDirectory()) {
          walk(entryPath);
          continue;
        }
      } catch (error) {
        // Ignore broken symlinks when recursing.
      }
    }

    if (entry.name === TARGET_BASENAME) {
      fixSymlink(entryPath);
    }
  }
}

for (const folder of CANDIDATE_FOLDERS) {
  walk(folder);
}

console.log(`Replaced ${replacedCount} libc++_shared.so symlinks with regular files.`);
