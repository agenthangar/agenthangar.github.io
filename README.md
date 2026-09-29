# agenthangar.github.io

Organization site for [AgentHangar](https://github.com/agenthangar). Plain static HTML and CSS, no build step.

- `index.html` — the page
- `styles.css` — styles
- `assets/favicon.svg` — favicon (monogram on a dark tile)
- `assets/avatar.svg` — 512px square version for the GitHub org avatar
- `assets/logo.svg` — bare monogram

## Analytics

The website uses Google Analytics 4 through the Google tag in `index.html`.
The AgentHangar account contains the **AgentHangar Website** property and web
stream for `https://agenthangar.ai`, with measurement ID `G-JYN4WLH0XT`.
Enhanced measurement collects page views, scrolls, and outbound link clicks
(including the destination repository URL). These events are automatic; avoid
adding a second tag or manual page-view/click events that would duplicate them.

To verify an installation, use the stream's **Test installation** tool and check
**Realtime** or **DebugView** while visiting the site and clicking a project link.

## Publishing

Push this repository to `agenthangar/agenthangar.github.io` and enable GitHub Pages (Settings → Pages → Deploy from branch `main`, root). The `CNAME` file points GitHub Pages at https://agenthangar.ai/; DNS for that domain lives in Cloudflare.
