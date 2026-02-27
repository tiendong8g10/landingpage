# Landing Page Hội trại tòng quân 2026

Landing page 1 trang cuộn dọc, hiển thị 4 phần nội dung chính:
- Quân chủng Phòng không – Không quân
- Các hiện vật
- Không gian văn hoá Hồ Chí Minh
- Các hình ảnh tuyển quân

## Yêu cầu
- Node.js 18+
- Python 3

## Chạy local
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Test
```bash
npm run test
```

## Cập nhật ảnh và chú thích từ DOCX
Đặt 4 file `.docx` trong thư mục gốc project, sau đó chạy:

```bash
npm run extract:assets
```

Lệnh này sẽ:
- trích xuất ảnh vào `public/images/<section-id>/`
- tạo dữ liệu tại `generated/content-data.json`

## Quy trình GitHub -> Vercel
1. Đưa code lên GitHub repository.
2. Vào Vercel, chọn `Add New Project` và import repository.
3. Vercel tự nhận diện Vite:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy.
