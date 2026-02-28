import { beforeEach, describe, expect, it } from "vitest";
import { buildLightboxState, renderApp } from "../src/main.js";
import { siteContent } from "../src/data/content.js";

describe("lightbox state", () => {
  it("cycles next/prev within section image list", () => {
    const state = buildLightboxState(3);
    expect(state.next(2)).toBe(0);
    expect(state.prev(0)).toBe(2);
  });
});

describe("lightbox behavior", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    renderApp(document.getElementById("app"), siteContent);
  });

  it("opens when clicking image card and closes on escape", () => {
    const card = document.querySelector(".gallery-card");
    expect(card).not.toBeNull();
    card.click();

    const overlay = document.querySelector("[data-lightbox]");
    expect(overlay.dataset.open).toBe("true");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(overlay.dataset.open).toBe("false");
  });

  it("moves next and previous in overlay", () => {
    const card = document.querySelector(".gallery-card");
    card.click();
    const overlay = document.querySelector("[data-lightbox]");
    const nextButton = overlay.querySelector("[data-action='next']");
    const prevButton = overlay.querySelector("[data-action='prev']");
    const counter = overlay.querySelector("[data-lightbox-counter]");

    const initialCounter = counter.textContent;
    nextButton.click();
    expect(counter.textContent).not.toBe(initialCounter);

    prevButton.click();
    expect(counter.textContent).toBe(initialCounter);
  });

  it("shows full caption directly in lightbox without extra detail modal", () => {
    const longCaption =
      "Trong thời gian từ 16 tháng 5 năm 1977 đến 3 tháng 3 năm 1999, Quân chủng Phòng không – Không quân tách ra thành hai Quân chủng riêng biệt và có nhiều thay đổi tổ chức để phù hợp nhiệm vụ từng giai đoạn lịch sử.";
    const customData = {
      ...siteContent,
      sections: [
        {
          id: "quan-chung-phong-khong-khong-quan",
          title: "Quân chủng Phòng không – Không quân",
          lead: "Lead",
          items: [
            {
              src: "/images/quan-chung-phong-khong-khong-quan/image-01.jpg",
              alt: "alt",
              caption: longCaption,
            },
          ],
        },
      ],
    };

    document.body.innerHTML = '<div id="app"></div>';
    renderApp(document.getElementById("app"), customData);

    const card = document.querySelector(".gallery-card");
    card.click();

    const preview = document.querySelector("[data-lightbox-caption]");
    const expand = document.querySelector("[data-caption-expand]");
    const detail = document.querySelector("[data-caption-detail]");

    expect(preview.textContent).toContain("Quân chủng Phòng không");
    expect(preview.textContent.endsWith("...")).toBe(false);
    expect(expand).toBeNull();
    expect(detail).toBeNull();
  });
});
