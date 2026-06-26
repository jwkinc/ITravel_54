# ITravel_54 — Safe Recovery No-Service-Worker Build

Use this build to recover from the spinning/loading issue.

It:
- removes service-worker registration from the page
- uses a quiet pass-through sw.js
- clears old caches without forcing reloads
- shows a blue badge: `ITravel_54 SAFE BUILD`
- keeps the latest app fixes, including CRV and Nearby template removal

## Upload
Upload the CONTENTS of this ZIP to the repo root.

## Open
After GitHub Pages deploys, open:

https://jwkinc.github.io/ITravel_54/index.html?safe=1

Hard refresh once on PC with Ctrl+F5.