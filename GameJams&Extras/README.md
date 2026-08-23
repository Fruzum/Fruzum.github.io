# Game Jams & Extras — content folder

This is where every entry in the "Game Jams & Extras" section on the site
comes from. Add a `.txt` file here, add its filename to `manifest.txt`, and
it shows up on the site automatically — no HTML or code editing needed.

## Adding a new entry

**1. Create a new `.txt` file inside `entries/`, named like this:**

```
YYYY-MM_Title-With-Hyphens.txt
```

- The year and month at the front control sort order — entries are shown
  newest first, based on this, not on where you put them in the manifest.
- Use hyphens instead of spaces in the title part of the filename (spaces
  in filenames are fine on most systems, but hyphens are safer for a
  website URL).
- Example: `2026-07_Kiwi-Game-Jam.txt`

**2. Add that exact filename as a new line in `manifest.txt`.**

Static sites like this one (hosted on GitHub Pages) can't automatically
"see" what files are in a folder — the manifest is a plain list telling
the site which files to load. This is the one manual step; everything
else is automatic.

**3. Fill in the file using the template below.**

## Entry file format

```
TITLE: Kiwi Game Jam
DATE_LABEL: Jul 2026
BLURB: Solo developer — full game with main menu and pause screen, built inside 48 hours.
LINK_TEXT: Play on itch.io
LINK_URL: https://fruzum.itch.io/quantum
MEDIA_URL: assets/kiwi-jam.gif
MEDIA_ALT: The main menu and first level of the jam build
===POPUP===
Whatever you want to show in the popup goes here. This can be as long as
you like, and is separate from the short blurb above.

## A heading

Regular paragraphs just need a blank line between them to separate.

- Bullet points
- work like this

Links use [this text](https://example.com), and images or gifs use
![alt text](https://example.com/image.gif) — the alt text is what shows
if the image fails to load, and is read aloud by screen readers, so
describe the image briefly.
```

### Fields before `===POPUP===` (shown on the small card)

| Field | Required? | Notes |
|---|---|---|
| `TITLE` | Yes | Card heading |
| `DATE_LABEL` | Yes | Displayed text, e.g. `Jul 2026` — doesn't have to match the filename date exactly, but should be close |
| `BLURB` | Yes | Not shown on the card anymore, but still used as a fallback popup summary if you leave everything after `===POPUP===` empty |
| `LINK_TEXT` | No | e.g. `Play on itch.io`, `View entry` — omit both LINK fields if there's nothing to link to |
| `LINK_URL` | No | Full URL, must start with `https://` |
| `MEDIA_URL` | No | An image, gif, or video shown in the middle of the card. Same web-or-local-file rule as everything else — a full `https://` URL or a path relative to this folder (e.g. `assets/thing.gif`). File extension decides how it's shown: `.mp4`/`.webm`/`.mov` play as a muted, looping video; anything else renders as an image. Leave it out entirely for a text-only card. |
| `MEDIA_ALT` | No | Describes the media for screen readers. Falls back to the title if left out. Ignored for video. |

### Everything after `===POPUP===` (shown when the card is clicked)

Plain text, with light formatting support:

- Blank line = new paragraph
- `# Heading` or `## Heading` = section heading
- `- item` (one per line) = bullet list

**Adding links, images, gifs, or videos** — use these anywhere in the text,
as many times as you like, mixed in with regular writing or on their own
line:

```
{{link: https://example.com | the text you want shown}}
{{image: https://example.com/photo.png | a short description of the image}}
{{gif: https://example.com/clip.gif | a short description of the gif}}
{{video: https://example.com/clip.mp4}}
```

The URL can be a full web address (`https://...`) or a path to a file
sitting in this `GameJams&Extras` folder (e.g. `assets/screenshot.png`)
— the site works out which one you mean automatically, so you don't need
to write anything special for local files.

- The bit after `|` is the link text (for `link`) or the alt text (for
  `image`/`gif`) — describe it briefly, since it's what screen readers
  read aloud and what shows if the image fails to load. `video` doesn't
  take one.
- Put a tag on its own line to have it appear as its own block (a full-width
  image, or a link on its own line). Put it in the middle of a sentence to
  have it appear inline, right there in the text.
- Use as many as you want, in whatever order — some entries might have
  none, others might have three images and two links scattered through
  the write-up.
- `image` and `gif` behave identically — `gif` is just there so it's
  obvious at a glance what the file actually is.

You can mix all of these freely. Nothing here needs to match what's in the
short `BLURB` above it — the popup is where the fuller story goes.

## Notes

- File names and the manifest are case-sensitive — keep them consistent.
- If a `.txt` file has a problem (missing a required field, wrong date
  format, etc.), the site skips it rather than breaking the whole section.
  Check the browser console for a warning naming the file if an entry
  doesn't show up.
