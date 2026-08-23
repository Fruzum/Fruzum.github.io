# Previous Creations — content folder

This is where every entry in the "Previous Creations" section on the site
comes from. It's similar to the `GameJams&Extras` folder — a `.txt` file
per entry, listed in `manifest.txt` — but adapted for showcasing a gif
with a title, and ordered manually rather than by date.

## How it looks on the site

- **The card** (what visitors see in the grid) shows the gif, playing on
  loop, with the title underneath.
- **Clicking the card** opens a popup with the gif at the top (bigger),
  the title below it, and whatever extra write-up you add below that.

## Adding a new entry

**1. Add your gif (or other image) somewhere in this folder** — the
`assets/` folder here is a good place, e.g. `assets/my-project.gif`.
Keep gif file sizes reasonable (a few MB at most) since they play
automatically on the page.

**2. Create a new `.txt` file inside `entries/`, named whatever you like:**

```
Title-With-Hyphens.txt
```

- Unlike the Extra section, there's no date in the filename here —
  Previous Creations doesn't sort by date at all. The order entries
  appear in on the page is just whatever order they're listed in
  `manifest.txt` (top of that list = shown first).
- Example: `Golden-Leaf-Adventures.txt`

**3. Add that exact filename as a new line in `manifest.txt`, in whatever
position you want it to appear on the page.**

**4. Fill in the file using the template below.**

## Entry file format

```
TITLE: Golden Leaf Adventures
GIF_URL: assets/golden-leaf.gif
GIF_ALT: Lizard character running and jumping across a platformer level
LINK_TEXT: Play on itch.io
LINK_URL: https://fruzum.itch.io/golden-leaf
===POPUP===
Whatever you want to show below the gif and title in the popup. Same
light formatting as the Extra section entries:

## A heading

Regular paragraphs just need a blank line between them to separate.

- Bullet points
- work like this

Links use [this text](https://example.com), and you can drop in more
images or gifs with ![alt text](https://example.com/image.gif).
```

### Fields before `===POPUP===`

| Field | Required? | Notes |
|---|---|---|
| `TITLE` | Yes | Shown on the card and at the top of the popup |
| `GIF_URL` | Yes | Path to the gif — relative to this folder (e.g. `assets/thing.gif`) or a full `https://` URL |
| `GIF_ALT` | No | Describes the gif for screen readers; falls back to the title if left out |
| `LINK_TEXT` | No | e.g. `Play on itch.io` — omit both LINK fields if there's nothing to link to |
| `LINK_URL` | No | Full URL, must start with `https://` |

### Everything after `===POPUP===`

Same rules as the Extra section: blank line = new paragraph, `#`/`##` for
headings, `- ` for bullets. If you leave this section empty, the popup
just shows the gif and title with nothing extra beneath.

**Adding more links, images, gifs, or videos below the main one** — use
these anywhere in the text, as many times as you like:

```
{{link: https://example.com | the text you want shown}}
{{image: https://example.com/photo.png | a short description}}
{{gif: https://example.com/clip.gif | a short description}}
{{video: https://example.com/clip.mp4}}
```

Same as `GIF_URL` above: the URL can be a full web address, or a path
relative to this `PreviousCreations` folder (e.g. `assets/photo.png`) —
both work, and the site figures out which one you mean automatically.

Put one on its own line for a full-width block, or in the middle of a
sentence for it to sit inline. See `GameJams&Extras/README.md` for the
full rundown of this syntax — it works identically here.

## Notes

- File names and the manifest are case-sensitive.
- Want to reorder your projects on the page? Just reorder the lines in
  `manifest.txt` — no need to rename or touch any of the `.txt` files.
- If an entry has a problem (missing `TITLE` or `GIF_URL`), the site
  skips it and logs a warning in the browser console rather than
  breaking the whole section.
