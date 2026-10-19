// Dependency-free syntax check for every backend CommonJS file.
// Usage: npm run check   (also used by CI, so it must not need `npm install`)
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SKIP_DIRS = new Set(["node_modules", ".git", "frontend", "dist", "coverage", ".github"]);

const walk = (dir, files = []) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith(".") && entry.isDirectory()) continue;
        if (entry.isDirectory()) {
            if (SKIP_DIRS.has(entry.name)) continue;
            walk(path.join(dir, entry.name), files);
        } else if (entry.name.endsWith(".js") && !entry.name.endsWith(".jsx")) {
            files.push(path.join(dir, entry.name));
        }
    }
    return files;
};

const files = walk(ROOT).sort();
let failed = 0;

for (const file of files) {
    try {
        execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
        console.log(`  ok    ${path.relative(ROOT, file)}`);
    } catch (err) {
        failed++;
        console.error(`  ERROR ${path.relative(ROOT, file)}`);
        console.error(String(err.stderr || err.message).trim());
    }
}

console.log(`\nChecked ${files.length} file(s), ${failed} with errors.`);
process.exit(failed ? 1 : 0);
