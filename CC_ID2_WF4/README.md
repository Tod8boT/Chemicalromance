# WF4: Auto Storage System

Auto-upload Telegram media to Cloudinary with cataloging.

## Quick Start

1. Import `Auto_Storage_Webhook.json` to n8n
2. Configure: Telegram Bot, Cloudinary API, Google Sheets
3. Send photo/video to bot → Auto-stored with confirmation

## Features

- Auto-detect photo/video
- Upload to organized folders (CREMO/auto_storage/2025-11/photos)
- Log to Google Sheets (19 fields)
- Send confirmation with catalog ID

## Folder Structure

```
CREMO/auto_storage/
├── 2025-11/
│   ├── photos/
│   └── videos/
```

**Status:** ✅ Production Ready
