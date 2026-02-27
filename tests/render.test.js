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
    const anchors = Array.from(
      document.querySelectorAll(".top-nav a[href^='#']")
    ).map((node) => node.getAttribute("href"));
    expect(anchors).toEqual([
      "#quan-chung-phong-khong-khong-quan",
      "#cac-hien-vat",
      "#khong-gian-van-hoa-ho-chi-minh",
      "#cac-hinh-anh-tuyen-quan",
    ]);
  });
});
