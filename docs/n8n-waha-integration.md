# WhatsApp via n8n → WAHA (self-hosted) — state & remaining work

Status as of **2026-07-16**: **the chain is built and proven end to end.** DNS, TLS,
the nginx vhost, the n8n workflow and a linked WAHA session all work; a public
`POST https://n8n.eiden-group.com/webhook/whatsapp-send` sends a real WhatsApp message
and returns `{"ok":true,"waId":…}`.

**It is live in local dev only — production is still on Meta, deliberately.** See
"Before going to production" below. Setting `N8N_WEBHOOK_URL` in Vercel is the single
switch that flips it, and it should not be flipped yet.

## ⏰ MANUAL DEADLINE — both certs expire in October 2026, nothing renews them

The owner opted not to automate renewal (2026-07-16), so this **will not fix itself**:

| Cert | Expires | Why it won't renew |
|---|---|---|
| `n8n.eiden-group.com` | **2026-10-14** | Its renewal config is correct (`webroot`), but **nothing runs `certbot renew`** on a schedule. |
| `files.` + `ws.` (SAN) | **2026-10-12** | Config says `authenticator = nginx`, impossible here — nginx is containerised, certbot isn't. Pre-existing crm-edien problem. |

When `n8n.` expires, Gestio CRM's WhatsApp sending stops with a TLS error. When
`files.`/`ws.` expires, **crm-edien breaks**. Renew `n8n.` manually with:

```
docker run --rm -v docker_certbot-certs:/etc/letsencrypt -v docker_certbot-www:/var/www/certbot \
  certbot/certbot renew --cert-name n8n.eiden-group.com --webroot -w /var/www/certbot
docker exec eiden-nginx nginx -s reload      # required — renewal alone won't reload nginx
```

To automate later (no root needed — `deploy` is in the `docker` group, and its own
crontab is empty): put the two commands above in a weekly `crontab -e` entry.

## Who is who (confirmed by the owner 2026-07-16 — don't re-derive this)

- This repo (`dashboard-demo`) is the product **Gestio CRM**. It is **Supabase**-backed
  and **deploys to Vercel**. The repo name is not the product name.
- **`crm-edien` on the VPS is a different, unrelated project.** Ignore it as a
  codebase — but *not* as infrastructure: it owns the `eiden-nginx` container, the
  `eiden.conf` vhosts, the `docker_eiden-net` network and the certbot volumes. The
  n8n/WAHA stack is a guest on all of it, so exposing n8n means editing **crm-edien's**
  nginx config and cert. Break those and you take `files.`/`ws.` down with them.
- **Gestio CRM does not run on the VPS.** That is *why* this needs public DNS + TLS
  at all: a same-box app could just call `http://eiden-n8n:5678` over the docker
  network and skip steps 2–4 entirely.
- **Vercel egress IPs are dynamic**, so n8n cannot be locked down by IP allowlist.
  The `X-Webhook-Secret` shared secret is the *only* thing standing between the
  public internet and a "send WhatsApp to anyone" endpoint. Treat it accordingly.
- `N8N_WEBHOOK_URL` / `N8N_WEBHOOK_SECRET` must be set in **Vercel project env vars**
  (all environments that should use the n8n path), not just a local `.env`.

## The contract (already coded — build n8n to match this)

`src/lib/server-whatsapp.ts` → `sendWhatsAppMessage()` prefers n8n whenever
`N8N_WEBHOOK_URL` is set, else falls back to the Meta Cloud API.

Request it sends:

```
POST  $N8N_WEBHOOK_URL
Content-Type: application/json
X-Webhook-Secret: $N8N_WEBHOOK_SECRET     # omitted if the secret is empty
{ "phone": "212600000000", "content": "..." }
```

### Sending a document (PDF) — added 2026-07-16

Add an optional `document`. Present → WAHA `sendFile` with `content` as the
**caption**, so the file and the text arrive as **one** WhatsApp, not two.
Absent → plain `sendText`. Both verified over public HTTPS.

```
POST https://n8n.eiden-group.com/webhook/whatsapp-send
Content-Type: application/json
X-Webhook-Secret: <secret>
{
  "phone": "0691422346",                       // 06… or 212… both fine
  "content": "Reçu de paiement ci-joint",      // becomes the caption
  "document": {
    "url": "https://files.eiden-group.com/…/recu.pdf",   // REQUIRED
    "filename": "recu-2026-07.pdf",            // optional, default document.pdf
    "mimetype": "application/pdf"              // optional, default application/pdf
  }
}
→ 200 {"ok":true,"waId":"3EB0…"}
```

- ⚠️ **`url` must be fetchable by the WAHA container itself** — WAHA downloads it
  server-side. `blob:`, `data:`, `localhost` and browser-only URLs will not work.
  It must be public (or reachable on `docker_eiden-net`).
- ⚠️ **WAHA's `file` is an OBJECT** — `{mimetype, url, filename}`. Passing `file`
  as a bare URL string with `filename` at the top level is wrong and fails; that
  mistake was in a draft workflow and is the easiest one to make here.
- The app mirrors this: `sendWhatsAppMessage(phone, content, document?)`. On the
  **Meta** path a document returns an explicit error rather than sending the
  caption alone — a silent text-only send would look like success while dropping
  the file.
- **Nothing in this repo generates a PDF** (no pdf library, no url column —
  `payments.receipt` is a receipt *number*). The caller must supply a hosted URL.

- `phone` is **digits only** — `phone.replace(/\D/g, "")`, so no `+`, no `@c.us`.
  WAHA wants a `chatId`, so n8n must append `@c.us` itself.
- Response is parsed as JSON, with a `.catch(() => ({}))` fallback.
- Treated as **failure** when `!res.ok` **or** `body.ok === false`; the error shown
  is `body.error`, else `n8n HTTP <status>`.
- On success it reads the message id from `body.waId ?? body.messageId ?? body.id`.
- Gotcha: an **empty 200** counts as success (`body.ok` is `undefined`, not `false`)
  and just yields no `waId`. A bare "Respond to Webhook" will silently look fine.

Callers `sendClientMessage` / `sendBroadcast` log every attempt to the
`whatsapp_messages` table, storing `wa_message_id: result.waId ?? ""`.

## Why it's dormant

The real `.env` has **no `N8N_WEBHOOK_URL`** — only the Meta vars
(`WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, …). So today every message
still goes out through Meta. Setting that one var flips the path over.

Both `src/lib/server-whatsapp.ts` and `.env.example` are **modified but not
committed** — the work exists only in the working tree.

## VPS side (76.13.58.6 / srv1826691)

Running containers (verified 2026-07-16):

| Container | Image | Bound |
|---|---|---|
| `eiden-n8n` | `docker.n8n.io/n8nio/n8n:latest` | `127.0.0.1:5678` — localhost only |
| `eiden-waha` | `devlikeapro/waha:latest` | `127.0.0.1:3000` — localhost only |
| `eiden-nginx` | `docker-nginx` | `0.0.0.0:80`, `0.0.0.0:443` |

Blockers found:

1. **`n8n.eiden-group.com` has no DNS record** — it does not resolve at all.
   (`files.eiden-group.com` correctly returns `76.13.58.6`.) The URL in
   `.env.example` therefore points at nothing.
2. **No nginx vhost for n8n.** `eiden-nginx` only serves `server_name`
   `files.eiden-group.com` and `ws.eiden-group.com`.
3. n8n is bound to loopback, so nothing outside the box can reach it.

## Remaining steps

1. ~~**Restore SSH first**~~ — **done**, port 22 answers as of 2026-07-16.
   (If it recurs: the box stays up on 3389/RDP, and it's sshd specifically. Use the
   hPanel Browser Terminal, `sudo systemctl restart ssh`, and confirm `ssh.socket`
   hasn't crept back on — the persistent `ssh.service` is deliberate.)
2. **DNS**: add an A record `n8n.eiden-group.com → 76.13.58.6`. **Needs a human in
   hPanel** (Hostinger nameservers, no API token on the box). *Blocking everything
   below.*
3. ~~**TLS cert**~~ — **done 2026-07-16**. A **standalone** cert for
   `n8n.eiden-group.com` (owner's call: leave `files.`/`ws.` untouched rather than
   expand the SAN cert). ECDSA, expires **2026-10-14**, in the `docker_certbot-certs`
   volume beside the existing one. Reproduce with:

   ```
   docker run --rm \
     -v docker_certbot-certs:/etc/letsencrypt \
     -v docker_certbot-www:/var/www/certbot \
     certbot/certbot certonly --webroot -w /var/www/certbot \
     -d n8n.eiden-group.com --cert-name n8n.eiden-group.com --key-type ecdsa \
     --non-interactive --agree-tos --register-unsafely-without-email
   ```

   The `/.well-known/acme-challenge/` webroot already worked for the new hostname
   before any nginx change, because the port-80 block is nginx's **default server** —
   so the cert could be issued first, avoiding the ordering trap below entirely.
   ⚠️ **This cert has no auto-renewal either** — its own renewal config is correct
   (`webroot`, unlike files./ws.'s broken `nginx` authenticator), but nothing runs
   `certbot renew` on a schedule. It dies 2026-10-14 unless a cron is added.
4. ~~**nginx vhost**~~ — **done**. Appended to `~/crm-edien/docker/nginx/sites/eiden.conf`
   (bind-mounted into `eiden-nginx`; `.bak` timestamped copy alongside), and
   `n8n.eiden-group.com` added to the port-80 `server_name`. Verified: n8n serves
   HTTP 200 on its own cert, and `files.`/`ws.` still serve theirs unchanged.
   - ⚠️ Order matters: a 443 block naming a cert that doesn't exist yet makes nginx
     **fail to reload and take `files.`/`ws.` down with it**. Cert first, always.
   - ⚠️ `proxy_pass http://127.0.0.1:5678` would hit the *nginx container's own*
     loopback. Target `http://eiden-n8n:5678` over `docker_eiden-net`.
   - Follow the existing blocks' `resolver 127.0.0.11 valid=30s;` + `set $backend "…";`
     idiom — with a literal `proxy_pass`, nginx refuses to start when the upstream
     container is down, which would take the whole box's web presence with it.
   - Websocket upgrade headers are needed for the n8n editor UI; `X-Forwarded-*` are
     needed because the container runs with `N8N_PROXY_HOPS=1`.
   - `docker exec eiden-nginx nginx -t` **before** `nginx -s reload`. Never reload blind.
5. ~~**n8n `WEBHOOK_URL` env**~~ — **already correct** in `~/n8n-stack/docker-compose.yml`.
6. ~~**Link a WhatsApp account in WAHA**~~ — **done 2026-07-16**. Session **`n8ndemo`**,
   status `WORKING`, linked to `212691422346@c.us`, `store.fullSync: false`.
   - **Use the pairing code, not the QR.** The QR is unscannable through RDP
     compression and dies fast (60s for the first, 20s each after, 6 max → session
     goes `FAILED`). `POST /api/n8ndemo/auth/request-code {"phoneNumber":"212…"}`
     returns an 8-char code to type into WhatsApp → Linked devices → Link a device →
     *"Link with phone number instead"*. Works every time; no camera involved.
   - Create sessions **via the API**, not the dashboard — the dashboard's Name field
     is easy to leave blank, which silently auto-generates `session_01kx…`. The
     workflow hardcodes the name, so it must be predictable.
   - The dashboard's Name/Account **filter row** hides sessions that do exist and
     shows "No sessions found". Check `GET /api/sessions` before believing it.
   - The linked phone is swappable without touching anything downstream: delete the
     session, recreate it as `n8ndemo`, pair the new phone. The name is the contract.
   - ⚠️ `212691422346` is a **personal number, used for testing only**. WAHA is an
     unofficial client; WhatsApp bans numbers for bulk/unsolicited sending, and
     `sendBroadcast` is exactly that pattern. Move to a dedicated SIM before real use.
     A number cannot be on the Meta Cloud API and WAHA at the same time.
7. ~~**Build the workflow**~~ — **done 2026-07-16**. Lives in the repo at
   `docs/n8n-whatsapp-send.workflow.json` (id `gestioWhatsappSend`), imported and
   **active**. Verified against all three paths on `http://localhost:5678`:

   | Request | Result |
   |---|---|
   | no secret | `401 {"ok":false,"error":"unauthorized"}` |
   | wrong secret | `401 {"ok":false,"error":"unauthorized"}` |
   | correct secret, phone `0691422346` | `200 {"ok":true,"waId":"3EB047…"}` + message delivered |

   Hard-won details — **do not "simplify" these away**:

   - **`waId` is at `key.id`, nowhere else.** WAHA's `sendText` returns
     `{"key":{"id":"3EB0…","remoteJid":…},"status":"PENDING"}` — there is no
     top-level `id`/`waId`/`messageId`. The app reads
     `body.waId ?? body.messageId ?? body.id`, so **forwarding WAHA's response
     verbatim yields `ok:true` with an empty `wa_message_id`** — silent data loss.
     The Respond node maps it explicitly.
   - **`$env` is BLOCKED by default** (n8n 2.30.5) — the workflow references
     `$env.N8N_WEBHOOK_SECRET` / `$env.WAHA_API_KEY` so the JSON stays secret-free
     and committable. That needs **`N8N_BLOCK_ENV_ACCESS_IN_NODE=false`** in the
     compose, which is now set. Without it the log says `access to env vars denied`
     and — dangerously — **the webhook returns an empty HTTP 200**, which the app
     scores as success. If sends ever start silently doing nothing, check this first.
   - **Phone normalisation lives in the workflow**, not the app:
     `phone.startsWith('0') ? '212' + phone.slice(1) : phone`, then `+ '@c.us'`.
     One place to fix, no data migration. Numbers stored as `06…` work.
   - **`n8n update:workflow --active=true` does not take effect until n8n restarts**
     ("Changes will not take effect if n8n is running"). Restart, or the webhook
     stays unregistered and every call 404s.
   - n8n stores workflows in **SQLite** (in the `n8n_data` volume), not Postgres.
     Imports need a top-level `"id"` or they fail on a NOT NULL constraint.
   - Re-import after editing:
     `docker cp wf.json eiden-n8n:/tmp/ && docker exec eiden-n8n n8n import:workflow --input=/tmp/wf.json && docker restart eiden-n8n`
8. **Set `N8N_WEBHOOK_URL` + `N8N_WEBHOOK_SECRET`** in the local `.env` *and* in
   **Vercel** project env vars (same secret in the n8n webhook node). Setting the
   URL is the switch that flips traffic off Meta — nothing else changes behaviour.
9. **Commit** `src/lib/server-whatsapp.ts` and `.env.example`.
10. **Test** one `sendClientMessage`, then verify a row lands in `whatsapp_messages`
    with a non-empty `wa_message_id` — that proves the response mapping, which the
    empty-200 gotcha above would otherwise hide.

## Before going to production — read this first

The chain works, but it is **wired to the owner's personal number** (`212691422346`),
linked purely to test. Do **not** set `N8N_WEBHOOK_URL` in Vercel until that changes.

- **WAHA is an unofficial WhatsApp client** (NOWEB = the WhatsApp Web protocol), not
  Meta's sanctioned Business API. WhatsApp bans numbers for bulk/unsolicited sending.
  The ban risk is driven mostly by **recipients reporting/blocking**, plus machine-shaped
  patterns: bursts, identical text to many people, messaging strangers.
- **`sendBroadcast` is exactly that pattern.** 1-to-1 messages to parents who expect
  them are low risk; blasting the client list from an unofficial client is not. Space
  sends out and vary the text if you use it.
- **Get a dedicated SIM** — one you can afford to lose. Losing a personal WhatsApp is
  not the same as losing this integration.
- **A number cannot be on the Meta Cloud API and WAHA at once.** Registering on one
  removes it from the other, so the dedicated SIM must not be your Cloud API number.
  Parents will see a different sender than they do today — a real product decision.
- **The tradeoff being made:** Meta's API cannot ban you for using it as intended;
  that protection is what you give up for independence from Meta.

**Switching the phone is cheap and touches nothing downstream:** delete the session,
recreate it as `n8ndemo`, pair the new phone. The workflow, the app and the env vars
all reference the *session name*, never the number. Then add `N8N_WEBHOOK_URL` +
`N8N_WEBHOOK_SECRET` to Vercel to go live.

## Proven working 2026-07-16 (public path, exactly what Vercel will send)

```
curl -X POST https://n8n.eiden-group.com/webhook/whatsapp-send \
  -H 'Content-Type: application/json' -H "X-Webhook-Secret: $SECRET" \
  -d '{"phone":"0691422346","content":"hello"}'

no secret      → 401 {"ok":false,"error":"unauthorized"}
correct secret → 200 {"ok":true,"waId":"3EB00F2590F79A90D4017B"}   + message delivered
```

The whole chain — public HTTPS → nginx → n8n → WAHA → WhatsApp — is verified end to
end. All that is left is pointing the app at it (step 8) and committing (step 9).

## Memory pressure — real, and NOT caused by a stray n8n

Linking the WAHA session took the box from ~995Mi available to **136Mi of 3.8G, with
no swap**. At that level the OOM killer is one spike away, and it may well pick
`eiden-postgres` — taking **crm-edien** down with it, not just this project.

Where the RAM actually goes (2026-07-16):

| Process | RSS | Verdict |
|---|---|---|
| `opencode` (as `deploy`) | **874 MB** | An AI coding agent left running. Not part of the stack. |
| `eiden-waha` (`node dist/main`) | 498 MB | The stack. Keep. |
| `mysqld` | **347 MB** | Nothing here uses MySQL — crm-edien is Postgres, Gestio is Supabase. Leftover. |
| `eiden-n8n` (`node …/n8n`) | 239 MB | The stack. Keep. |
| `firefox` | 272 MB | The RDP desktop browser. Transient. |
| `Xorg` + `xfdesktop` | ~280 MB | The RDP desktop itself. |

All seven containers together are only ~900MB. The pressure is from `opencode`
(874MB) + `mysqld` (347MB) ≈ **1.2G recoverable** — both need the owner's say-so, and
`mysqld` needs root. The RDP desktop + Firefox (~550MB) frees itself on logout.

**Adding swap is the durable fix** — a box running Postgres and a WhatsApp engine with
zero swap has no shock absorber at all. Needs root.

## Verified 2026-07-16 (was "unverified")

The stack is defined by **two** compose files, both owned by `deploy`:

- `~/crm-edien/docker/docker-compose.yml` — postgres, pgbouncer, file-server,
  ws-server, nginx. Owns the `docker_eiden-net` network and the certbot volumes.
- `~/n8n-stack/docker-compose.yml` — `eiden-n8n` + `eiden-waha`, joined to
  `docker_eiden-net` as an **external** network.

Settled facts:

- **SSH is back** — port 22 answers again; step 1 of the old list is done.
- **Docker network**: `docker_eiden-net`. *All seven* containers are on it, so
  `proxy_pass http://eiden-n8n:5678` will resolve. Follow the existing vhosts'
  pattern — `resolver 127.0.0.11 valid=30s;` plus `set $backend "http://…";` —
  or nginx refuses to start whenever the upstream container is down.
- **`deploy` is in the `docker` group**, so docker needs no sudo. Interactive
  `sudo` *does* need a password, so anything root-level needs a human.
- **n8n's own env is already correct** — `WEBHOOK_URL`,
  `N8N_EDITOR_BASE_URL`, `N8N_HOST` all point at `n8n.eiden-group.com`, and
  `N8N_PROXY_HOPS=1` / `N8N_SECURE_COOKIE=false` are set for life behind nginx.
  Old step 5 is **already done**.
- **THERE IS NO SECOND n8n. The "two instances" were always one.** This was the
  runbook's own claim and it is **false** — do not act on it. `ps` shows
  `deploy  node /usr/local/bin/n8n`, which *looks* host-level but is the
  `eiden-n8n` **container** seen from the host PID namespace. Proof:

  ```
  459351  node /usr/local/bin/n8n
    └─ 459265  tini -- /docker-entrypoint.sh   ← docker inspect eiden-n8n → 459265
        └─ 459219  containerd-shim-runc-v2 -namespace moby
  cgroup: /system.slice/docker-ba800f69….scope
  ```

  It reads as `deploy` because the n8n image runs as user `node` = UID 1000, which
  maps to `deploy` on the host; `/usr/local/bin/n8n` is the path *inside* the
  container. The `@n8n/task-runner` beside it is spawned by `N8N_RUNNERS_ENABLED=true`.
  The 495MB root `node dist/main` under `tini` is likewise **eiden-waha**, not a
  stray. **Killing any of these kills the live stack.** Check `/proc/<pid>/cgroup`
  before believing any process on this box is host-level.
- **WAHA needs an API key**: `WAHA_API_KEY` is set in `~/n8n-stack/.env`, so the
  n8n HTTP Request node must send `X-Api-Key`. Engine is `NOWEB`.
- **nginx vhosts are host-editable**: `/etc/nginx/conf.d` is bind-mounted from
  `~/crm-edien/docker/nginx/sites` (owned by `deploy`), so no rebuild is needed —
  edit `eiden.conf`, then `docker exec eiden-nginx nginx -s reload`.
- **DNS is at Hostinger** — `eiden-group.com` uses `ns1/ns2.dns-parking.com`, so
  the A record has to be added in hPanel; there's no API token on the box.

## Two new blockers found 2026-07-16

1. **WAHA has no session at all.** `GET /api/sessions` returns `[]`, so no
   WhatsApp account is linked. Even a perfect n8n workflow would fail at the last
   hop. Someone must create a session and **scan the QR from the phone that will
   send the messages** — this can't be automated away.
2. **The TLS cert's renewal looks broken, and it is the model for step 4.**
   The live cert is a **SAN cert for `files.` + `ws.`** (Let's Encrypt, ECDSA,
   expires **2026-10-12**), living in the `docker_certbot-certs` volume. But its
   `renewal/files.eiden-group.com.conf` says `authenticator = nginx` /
   `installer = nginx`, which **cannot work here** — nginx runs in a container and
   certbot doesn't. The host's `certbot.timer` is active but the host's
   `/etc/letsencrypt` has **no `renewal/` dir**, so the timer renews *nothing*.
   Net: the cert probably will not auto-renew, and there's no known-good mechanism
   to copy for `n8n.`. Resolve this before issuing — don't invent a second path.
   The `/.well-known/acme-challenge/` → `/var/www/certbot` webroot is already
   wired up in nginx, which makes a certbot **container** in webroot mode the
   likeliest correct answer for both problems.
