/**
 * Blog article UX enhancements.
 *
 * DO NOT REMOVE these features without explicit user approval. They were
 * accidentally dropped during the Astro SSG migration (April 2026) and the
 * user flagged their loss as a UX/SEO regression. Regression tests live in
 * `test/blog/blog-article.test.ts`.
 *
 * Each function is exported so it can be tested in isolation under jsdom.
 */

/**
 * Filter the `headings` array returned by `post.render()` down to the H2s
 * that should appear in the article's table of contents. Kept as a pure
 * function so `[slug].astro` and the regression tests share the same logic.
 *
 * ONLY H2s belong in the TOC. H3s are used for sub-headings inside email
 * example cards (brand names like "Pipedrive", "Calendly") and would flood
 * the TOC with 28+ entries if included. User explicitly flagged this.
 */
export interface HeadingLike {
  depth: number;
  slug: string;
  text: string;
}
export function filterTocHeadings(headings: HeadingLike[]): HeadingLike[] {
  return headings.filter((h) => h.depth === 2);
}

/**
 * Wire up active-section tracking for a sticky table of contents.
 *
 * Given a list of headings and a corresponding set of TOC anchors, this
 * marks the anchor whose heading is currently at the top of the viewport
 * as "active" by adding the `is-active` class. Returns a cleanup function.
 *
 * Performance: heading offsets are cached once at init time and recomputed
 * only on resize. The scroll handler itself reads nothing that forces a
 * layout — it only reads the cheap `window.scrollY` plus a cached number
 * per heading. Writes are batched into a `requestAnimationFrame` so multiple
 * scroll events in a frame don't trigger multiple class-toggle rounds.
 */
export function initTableOfContents(
  container: Document | HTMLElement = document,
): () => void {
  const tocLinks = Array.from(
    container.querySelectorAll<HTMLAnchorElement>('[data-toc-link]'),
  );
  if (tocLinks.length === 0) return () => {};

  const headings = tocLinks
    .map((link) => {
      const id = link.getAttribute('href')?.replace(/^#/, '') ?? '';
      return (container instanceof Document ? container : document).getElementById(id);
    })
    .filter((el): el is HTMLElement => el !== null);
  if (headings.length === 0) return () => {};

  const OFFSET = 120; // sticky navbar height + breathing room

  // Cache each heading's offsetTop once. offsetTop reads force layout, so
  // doing it on every scroll event janked long articles (10+ H2s × 60Hz).
  let headingOffsets: Array<{ id: string; top: number }> = [];
  const recomputeOffsets = () => {
    headingOffsets = headings.map((h) => ({ id: h.id, top: h.offsetTop }));
  };
  recomputeOffsets();

  // rAF-throttled DOM writes so repeated scroll events in a single frame
  // collapse to one classList update.
  let rafId: number | null = null;
  const applyActive = () => {
    rafId = null;
    const scrollY = window.scrollY;
    let currentId = headingOffsets[0]?.id ?? '';
    for (const { id, top } of headingOffsets) {
      if (top <= scrollY + OFFSET) {
        currentId = id;
      } else {
        break;
      }
    }
    for (const link of tocLinks) {
      const href = link.getAttribute('href')?.replace(/^#/, '') ?? '';
      link.classList.toggle('is-active', href === currentId);
    }
  };
  const schedule = () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(applyActive);
  };

  applyActive();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', recomputeOffsets, { passive: true });
  return () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', recomputeOffsets);
  };
}

/**
 * Wire up the fixed reading progress bar that sits flush against the bottom
 * edge of the sticky navbar.
 *
 * The bar's *vertical* position is derived from the navbar's actual rendered
 * height (nav.sticky.getBoundingClientRect().bottom) rather than a hard-coded
 * offset, so it stays aligned with the navbar's bottom edge even if the
 * navbar grows or shrinks in the future. Its *width* is updated from 0% to
 * 100% as the user scrolls the article. Returns a cleanup function.
 *
 * Performance: the scrollable-height computation is cached and recomputed
 * only on resize (scrollHeight reads force layout, and it only changes when
 * the viewport resizes or the article content mutates — never during scroll).
 * Scroll and resize handlers are rAF-throttled so repeated events in a
 * single frame collapse to one DOM write.
 */
export function initScrollProgress(
  container: Document | HTMLElement = document,
): () => void {
  const bar = container.querySelector<HTMLElement>('[data-blog-progress]');
  if (!bar) return () => {};

  // Cached scrollable range — only changes on resize / content mutation.
  let scrollable = 0;
  const recomputeScrollable = () => {
    scrollable = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight,
    );
  };

  const positionBar = () => {
    const nav = document.querySelector<HTMLElement>('nav.sticky');
    if (!nav) return;
    // Place the bar so its top edge sits exactly on the navbar's bottom edge
    // (flush, no gap, not overlapping the navbar content). Using the rendered
    // box means we track the real navbar height even if its padding or content
    // changes later.
    const rect = nav.getBoundingClientRect();
    const topPx = Math.max(0, Math.round(rect.bottom));
    bar.parentElement?.style.setProperty('top', `${topPx}px`);
  };

  const writeWidth = () => {
    const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  };

  // rAF-throttled scroll: if multiple scroll events land in one frame, the
  // bar width only updates once at the end of the frame.
  let scrollRaf: number | null = null;
  const schedule = () => {
    if (scrollRaf !== null) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = null;
      writeWidth();
    });
  };

  // Resize is debounced via rAF too — continuous resize events (window drag,
  // orientation change) collapse to one reposition per frame.
  let resizeRaf: number | null = null;
  const scheduleResize = () => {
    if (resizeRaf !== null) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = null;
      recomputeScrollable();
      positionBar();
      writeWidth();
    });
  };

  recomputeScrollable();
  positionBar();
  writeWidth();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', scheduleResize, { passive: true });
  return () => {
    if (scrollRaf !== null) cancelAnimationFrame(scrollRaf);
    if (resizeRaf !== null) cancelAnimationFrame(resizeRaf);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', scheduleResize);
  };
}

/**
 * Match paragraphs whose entire content is a "Subject line: ..." label and
 * tag them with a class so CSS can style them (centered, non-bold, muted).
 *
 * The markdown looks like `**Subject line: Welcome to Miro!**` which Astro
 * renders as `<p><strong>Subject line: Welcome to Miro!</strong></p>`.
 *
 * Returns the number of paragraphs tagged — used by regression tests to
 * verify the matcher fired.
 */
export function styleSubjectLines(
  container: Document | HTMLElement = document,
): number {
  const root: ParentNode =
    container.querySelector<HTMLElement>('.blog-prose') ?? container;
  const paragraphs = root.querySelectorAll<HTMLParagraphElement>('p');
  let count = 0;
  paragraphs.forEach((p) => {
    const text = (p.textContent ?? '').trim();
    if (/^subject(\s+line)?\s*:/i.test(text)) {
      p.classList.add('is-subject-line');
      count += 1;
    }
  });
  return count;
}

/**
 * Wrap each `<pre>` code block with a copy-to-clipboard button. Returns the
 * number of buttons added — used by regression tests.
 *
 * The button is appended into a wrapper div around the `<pre>`, positioned
 * absolutely in the top-right. We wrap rather than inserting the button
 * inside the `<pre>` itself because Shiki sets `overflow-x: auto` on `<pre>`
 * and a button inside would scroll horizontally with the code.
 *
 * Idempotent: safe to call twice — already-wrapped `<pre>` elements are
 * skipped via the `code-block-wrapper` parent check.
 */
export function initCodeCopyButtons(
  container: Document | HTMLElement = document,
): number {
  const root: ParentNode =
    container.querySelector<HTMLElement>('.blog-prose') ?? container;
  const pres = root.querySelectorAll<HTMLPreElement>('pre');
  let count = 0;
  pres.forEach((pre) => {
    if (pre.parentElement?.classList.contains('code-block-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'code-copy-btn';
    btn.setAttribute('aria-label', 'Copy code to clipboard');
    btn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Copy</span>';

    const label = btn.querySelector('span');
    let resetTimer: number | undefined;
    const copyViaTextarea = (text: string): boolean => {
      // Fallback for environments where the async Clipboard API is missing
      // or rejects (older Safari, insecure contexts, automation eval).
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
      return ok;
    };

    btn.addEventListener('click', async () => {
      const text = pre.textContent ?? '';
      let ok = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          ok = true;
        } catch {
          ok = copyViaTextarea(text);
        }
      } else {
        ok = copyViaTextarea(text);
      }
      if (ok) {
        btn.setAttribute('data-copied', 'true');
        if (label) label.textContent = 'Copied';
        if (resetTimer) window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          btn.removeAttribute('data-copied');
          if (label) label.textContent = 'Copy';
        }, 1500);
      } else {
        if (label) label.textContent = 'Failed';
      }
    });

    wrapper.appendChild(btn);
    count += 1;
  });
  return count;
}

/**
 * Initialize all enhancements in one call. Safe to call multiple
 * times — each initializer short-circuits when its target element is
 * missing, so pages without a TOC or progress bar won't crash.
 */
export function initBlogArticle(): () => void {
  const cleanupToc = initTableOfContents();
  const cleanupProgress = initScrollProgress();
  styleSubjectLines();
  initCodeCopyButtons();
  return () => {
    cleanupToc();
    cleanupProgress();
  };
}
