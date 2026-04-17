# polymarket-clob-proxy

Transparent HTTPS proxy that forwards requests to Polymarket's CLOB API (`clob.polymarket.com`).

## Why

Goldsky Compose tasks run in a Deno runtime with a restricted network allowlist. `clob.polymarket.com` is not on the allowlist, so Compose tasks can't call the Polymarket CLOB SDK directly. This proxy bridges that gap.

Used by the [bot-composer](https://github.com/endlesssky/bot-composer) copy-trader template. The proxy URL is hardcoded so anyone forking that template can run it without extra infrastructure.

## Deploy

```bash
fly launch --no-deploy   # first time only
fly deploy
```

## How it works

Every request to this service is forwarded 1:1 to `clob.polymarket.com`, preserving the path, query string, method, headers (minus Fly-specific ones), and body. The response is streamed back unchanged.

No auth on this proxy — Polymarket's own auth (API key + EIP-712 signatures) still applies, and those travel in the request body/headers untouched.

## Health

```
GET /_health → 200 "ok"
```
