# gallery-dl wasm
Easy-to-use gallery-dl GUI that runs in your browser, powered by WASM

- Easily deploys to Cloudflare Workers.
- Most processing is performed in the browser using WASM, so the server script simply proxies requests to avoid CORS errors. The server-side script is ultra-lightweight and not subject to Cloudflare Workers' CPU time limitations.
- Seamlessly saves downloaded files locally using the File System Access API.
- Customizable gallery-dl configuration. Supports downloads from sources that require authentication.

## Deploy

> [!WARNING]
> Security Considerations: Users can proxy to the domains used by gallery-dl without authentication.  
This is relatively secure because the proxy runs on Cloudflare Workers and only allows necessary domains, but for better security we recommend configuring it to require authentication.  
> You can easily do this using Cloudflare Access: https://developers.cloudflare.com/changelog/2025-10-03-one-click-access-for-workers/

```bash
pnpm install
pnpm build

# Deplot to Cloudflare Workers with wrangler
export CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
export CLOUDFLARE_API_TOKEN=super_secret_token
pnpm run deploy
```

