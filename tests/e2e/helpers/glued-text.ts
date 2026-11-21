import type { Page } from '@playwright/test';
import { waitForHydration } from './hydration';

// Missing spaces (PR #79 review, build V1; extended to every page type in build 10b).
// In JSX, text that follows a {value} or a closing tag and contains an HTML entity
// (&apos;, &ldquo;) lost its leading space in the compiled output ("3.30%at",
// "2023(VA.gov", "$7,525you", "Refunds:VA's"). The check reads the rendered text
// (innerText, every <details> opened), after hydration.
//   SPACING: a figure glued to a word: "3.30%at", "2023(", "$7,525you".
//   LABEL:   a label glued to its text: "Refunds:VA's", "sense:If".
//
// Exceptions (each one is correct text, not a glued space):
//   - A statute citation: "38 U.S.C. § 5120(e)" (V1).
//   - A CFR section citation: "38 CFR § 36.4306(c)(2)" (10b): the four digits after
//     "§ 36." are a section number.
//   - A U.S. Code citation without the § sign: "37 U.S.C. 1009(e)" (10b; /pay/raise,
//     /blog/how-to-read-your-les).
//   - A dollar figure with a k/m/b suffix: "≈$121k" (10b; home page).
//   - A round dollar figure as a range of amounts: "mid-$20s" (10b;
//     /blog/sgli-vgli-private-life-insurance). Only a final 0 followed by "s" and a word
//     break, so "$7,525so" is still caught.
export const SPACING =
  /\d%[a-z]|(?<!§\s?(?:\d+\.)?|U\.S\.C\.\s)\b\d{4}\(|\$[\d,]+(?![kmb]\b|(?<=0)s\b)[a-z]/g;
export const LABEL = /[a-z]:[A-Z]/g;

/** Every hit in a string, with 40 characters of context before and 20 after. */
export function gluedHits(text: string): string[] {
  const hits: string[] = [];
  for (const re of [SPACING, LABEL]) {
    for (const m of text.matchAll(re)) hits.push(text.slice(Math.max(0, m.index - 40), m.index + 20).replace(/\s+/g, ' '));
  }
  return hits;
}

/** Hits in the page's rendered text, with every <details> opened. */
export async function gluedText(page: Page): Promise<string[]> {
  await page.evaluate(() => document.querySelectorAll('details').forEach((d) => { d.open = true; }));
  return gluedHits(await page.locator('body').innerText());
}

/** Open a page, wait for React to hydrate it, and return the hits. */
export async function gluedTextAt(page: Page, path: string): Promise<string[]> {
  const res = await page.goto(path);
  if (!res || res.status() >= 400) throw new Error(`${path}: HTTP ${res?.status()}`);
  await waitForHydration(page.locator('body'), 30_000);
  return gluedText(page);
}
