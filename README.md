# gallery-dl wasm
Easy-to-use gallery-dl GUI that runs in your browser, powered by WASM

- Easily deploys to Cloudflare Workers.
- Most processing is performed in the browser using WASM, so the server script simply proxies requests to avoid CORS errors. The server-side script is ultra-lightweight and not subject to Cloudflare Workers' CPU time limitations.
- Seamlessly saves downloaded files locally using the File System Access API.
- Customizable gallery-dl configuration. Supports downloads from sources that require authentication.

## Deploy
```bash
pnpm install
pnpm build

# Deplot to Cloudflare Workers with wrangler
export CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
export CLOUDFLARE_API_TOKEN=super_secret_token
pnpm run deploy
```
