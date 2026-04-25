#!/usr/bin/env node
/**
 * Hotfix Debug Helper - Git Archaeology Script
 *
 * Finds recent commits related to specific files/patterns
 * Usage: node find-related-commits.js <pattern> [limit]
 */

import { execSync } from "child_process";

const pattern = process.argv[2] || "";
const limit = parseInt(process.argv[3] || "20", 10);

if (!pattern) {
	console.log("Usage: node find-related-commits.js <pattern> [limit]");
	console.log("  pattern  - File path, function name, or keyword to search");
	console.log("  limit    - Number of commits to show (default: 20)");
	process.exit(1);
}

function run(cmd) {
	try {
		return execSync(cmd, { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 });
	} catch (e) {
		return "";
	}
}

console.log(`\n🔍 Searching for commits related to: "${pattern}"\n`);
console.log("=".repeat(70));

// 1. Recent commits touching files matching pattern
console.log('\n📁 Recent commits to files containing "' + pattern + '":\n');
const fileCommits = run(
	`git log --oneline -${limit} --all -- "*${pattern}*" 2>/dev/null || git log --oneline -${limit} --all -S "${pattern}"`,
);
if (fileCommits.trim()) {
	console.log(fileCommits);
} else {
	console.log("(none found)");
}

// 2. Recent commits mentioning the pattern
console.log('💬 Commits mentioning "' + pattern + '":\n');
const textCommits = run(
	`git log --oneline -${limit} --all --grep="${pattern}" 2>/dev/null`,
);
if (textCommits.trim()) {
	console.log(textCommits);
} else {
	console.log("(none found)");
}

// 3. Changes to function/class name
console.log('🔧 Changes to code containing "' + pattern + '":\n');
const codeCommits = run(
	`git log -${limit} --all -p -S "${pattern}" -- "*.ts" "*.js" "*.tsx" "*.jsx" 2>/dev/null | grep -E "^commit [a-f0-9]" | head -20`,
);
if (codeCommits.trim()) {
	console.log(codeCommits);
} else {
	console.log("(none found)");
}

// 4. Show diff for recent commits
console.log("\n📋 Last 3 commits with files matching pattern:\n");
const recentFiles = run(
	`git log --oneline -${limit} --all --name-only -- "*${pattern}*" 2>/dev/null | head -80`,
);
if (recentFiles.trim()) {
	console.log(recentFiles);
} else {
	console.log("(none found)");
}

console.log("=".repeat(70));
console.log("\n💡 To see what changed in a commit: git show <sha> --stat\n");
