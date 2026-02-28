import { beforeEach, describe, expect, it } from "vitest";
import { renderApp } from "../src/main.js";
import { siteContent } from "../src/data/content.js";

describe("page render", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it("renders 4 content sections", () => {
    renderApp(document.getElementById("app"), siteContent);
    expect(document.querySelectorAll("section.content-section")).toHaveLength(4);
  });

  it("renders sticky navigation links for all sections", () => {
    renderApp(document.getElementById("app"), siteContent);
    const anchors = Array.from(document.querySelectorAll(".top-nav a[href^='#']")).map((node) =>
      node.getAttribute("href")
    );
    expect(anchors).toEqual([
      "#quan-chung-phong-khong-khong-quan",
      "#cac-hien-vat",
      "#khong-gian-van-hoa-ho-chi-minh",
      "#cac-hinh-anh-tuyen-quan",
    ]);
  });

  it("adds typography hooks for spring animation and justified copy", () => {
    renderApp(document.getElementById("app"), siteContent);

    const heroTitle = document.querySelector("h1.hero-title.spring-shimmer");
    expect(heroTitle).not.toBeNull();

    const sectionTitles = document.querySelectorAll("h2.section-title.spring-glow");
    expect(sectionTitles).toHaveLength(4);

    const introParagraph = document.querySelector(".intro-copy p.editorial-copy");
    expect(introParagraph).not.toBeNull();
  });

  it("toggles mobile nav tabs from menu icon", () => {
    renderApp(document.getElementById("app"), siteContent);

    const topNav = document.querySelector(".top-nav");
    const toggleButton = document.querySelector("[data-mobile-nav-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    expect(toggleButton).not.toBeNull();
    expect(mobileNav).not.toBeNull();
    topNav.classList.add("is-collapsed");
    expect(mobileNav.dataset.open).toBe("false");
    expect(toggleButton.getAttribute("aria-expanded")).toBe("false");

    toggleButton.click();
    expect(mobileNav.dataset.open).toBe("true");
    expect(toggleButton.getAttribute("aria-expanded")).toBe("true");

    toggleButton.click();
    expect(mobileNav.dataset.open).toBe("false");
    expect(toggleButton.getAttribute("aria-expanded")).toBe("false");
  });

  it("renders a dedicated mobile camp-name badge inside navbar", () => {
    renderApp(document.getElementById("app"), siteContent);
    const brand = document.querySelector(".mobile-brand");
    expect(brand).not.toBeNull();
    expect(brand.textContent).toContain("TIỂU TRẠI PHẠM VĂN SÁNG");
  });

  it("keeps all four sections in long page flow", () => {
    renderApp(document.getElementById("app"), siteContent);
    const sections = Array.from(document.querySelectorAll("section.content-section"));
    expect(sections).toHaveLength(4);
    expect(sections.every((section) => section.hidden === false)).toBe(true);
  });

  it("renders doc-like mixed content for the Air Defense section", () => {
    renderApp(document.getElementById("app"), siteContent);
    const section = document.querySelector("#quan-chung-phong-khong-khong-quan");
    const flow = section.querySelector(".doc-flow");
    const textBlocks = section.querySelectorAll(".doc-flow p.doc-text");
    const imageBlocks = section.querySelectorAll(".doc-flow figure.doc-image");
    const legacyGallery = section.querySelector(".gallery-grid");

    expect(flow).not.toBeNull();
    expect(textBlocks.length).toBeGreaterThan(3);
    expect(imageBlocks.length).toBeGreaterThan(0);
    expect(legacyGallery).toBeNull();
  });

  it("renders hyperlink in doc-text block when parts include href", () => {
    const customData = {
      ...siteContent,
      sections: [
        {
          id: "quan-chung-phong-khong-khong-quan",
          title: "Quân chủng Phòng không – Không quân",
          lead: "",
          items: [],
          blocks: [
            {
              type: "text",
              text: "Xem tài liệu tham khảo.",
              parts: [
                { text: "Xem ", href: "" },
                { text: "tài liệu", href: "https://example.com/reference" },
                { text: " tham khảo.", href: "" },
              ],
            },
          ],
        },
      ],
    };

    renderApp(document.getElementById("app"), customData);
    const link = document.querySelector(".doc-flow .doc-link");
    expect(link).not.toBeNull();
    expect(link.textContent).toContain("tài liệu");
    expect(link.getAttribute("href")).toContain("https://example.com/reference");
  });
});
