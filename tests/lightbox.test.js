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
    const sourceImage = card.querySelector("img");

    card.click();

    const overlay = document.querySelector("[data-lightbox]");
    const overlayImage = document.querySelector("[data-lightbox-image]");
    expect(overlay.dataset.open).toBe("true");
    expect(overlayImage.getAttribute("src")).toBe(sourceImage.getAttribute("src"));

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

  it("shows a large image and keeps caption inline in the same modal", () => {
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
              caption: "Sư đoàn Phòng không 375, phường Hòa Phát, quận Cẩm Lệ, Đà Nẵng.",
            },
          ],
        },
      ],
    };

    document.body.innerHTML = '<div id="app"></div>';
    renderApp(document.getElementById("app"), customData);

    const card = document.querySelector(".gallery-card");
    card.click();

    const overlayImage = document.querySelector("[data-lightbox-image]");
    const preview = document.querySelector("[data-lightbox-caption]");

    expect(overlayImage.getAttribute("src")).toContain("image-01.jpg");
    expect(preview.textContent).toContain("Sư đoàn Phòng không 375");
    expect(document.querySelector("[data-caption-expand]")).toBeNull();
    expect(document.querySelector("[data-caption-detail]")).toBeNull();
  });
});
