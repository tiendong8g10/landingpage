import extractedData from "../../generated/content-data.json";

const sectionLeads = {
  "quan-chung-phong-khong-khong-quan": "",
  "cac-hien-vat":
    "Tổng hợp các hiện vật, khí tài và hình ảnh trưng bày thể hiện sức mạnh, bản lĩnh và truyền thống của lực lượng Phòng không – Không quân Việt Nam.",
  "khong-gian-van-hoa-ho-chi-minh":
    "Không gian văn hoá Hồ Chí Minh góp phần bồi dưỡng lý tưởng cách mạng, hun đúc tinh thần học tập và làm theo tư tưởng, đạo đức, phong cách của Bác.",
  "cac-hinh-anh-tuyen-quan":
    "Những khoảnh khắc tiêu biểu trong ngày hội tòng quân, thể hiện khí thế tuổi trẻ, tinh thần trách nhiệm và quyết tâm lên đường bảo vệ Tổ quốc.",
};

const introParagraphs = [
  "Website được xây dựng nhằm giới thiệu và tuyên truyền rộng rãi ý nghĩa về Hội trại Tòng quân, cũng như những dấu ấn lịch sử vẻ vang của công tác tuyển quân thông qua các nội dung tiêu biểu dưới đây.",
  "Nhằm tuyên truyền, giáo dục truyền thống cách mạng vẻ vang của Đảng, dân tộc, Quân đội, địa phương và đơn vị nâng cao ý thức trách nhiệm của công dân trong nhiệm vụ xây dựng và bảo vệ Tổ quốc; thể hiện sự quan tâm, chăm lo của cấp ủy Đảng, chính quyền, Mặt trận Tổ quốc và các tổ chức chính trị - xã hội các cấp đến toàn thể công dân trúng tuyển, động viên khơi dậy sức trẻ, tính xung kích, tự giác cho công dân hăng hái thi hành nghĩa vụ Quân sự và thực hiện nghĩa vụ tham gia Công an nhân dân.",
  "Tạo điều kiện cho công dân trúng tuyển nghĩa vụ Quân sự và thực hiện nghĩa vụ tham gia Công an nhân dân năm 2026 được giao lưu, trao đổi, học tập kinh nghiệm trước khi nhập ngũ; phát huy vai trò xung kích của các tổ chức Đoàn, đoàn viên, công dân và của cả hệ thống chính trị góp phần củng cố, xây dựng nền quốc phòng toàn dân, an ninh nhân dân vững mạnh, xây dựng lực lượng vũ trang vững mạnh toàn diện, đáp ứng yêu cầu nhiệm vụ trong tình hình mới.",
];

function normalizeItems(section) {
  return section.items.map((item, index) => ({
    ...item,
    alt: item.alt || item.caption || `${section.title} - Hình ${index + 1}`,
    caption: item.caption || `${section.title} - Hình ${index + 1}`,
  }));
}

function normalizeBlocks(section, normalizedItems) {
  const srcToIndex = new Map(normalizedItems.map((item, index) => [item.src, index]));
  return (section.blocks || []).map((block) => {
    if (block.type === "text") {
      const normalizedParts = Array.isArray(block.parts)
        ? block.parts
            .map((part) => ({
              text: String(part?.text || ""),
              href: String(part?.href || ""),
            }))
            .filter((part) => part.text.length > 0)
        : [];

      return {
        type: "text",
        text: block.text || "",
        parts: normalizedParts,
      };
    }

    const index = srcToIndex.get(block.src);
    return {
      type: "image",
      src: block.src || "",
      alt: block.alt || block.caption || section.title,
      caption: block.caption || "",
      imageIndex: Number.isInteger(index) ? index : 0,
    };
  });
}

export const siteContent = {
  hero: {
    title:
      'Hội trại tòng quân năm 2026 - Chủ đề "Tuổi trẻ Xuân Thới Sơn - Tiếp bước cha anh, lên đường giữ nước"',
    subtitle: "TIỂU TRẠI PHẠM VĂN SÁNG",
    intro: introParagraphs,
  },
  sections: extractedData.sections.map((section) => {
    const items = normalizeItems(section);
    return {
      ...section,
      lead: sectionLeads[section.id] || "",
      items,
      blocks: normalizeBlocks(section, items),
    };
  }),
};
