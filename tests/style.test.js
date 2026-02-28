import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const styleCss = readFileSync(resolve("src/style.css"), "utf8");

describe("menu interaction styles", () => {
  it("keeps nav-link shimmer layer from intercepting clicks", () => {
    expect(styleCss).toMatch(/\.nav-link\s*\{[\s\S]*overflow:\s*hidden;/);
    expect(styleCss).toMatch(/\.nav-link::before\s*\{[\s\S]*pointer-events:\s*none;/);
  });

  it("lets collapsed mobile menu extend outside the navbar shell", () => {
    expect(styleCss).toMatch(/\.top-nav\s*\{[\s\S]*overflow:\s*visible;/);
  });
});

describe("gallery image fit", () => {
  it("shows full gallery images without cropping", () => {
    expect(styleCss).toMatch(/\.gallery-card img\s*\{[\s\S]*object-fit:\s*contain;/);
  });

  it("shows the clicked image at large size inside the lightbox", () => {
    expect(styleCss).toMatch(/\.lightbox-figure img\s*\{[\s\S]*display:\s*block;/);
    expect(styleCss).toMatch(/\.lightbox-figure img\s*\{[\s\S]*object-fit:\s*contain;/);
  });
});
