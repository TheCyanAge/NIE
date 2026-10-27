# NIE search gateway

This is what makes web search work in NIE **straight after install, with nothing for the writer to set up**.

Why it exists: a search key put inside the installer (or this repository) can be taken out by anyone who downloads it, and every search they run is billed to you. So NIE does not carry a key. It carries only this service's **address**, which is not a secret. The key lives here, on a server, as a secret nobody can read back.

What happens when a writer uses it: NIE sends the words of one question (at most 24 words) and a random install code to this service. This service asks the search provider you chose, using your key, and sends back a short list of results. The writer's manuscript, project and earlier messages are never sent. This service stores and logs nothing about questions.

## Deploy it (about ten minutes, one time)

You need a free Cloudflare account and a key for one search service (Brave Search, Tavily or Serper).

1. In a terminal, in this folder: `cd services/search-gateway`
2. Sign in to Cloudflare: `npx wrangler login`
3. Choose your search provider in `wrangler.toml` (`SEARCH_PROVIDER = "brave"`, `"tavily"` or `"serper"`).
4. Put your key in as a **secret** (it asks you to paste it; it is not written to any file): `npx wrangler secret put SEARCH_API_KEY`
5. Set a daily cap so the worst day costs what you accept: uncomment `DAILY_CAP` in `wrangler.toml` and choose a number. **Check your provider's current pricing and free allowance first**; this file does not state any.
6. Deploy: `npx wrangler deploy`. It prints the address, like `https://nie-search-gateway.your-name.workers.dev`.
7. Tell the installer builds about it: in GitHub, open the repository's **Settings > Secrets and variables > Actions > Variables** and add a variable named `NIE_SEARCH_GATEWAY_URL` with that address. (A variable, not a secret: the address is public.)
8. Run the `windows-release` workflow again. That build now has the built-in search.

Never paste the search key into a file in this repository, an issue, or a chat that is saved with it.

## Check that it works

`curl -H "X-NIE-Install: test-install-0001" "https://YOUR-ADDRESS/search?q=how+tall+is+the+eiffel+tower"` should print a short list of results as JSON.

## What protects your bill

| Protection | Default | Setting |
| --- | --- | --- |
| Searches per install code per minute | 6 | `PER_INSTALL_PER_MIN` |
| Searches per install code per day | 60 | `PER_INSTALL_PER_DAY` |
| Searches per network address per minute | 20 | `PER_IP_PER_MIN` |
| Searches per network address per day | 200 | `PER_IP_PER_DAY` |
| Searches per day for the whole service | 3000 | `DAILY_CAP` |
| Switch everything off at once | off | `DISABLED = "1"` |

An install code is a random number NIE makes the first time, not an account, so a determined person can make many of them. The per-address limits and the daily cap are what really bound the cost. When a limit is reached the writer is told "NIE's search is busy right now" and can add their own key in Settings.

To switch it off in an emergency without a new release: set `DISABLED = "1"` and run `npx wrangler deploy`; every NIE then says search is busy and carries on without it.

## Changing the key

Run `npx wrangler secret put SEARCH_API_KEY` again. Nothing in NIE changes; installed copies keep working.

## Honest limits

- It has been tested against fake search responses (`tests/search-gateway.test.js`), not against a deployed worker or a live search service.
- The limits are best-effort: Cloudflare may count slightly differently under heavy parallel use.
- Anyone can call this address directly. They can use up the daily cap but cannot see your key or exceed the cap.
