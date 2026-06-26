# ITravel_54 — Service Worker Nuke Build

This build is for clearing the stale app/browser cache problem.

It:
- unregisters all service workers for this site
- deletes all browser caches for this site
- blocks service-worker re-registration
- includes a visible green badge: `ITravel_54 SW NUKED BUILD`

## Upload
Upload the CONTENTS of this ZIP to the repo root.

## After upload on PC
1. Open: `https://jwkinc.github.io/ITravel_54/index.html?force=1`
2. Press Ctrl+F5.
3. You should see a green badge in the lower-left.

## After upload on Android
1. Delete/remove the installed ITravel_54 app icon.
2. Chrome → Settings → Site settings → All sites → `jwkinc.github.io` → Clear & reset.
3. Open `https://jwkinc.github.io/ITravel_54/index.html?force=1` in Chrome.
4. Reload once.
5. Reinstall/add to home screen after it loads correctly.