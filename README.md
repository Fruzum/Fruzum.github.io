# Sally Gillbanks — Portfolio Site

A one-page site (single scrolling page, popups for the experience detail)
where each section lives in its own file. `index.html` just lists which
files go where and loads them at runtime — so editing the About section
means editing `sections/about.html`, not hunting through one giant page.

## File structure

```
.
├── index.html                # shell: nav + the order sections load in
├── sections/
│   ├── hero.html              # name, role, contact line
│   ├── now.html                # "what am I doing now" status bar
│   ├── about.html
│   ├── skills.html
│   ├── creations.html          # empty grid + loading text — filled in by assets/js/creations.js
│   ├── experience.html         # timeline + "view full breakdown" buttons
│   ├── jams.html                # empty grid + loading text — filled in by assets/js/jams.js
│   ├── education.html
│   └── contact.html            # footer / get in touch
│   └── modal.html              # popup shells used by experience.js, jams.js, and creations.js
├── GameJams&Extras/
│   ├── README.md                # the entry file format, explained in full
│   ├── manifest.txt              # list of entry files, controls what shows up
│   └── entries/
│       └── YYYY-MM_Title.txt     # one file per jam/event — see the README in this folder
├── PreviousCreations/
│   ├── README.md                 # the entry file format, explained in full
│   ├── manifest.txt               # list of entry files, controls what shows up
│   ├── assets/                    # gifs/images referenced by entries live here
│   └── entries/
│       └── YYYY-MM_Title.txt      # one file per project — see the README in this folder
├── assets/
│   ├── css/
│   │   └── style.css          # all styling, shared by every section
│   ├── js/
│   │   ├── main.js             # loads each section file into index.html
│   │   ├── experience.js       # experience popup content + open/close logic
│   │   ├── jams.js             # reads GameJams&Extras/, renders cards + popups
│   │   ├── creations.js        # reads PreviousCreations/, renders cards + popups
│   │   └── contact.js          # contact form submit handling
│   └── video/
│       └── painting-game.mp4
├── .nojekyll
└── README.md
```

## Adding a new game jam or event

See `GameJams&Extras/README.md` for the full format — short version: add a
`.txt` file to `GameJams&Extras/entries/`, add its filename to
`GameJams&Extras/manifest.txt`, and it appears on the site automatically,
sorted newest-first, with its own click-through popup. No HTML or JS
editing required for new entries.

## Adding a new "Previous Creations" entry

See `PreviousCreations/README.md` for the full format — works the same way
as the Extra section, but each card shows a gif and title, and the popup
shows the gif bigger, the title, then any extra write-up you add.

## How it fits together

`index.html` contains one empty `<div class="section-slot" data-src="sections/about.html">`
per section. `assets/js/main.js` fetches each file listed in `data-src` and
drops its contents into place, in order, so the page reads top to bottom
exactly like a normal single page. To change what's in a section, just edit
its file in `sections/` — you don't need to touch `index.html`, the CSS, or
the JS.

Adding a new section later: drop a new file in `sections/`, add one line to
`index.html` (`<div class="section-slot" data-src="sections/new.html"></div>`),
and optionally a nav link.

## Important: this needs a real server, not double-clicking the file

The section files are loaded with `fetch()`, which browsers block when a
page is opened directly from disk (`file://...`). This isn't a problem on
GitHub Pages — it serves everything over `https://`, so it works there with
no changes. It only matters if you want to preview the site on your own
computer first:

```bash
# from inside the site folder
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

(Any local server works — `npx serve`, VS Code's "Live Server" extension,
etc. Just not opening `index.html` directly.)

## Hosting on GitHub Pages (free)

**1. Create a repository**
- On GitHub, click **New repository**.
- Name it anything — for a personal site at `username.github.io`, name the
  repo exactly `username.github.io` (replace `username` with your GitHub
  username). Any other name also works, it'll just live at
  `username.github.io/repo-name`.
- Keep it **Public** (required for free GitHub Pages).

**2. Upload these files**
- On the repo page, click **Add file → Upload files**.
- Drag in `index.html`, `.nojekyll`, `README.md`, and the whole `sections`
  and `assets` folders (drag folders in directly — GitHub preserves the
  structure).
- Commit the changes.

*(Or, from the command line in this folder:)*
```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git push -u origin main
```

**3. Turn on Pages**
- In the repo, go to **Settings → Pages**.
- Under **Build and deployment → Source**, choose **Deploy from a branch**.
- Branch: `main`, folder: `/ (root)`. Save.

**4. Visit the site**
- GitHub will show a URL like `https://username.github.io/repo-name/`
  (or just `https://username.github.io/` if you used the special repo name).
- It takes a minute or two to go live after the first deploy.

## Updating later

Edit the relevant file in `sections/` (or `assets/css/style.css` for
site-wide look), commit, and push — GitHub Pages redeploys automatically
within a minute or so.
