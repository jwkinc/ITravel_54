# ITravel_54 — CLEAN FIXED GitHub Build

This build was rebuilt cleanly instead of stacking patches.

What changed:
- Removed the old conflicting garage/layout/cache scripts.
- Kept one clean app script plus one final correction script.
- SAT displays as SATX.
- Location dropdown is compact and no longer duplicated inside the market tab row.
- Icons align to the right of the banner.
- Header does not sit on “locating…” while weather/location is slow.
- Nearby tab/card is removed.
- CRV is included in the Garage.
- Garage is compact, centered, and swipeable.
- Service worker is pass-through/self-removing, with no reload loop.

## Upload

Upload the CONTENTS of this ZIP to the repo root, not the ZIP itself.

After upload:
1. Wait for GitHub Pages deployment to complete.
2. Open https://jwkinc.github.io/ITravel_54/
3. Hard refresh once on PC with Ctrl + F5.
4. On mobile, remove the old installed icon, clear site data for jwkinc.github.io if needed, then reinstall.