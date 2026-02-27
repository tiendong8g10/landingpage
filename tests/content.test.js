import { describe, expect, it } from "vitest";
import { siteContent } from "../src/data/content.js";

describe("site content", () => {
  it("has 4 sections in required order", () => {
    expect(siteContent.sections).toHaveLength(4);
    expect(siteContent.sections.map((section) => section.id)).toEqual([
      "quan-chung-phong-khong-khong-quan",
      "cac-hien-vat",
      "khong-gian-van-hoa-ho-chi-minh",
      "cac-hinh-anh-tuyen-quan",
    ]);
  });

  it("uses the approved hero title", () => {
    expect(siteContent.hero.title).toContain("Hội trại tòng quân năm 2026");
  });
});
