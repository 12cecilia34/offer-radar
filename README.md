# Offer Radar

一个公开、无需登录的跨国校招岗位雷达。用户可以在浏览器本地上传并解析
PDF、DOCX 或 TXT 简历，设置中国、英国、加拿大的求职偏好，查看匹配原因、
英国 Sponsor 核验结果，并跟踪收藏和申请状态。

## Architecture

- Frontend: React + Vite, hosted on GitHub Pages
- API: Cloudflare Worker
- Personal data: browser localStorage; resumes are never uploaded
- Job data: official Greenhouse, Lever, Ashby, Tencent and employer career sources

## Development

Requires Node.js `>=22.13.0`.

```bash
npm install
npm run dev
npm run build
```

Deploy the API after authenticating Wrangler:

```bash
npm run deploy:api
```

The production frontend calls `https://offer-radar-api.uceijk2.workers.dev`.
Set `VITE_API_BASE_URL` to override the API address for another environment.
