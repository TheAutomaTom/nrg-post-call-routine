// Cross-platform Cloudflare build helper for Vite
// Ensures the required VITE_ env vars are set for production

process.env.VITE_PROXY_TAG = process.env.VITE_PROXY_TAG || "/proxy";
process.env.VITE_BASE_URL = process.env.VITE_BASE_URL || "/";

console.log(`Building for Cloudflare Workers...`);
console.log(` - VITE_PROXY_TAG = ${process.env.VITE_PROXY_TAG}`);
console.log(` - VITE_BASE_URL  = ${process.env.VITE_BASE_URL}`);

const { build } = await import("vite");

try {
  await build();
  console.log("Build complete. Output in ./dist");
} catch (err) {
  console.error("Vite build failed:", err);
  process.exit(1);
}
