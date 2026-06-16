# 🎴 고스톱

SVG 화투 2인 패스앤플레이 고스톱 게임

## 실행

```bash
npm install
npm run dev
```

## 배포 (Vercel)

```bash
npm run build
# Vercel에 dist 폴더 업로드 또는 GitHub 연동
```

## 기술 스택

- React 18 + Vite
- SVG 화투 (외부 이미지 없음)
- 모바일 최적화

## 규칙

- 광 3장→3점 / 4장→4점 / 5장→15점
- 열 5장→1점 (이후 +1)
- 홍단·청단 각 3장→3점
- 피 10장→1점 (이후 +1)
- 3점 이상 → 고/스톱 선택
