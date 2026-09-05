# ليلة كُتبت بالنور — Hekaya Studio

Open **index.html** in a modern browser. No server, installation, build step, or internet connection is needed.

## Personalize the story

Edit `weddingData` at the top of `js/script.js`. The couple's names, initials, wedding date, countdown, venue, city, and Instagram links update together. The date is interpreted in the visitor's local time; include a UTC offset in the date string if you need a single worldwide countdown instant.

Replace the Google Maps link in `index.html` with the venue's actual share link. The supplied link opens Google Maps as requested.

## Optional photographs

Add these files to `assets/` to replace the original artwork automatically:

- `hero-couple.jpg`
- `story-1.jpg`, `story-2.jpg`, `story-3.jpg`
- `gallery-1.jpg` through `gallery-6.jpg`

Portrait images work best for the hero and story. The gallery uses consistent 4:3 frames in two columns, or one column on mobile; keep the subject near the center when adding photographs. Captions sit below each frame. The bundled SVG still lifes remain visible when a photograph is absent. Missing optional files may appear in browser diagnostics without affecting the experience.

## Optional sound

Add `music.mp3`, `curtain.mp3`, and `chime.mp3` to `assets/`, then change `audioConfig.enabled` to `true` in `js/script.js`. Audio begins only after the opening gesture. The music control appears when audio is enabled, and missing audio files are handled gracefully. Use music you have permission to share.

## Interactions

- Tap or press Enter on the curtain monogram to begin.
- Scroll naturally to join the initials and explore the scenes.
- Select any gallery image. Arrow keys, navigation buttons, and swipes change images; Escape closes the gallery.
- RSVP responses are saved only on the current device when browser storage is available. No response is transmitted to the couple or to a server. Use “تعديل الرد” to change the local response.
- At the end, a few petals rise and the next chapter reveals itself.

Reduced motion follows the device preference. Animation pauses while the page is hidden. Bundled fonts are redistributed under their included SIL Open Font License files in `assets/fonts/`.

Built only with HTML5, CSS3, and vanilla JavaScript. The SVG artwork, fonts, and favicon are local assets.
