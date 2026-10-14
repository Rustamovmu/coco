// TypeScript emits server code; Express also needs its public files and EJS views.
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
for (const directory of ["public", "views"]) {
  fs.cpSync(path.join(root, "src", directory), path.join(root, "dist", directory), { recursive: true });
}
console.log("Copied public assets and EJS views into dist.");
