"""Deterministic checks for every local URL in the shipped page and CSS."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids, self.urls, self.images = [], [], []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        for key in ('href', 'src', 'poster'):
            if attrs.get(key): self.urls.append(attrs[key])
        if tag == 'img': self.images.append(attrs)
        if attrs.get('srcset'):
            self.urls.extend(item.strip().split()[0] for item in attrs['srcset'].split(','))

class SiteTests(unittest.TestCase):
    def test_all_local_links_assets_and_fragments_exist(self):
        pages = list(ROOT.glob('*.html'))
        self.assertTrue(pages)
        for file in pages:
            page = Page(file.read_text())
            self.assertEqual(len(page.ids), len(set(page.ids)), f'Duplicate IDs: {file}')
            for url in page.urls:
                parsed = urlsplit(url)
                if parsed.scheme or parsed.netloc: continue
                target = (ROOT / unquote(parsed.path).lstrip('/')) if parsed.path.startswith('/') else file.parent / unquote(parsed.path)
                if not parsed.path: target = file
                if target.is_dir(): target /= 'index.html'
                with self.subTest(page=file.name, url=url):
                    self.assertTrue(target.is_file(), f'Missing target: {target}')
                    self.assertGreater(target.stat().st_size, 0)
                    if parsed.fragment:
                        self.assertIn(unquote(parsed.fragment), Page(target.read_text()).ids)
            for image in page.images:
                self.assertIn('alt', image)
    def test_css_assets_exist(self):
        for file in ROOT.glob('*.css'):
            for url in re.findall(r'url\([\s\'"]*([^\s\)\'"]+)', file.read_text()):
                if urlsplit(url).scheme: continue
                self.assertTrue((file.parent / urlsplit(url).path).is_file(), url)

if __name__ == '__main__': unittest.main()
