"""Live public-link check, kept separate from deterministic browser tests."""
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit, urldefrag
from test_site import Page, ROOT
import time

def check(url):
    base, fragment = urldefrag(url)
    error = None
    for attempt in range(3):
        try:
            request = Request(base, headers={'User-Agent': 'AgentHangar-link-check/1.0'})
            with urlopen(request, timeout=20) as response:
                body = response.read().decode('utf-8', errors='replace')
                if response.status != 200: raise ValueError(f'HTTP {response.status}')
                if fragment:
                    ids = Page(body).ids
                    if fragment not in ids and f'user-content-{fragment}' not in ids:
                        raise ValueError(f'Missing fragment #{fragment}')
            return url, None
        except (HTTPError, URLError, ValueError, TimeoutError) as exc:
            error = str(exc)
            if isinstance(exc, HTTPError) and exc.code in (404, 410): break
            if attempt < 2: time.sleep(attempt + 1)
    return url, error

if __name__ == '__main__':
    # Check user-facing destinations, including their public fragment IDs.
    from html.parser import HTMLParser
    class Links(HTMLParser):
        def __init__(self): super().__init__(); self.links=set()
        def handle_starttag(self, tag, attrs):
            href=dict(attrs).get('href','')
            if tag=='a' and urlsplit(href).scheme in ('https','http'): self.links.add(href)
    links=Links();links.feed((ROOT/'index.html').read_text())
    with ThreadPoolExecutor(max_workers=4) as pool: results=list(pool.map(check,sorted(links.links)))
    for url,error in results: print(('FAIL' if error else 'OK'),url,error or '')
    raise SystemExit(any(error for _,error in results))
