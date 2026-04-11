/**
 * Regression tests for blog article UX enhancements.
 *
 * Context: during the Astro SSG migration (April 2026) four features were
 * accidentally dropped from `src/pages/blog/[slug].astro`:
 *   1. Dynamic table of contents (sticky, active-section tracking)
 *   2. Reading progress bar under the navbar
 *   3. Related-article suggestions at the end
 *   4. "Subject line: ..." paragraphs styled centered / non-bold
 *
 * The user flagged this as a UX/SEO regression. These tests guard against
 * re-removal. If any of them fail in the future, restore the feature
 * rather than deleting the test.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  initBlogArticle,
  initTableOfContents,
  initScrollProgress,
  styleSubjectLines,
  filterTocHeadings,
  type HeadingLike,
} from '@/scripts/blog-article';

function setBody(html: string) {
  document.body.innerHTML = html;
}

// Synchronous rAF shim — production code uses requestAnimationFrame to batch
// scroll/resize writes; jsdom doesn't flush rAF automatically, so we stub it
// to call immediately. Tests that rely on rAF scheduling (scroll handlers)
// use this to observe the DOM writes synchronously after dispatchEvent.
function installSyncRaf() {
  const originalRaf = globalThis.requestAnimationFrame;
  const originalCancel = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    cb(performance.now());
    return 0;
  }) as typeof requestAnimationFrame;
  globalThis.cancelAnimationFrame = (() => {}) as typeof cancelAnimationFrame;
  return () => {
    globalThis.requestAnimationFrame = originalRaf;
    globalThis.cancelAnimationFrame = originalCancel;
  };
}

describe('blog article enhancements', () => {
  let restoreRaf: () => void;

  beforeEach(() => {
    document.body.innerHTML = '';
    window.scrollY = 0;
    restoreRaf = installSyncRaf();
  });

  afterEach(() => {
    restoreRaf();
    document.body.innerHTML = '';
  });

  describe('initTableOfContents', () => {
    it('marks the first TOC link as active on mount', () => {
      setBody(`
        <aside>
          <a data-toc-link href="#intro">Intro</a>
          <a data-toc-link href="#body">Body</a>
        </aside>
        <article>
          <h2 id="intro">Intro</h2>
          <p>Text.</p>
          <h2 id="body">Body</h2>
          <p>More text.</p>
        </article>
      `);
      // jsdom reports offsetTop=0 for every element, which would make every
      // heading "above the fold" at mount and the last one would win. Set
      // realistic offsets so the scroll-tracking logic has something to work
      // with — mirrors what a real browser would report.
      Object.defineProperty(document.getElementById('intro')!, 'offsetTop', {
        value: 200,
        configurable: true,
      });
      Object.defineProperty(document.getElementById('body')!, 'offsetTop', {
        value: 1000,
        configurable: true,
      });
      initTableOfContents();
      const links = document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]');
      expect(links[0].classList.contains('is-active')).toBe(true);
      expect(links[1].classList.contains('is-active')).toBe(false);
    });

    it('updates the active link when the user scrolls past a heading', () => {
      setBody(`
        <aside>
          <a data-toc-link href="#one">One</a>
          <a data-toc-link href="#two">Two</a>
        </aside>
        <article>
          <h2 id="one">One</h2>
          <h2 id="two">Two</h2>
        </article>
      `);
      // Fake offsetTop since jsdom reports 0 for everything.
      const h1 = document.getElementById('one')!;
      const h2 = document.getElementById('two')!;
      Object.defineProperty(h1, 'offsetTop', { value: 0, configurable: true });
      Object.defineProperty(h2, 'offsetTop', { value: 1000, configurable: true });

      initTableOfContents();

      // Scroll past heading two (OFFSET = 120, so 900 + 120 > 1000).
      window.scrollY = 900;
      window.dispatchEvent(new Event('scroll'));

      const links = document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]');
      expect(links[0].classList.contains('is-active')).toBe(false);
      expect(links[1].classList.contains('is-active')).toBe(true);
    });

    it('is a no-op when there are no TOC links', () => {
      setBody('<p>no toc</p>');
      const addSpy = vi.spyOn(window, 'addEventListener');
      expect(() => initTableOfContents()).not.toThrow();
      // Should not have attached any scroll listeners.
      expect(
        addSpy.mock.calls.some((c) => c[0] === 'scroll'),
      ).toBe(false);
      addSpy.mockRestore();
    });

    it('is a no-op when TOC links reference missing heading IDs', () => {
      // Guards a branch that was flagged in review: TOC links exist but
      // point at #missing (heading was deleted or slug mismatch). The
      // function should not crash and should not add is-active to anything.
      setBody(`
        <aside><a data-toc-link href="#missing">Missing</a></aside>
        <article><p>no heading here</p></article>
      `);
      expect(() => initTableOfContents()).not.toThrow();
      expect(
        document.querySelector('[data-toc-link]')!.classList.contains('is-active'),
      ).toBe(false);
    });

    it('returns a cleanup fn that removes the scroll and resize listeners', () => {
      setBody(`
        <a data-toc-link href="#x">x</a>
        <h2 id="x">x</h2>
      `);
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const cleanup = initTableOfContents();
      cleanup();
      const events = removeSpy.mock.calls.map((c) => c[0]);
      expect(events).toContain('scroll');
      expect(events).toContain('resize');
      removeSpy.mockRestore();
    });
  });

  describe('initScrollProgress', () => {
    beforeEach(() => {
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 2000,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 1000,
        configurable: true,
      });
    });

    afterEach(() => {
      // Restore jsdom defaults so later tests aren't polluted by the
      // overridden scrollHeight/innerHeight values.
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 0,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 768,
        configurable: true,
      });
    });

    it('sets the progress bar width to 0% when scrollY is 0', () => {
      setBody('<div data-blog-progress style="width:99%"></div>');
      initScrollProgress();
      const bar = document.querySelector<HTMLElement>('[data-blog-progress]')!;
      // Starts at 99%; init should zero it since scrollY === 0.
      expect(bar.style.width).toBe('0%');
    });

    it('updates the progress bar width on scroll', () => {
      setBody('<div data-blog-progress></div>');
      initScrollProgress();
      window.scrollY = 500; // 500 / 1000 = 50%
      window.dispatchEvent(new Event('scroll'));
      const bar = document.querySelector<HTMLElement>('[data-blog-progress]')!;
      expect(bar.style.width).toBe('50%');
    });

    it('clamps the width at 100% when scrolled past the bottom', () => {
      setBody('<div data-blog-progress></div>');
      initScrollProgress();
      window.scrollY = 5000;
      window.dispatchEvent(new Event('scroll'));
      const bar = document.querySelector<HTMLElement>('[data-blog-progress]')!;
      expect(bar.style.width).toBe('100%');
    });

    it('stays at 0% on an unscrollable (short) page instead of NaN%', () => {
      // Guards a regression where scrollable = scrollHeight - innerHeight
      // could be 0 (short stub articles, mobile viewports) and the division
      // produced 0/0 → NaN%. The fix clamps scrollable >= 0 and short-circuits.
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 1000,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 1000,
        configurable: true,
      });
      setBody('<div data-blog-progress></div>');
      initScrollProgress();
      const bar = document.querySelector<HTMLElement>('[data-blog-progress]')!;
      expect(bar.style.width).toBe('0%');
    });

    it('is a no-op when there is no progress bar in the DOM', () => {
      setBody('<p>no progress bar</p>');
      const addSpy = vi.spyOn(window, 'addEventListener');
      expect(() => initScrollProgress()).not.toThrow();
      expect(
        addSpy.mock.calls.some((c) => c[0] === 'scroll'),
      ).toBe(false);
      addSpy.mockRestore();
    });

    it('positions the bar wrapper flush at the navbar bottom edge', () => {
      // Guards the 2026-04-11 fix where the progress bar was hard-coded to
      // top-14 (56px) but the real navbar rendered at 68px tall, placing the
      // bar inside the navbar content. The fix reads the navbar's actual
      // getBoundingClientRect().bottom at init time. If someone hard-codes
      // the offset again, this test fails.
      //
      // Note: production code writes to `bar.parentElement`, so the test
      // mirrors the real parent-child relationship rather than using a
      // test-only marker attribute that could hide regressions.
      setBody(`
        <nav class="sticky"></nav>
        <div id="progress-wrapper" style="position: fixed; top: 999px;">
          <div data-blog-progress></div>
        </div>
      `);
      const nav = document.querySelector('nav.sticky') as HTMLElement;
      nav.getBoundingClientRect = () => ({
        x: 0, y: 0, top: 0, left: 0, right: 1440,
        bottom: 68, width: 1440, height: 68, toJSON: () => ({}),
      }) as DOMRect;

      initScrollProgress();

      const bar = document.querySelector<HTMLElement>('[data-blog-progress]')!;
      expect(bar.parentElement!.style.top).toBe('68px');
    });

    it('leaves the wrapper top untouched when nav.sticky is missing', () => {
      // Guards the branch where initScrollProgress runs on a page without
      // a sticky nav (e.g., a standalone blog article preview). The bar's
      // position should not be mutated — the fallback top style stays.
      setBody(`
        <div id="progress-wrapper" style="position: fixed; top: 42px;">
          <div data-blog-progress></div>
        </div>
      `);
      initScrollProgress();
      const bar = document.querySelector<HTMLElement>('[data-blog-progress]')!;
      expect(bar.parentElement!.style.top).toBe('42px');
    });

    it('repositions the bar on window resize', () => {
      setBody(`
        <nav class="sticky"></nav>
        <div id="progress-wrapper" style="position: fixed;">
          <div data-blog-progress></div>
        </div>
      `);
      const nav = document.querySelector('nav.sticky') as HTMLElement;
      let height = 68;
      nav.getBoundingClientRect = () => ({
        x: 0, y: 0, top: 0, left: 0, right: 1440,
        bottom: height, width: 1440, height, toJSON: () => ({}),
      }) as DOMRect;

      initScrollProgress();
      const bar = document.querySelector<HTMLElement>('[data-blog-progress]')!;
      expect(bar.parentElement!.style.top).toBe('68px');

      // Navbar shrinks on resize (e.g., mobile breakpoint).
      height = 56;
      window.dispatchEvent(new Event('resize'));
      expect(bar.parentElement!.style.top).toBe('56px');
    });

    it('cleanup removes both scroll and resize listeners', () => {
      setBody('<div data-blog-progress></div>');
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const cleanup = initScrollProgress();
      cleanup();
      const events = removeSpy.mock.calls.map((c) => c[0]);
      expect(events).toContain('scroll');
      expect(events).toContain('resize');
      removeSpy.mockRestore();
    });
  });

  describe('styleSubjectLines', () => {
    it('tags paragraphs whose text starts with "Subject line:"', () => {
      setBody(`
        <article class="blog-prose">
          <p><strong>Subject line: Welcome to Pipedrive Jonathan!</strong></p>
          <p>Pipedrive's welcome email is all about momentum.</p>
        </article>
      `);
      const count = styleSubjectLines();
      expect(count).toBe(1);
      const paragraphs = document.querySelectorAll('p');
      expect(paragraphs[0].classList.contains('is-subject-line')).toBe(true);
      expect(paragraphs[1].classList.contains('is-subject-line')).toBe(false);
    });

    it('also tags paragraphs starting with just "Subject:"', () => {
      setBody(`
        <article class="blog-prose">
          <p><strong>Subject: Welcome to Miro!</strong></p>
        </article>
      `);
      styleSubjectLines();
      const p = document.querySelector('p')!;
      expect(p.classList.contains('is-subject-line')).toBe(true);
    });

    it('is case-insensitive', () => {
      setBody(`
        <article class="blog-prose">
          <p><strong>SUBJECT LINE: Hello</strong></p>
        </article>
      `);
      styleSubjectLines();
      expect(document.querySelector('p')!.classList.contains('is-subject-line')).toBe(true);
    });

    it('does not tag normal paragraphs that mention "subject"', () => {
      setBody(`
        <article class="blog-prose">
          <p>Your subject line should be punchy.</p>
        </article>
      `);
      styleSubjectLines();
      expect(document.querySelector('p')!.classList.contains('is-subject-line')).toBe(false);
    });

    it('returns 0 when the article has no subject line paragraphs', () => {
      setBody(`
        <article class="blog-prose">
          <p>Just a normal paragraph.</p>
        </article>
      `);
      expect(styleSubjectLines()).toBe(0);
    });
  });

  describe('filterTocHeadings', () => {
    // Guards the 2026-04-11 user report: the TOC should ONLY contain H2s.
    // H3s (brand names inside the "28 examples" section) would flood the
    // TOC if allowed through. If you ever want to let H3s into the TOC,
    // talk to the user first — don't just delete these tests.
    it('keeps only depth=2 headings', () => {
      const headings: HeadingLike[] = [
        { depth: 2, slug: 'intro', text: 'Intro' },
        { depth: 3, slug: 'pipedrive', text: 'Pipedrive' },
        { depth: 2, slug: 'body', text: 'Body' },
        { depth: 3, slug: 'calendly', text: 'Calendly' },
        { depth: 4, slug: 'sub', text: 'Sub' },
      ];
      const filtered = filterTocHeadings(headings);
      expect(filtered).toHaveLength(2);
      expect(filtered.map((h) => h.slug)).toEqual(['intro', 'body']);
    });

    it('returns an empty array when there are no H2s', () => {
      const headings: HeadingLike[] = [
        { depth: 3, slug: 'a', text: 'A' },
        { depth: 4, slug: 'b', text: 'B' },
      ];
      expect(filterTocHeadings(headings)).toEqual([]);
    });

    it('preserves order and slug metadata', () => {
      const headings: HeadingLike[] = [
        { depth: 2, slug: 'first', text: 'First' },
        { depth: 2, slug: 'second', text: 'Second' },
      ];
      expect(filterTocHeadings(headings)).toEqual(headings);
    });
  });

  describe('initBlogArticle (composite orchestrator)', () => {
    // initBlogArticle is what [slug].astro actually imports and calls — it's
    // the production call path. Testing the composite guards against bugs
    // where the orchestrator forgets to wire up one of the three enhancements
    // or where cleanup composition drops a listener.
    it('wires up TOC, progress bar, and subject-line styling together', () => {
      Object.defineProperty(document.documentElement, 'scrollHeight', {
        value: 2000,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 1000,
        configurable: true,
      });
      setBody(`
        <nav class="sticky"></nav>
        <aside><a data-toc-link href="#intro">Intro</a></aside>
        <div id="progress-wrapper" style="position: fixed;">
          <div data-blog-progress></div>
        </div>
        <main>
          <article class="blog-prose">
            <h2 id="intro">Intro</h2>
            <p><strong>Subject line: Hello World</strong></p>
          </article>
        </main>
      `);
      Object.defineProperty(document.getElementById('intro')!, 'offsetTop', {
        value: 200,
        configurable: true,
      });
      const nav = document.querySelector('nav.sticky') as HTMLElement;
      nav.getBoundingClientRect = () => ({
        x: 0, y: 0, top: 0, left: 0, right: 1440,
        bottom: 68, width: 1440, height: 68, toJSON: () => ({}),
      }) as DOMRect;

      const cleanup = initBlogArticle();

      // All three enhancements ran.
      expect(
        document.querySelector('[data-toc-link]')!.classList.contains('is-active'),
      ).toBe(true);
      expect(
        document.querySelector<HTMLElement>('[data-blog-progress]')!.parentElement!
          .style.top,
      ).toBe('68px');
      expect(
        document.querySelector('p')!.classList.contains('is-subject-line'),
      ).toBe(true);

      // Composite cleanup removes both scroll listeners (TOC + progress).
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      cleanup();
      const scrollCalls = removeSpy.mock.calls.filter((c) => c[0] === 'scroll');
      expect(scrollCalls.length).toBeGreaterThanOrEqual(2);
      removeSpy.mockRestore();
    });

    it('returns a composite cleanup that is safe to call on pages without blog features', () => {
      setBody('<main><p>not a blog article</p></main>');
      const cleanup = initBlogArticle();
      expect(() => cleanup()).not.toThrow();
    });
  });

  describe('[slug].astro template invariants (CLAUDE.md)', () => {
    // Template-level regression guards. File-grep style — cheap, reliable,
    // and catches the exact regression class the user flagged: "someone
    // deleted a whole section". The Astro Container API would be cleaner but
    // adds test infra weight; these assertions are enough to catch dropped
    // sections.
    const astroPath = path.resolve(
      __dirname,
      '../../src/pages/blog/[slug].astro',
    );
    const src = readFileSync(astroPath, 'utf8');

    it('imports filterTocHeadings from blog-article (TOC H2-only invariant)', () => {
      expect(src).toMatch(/filterTocHeadings/);
    });

    it('renders the sticky table of contents aside with data-toc-link anchors', () => {
      expect(src).toMatch(/data-toc-link/);
      expect(src).toMatch(/hidden lg:block/);
      expect(src).toMatch(/sticky top-28/);
    });

    it('renders the reading progress bar element', () => {
      expect(src).toMatch(/data-blog-progress/);
    });

    it('renders the related articles section with "You might also be interested"', () => {
      expect(src).toMatch(/You might also be interested/);
    });

    it('renders an SVG fallback placeholder when related post has no heroImage/thumbnail', () => {
      // CLAUDE.md: "Every card must show a banner image — fall back to the
      // inline SVG placeholder when heroImage and thumbnail are both missing"
      expect(src).toMatch(/relImage \? \(/);
      expect(src).toMatch(/<svg[^>]*viewBox="0 0 320 240"/);
    });

    it('renders the "See it in the wild" library email section', () => {
      expect(src).toMatch(/See it in the wild/);
      expect(src).toMatch(/matchedLibraryEmails/);
    });

    it('defines CSS for the is-subject-line class', () => {
      expect(src).toMatch(/is-subject-line/);
      expect(src).toMatch(/text-align: center/);
    });

    it('wires up initBlogArticle via a module script', () => {
      expect(src).toMatch(/initBlogArticle/);
    });
  });
});
