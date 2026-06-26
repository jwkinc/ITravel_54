# ITravel_54 — GitHub Working Build

This build keeps the full app source and fixes the current problems:

- Disables automatic geolocation on startup so GitHub/mobile does not sit on “locating”
- Keeps the garage background image
- Makes every garage selection the same size
- Adds/keeps the CRV garage option
- Makes mobile location pins tappable
- Moves header weather so it cannot sit behind the logo
- Removes Nearby
- Keeps route buttons together
- Uses a pass-through service worker with no reload loop or cache trap

## Upload

Upload the CONTENTS of this ZIP to the repository root, not the ZIP itself.

After upload:
1. Wait for GitHub Pages deployment to finish.
2. Open https://jwkinc.github.io/ITravel_54/
3. Hard refresh once on PC with Ctrl + F5.
4. On mobile, remove the old app icon, open the site in Chrome, then reinstall.