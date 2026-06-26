# ITravel_54 — Cache-Busted Fixed Build

Build: `itravel54-fixed-20260626-001`

This package keeps the latest fixes and also resets the service-worker cache so the phone/PWA stops loading an old version.

Included:
- CRV garage option
- Mobile garage alignment fixes
- Route button row fix
- Nearby removed from the actual store-panel template
- 2x2 readable travel/weather cards
- Cache-busting service worker

## Upload
Upload all files and folders from this ZIP into the root of your GitHub repo.

## After Upload
On the phone:
1. Open the GitHub Pages URL in Chrome.
2. Tap the browser menu.
3. Tap reload once or twice.
4. If the installed app still looks old, remove the app shortcut and install it again from Chrome.

The new `sw.js` clears older app caches automatically.