# Nano Banana Image Edit Guide

## Overview

AI-powered object replacement for CREMO product mockups using Nano Banana API.

## Features

- **Object Detection:** Auto-detect mock objects in images
- **Replacement:** Replace with real CREMO products
- **Perspective Matching:** Match angle and lighting automatically
- **Quality Control:** AI ensures natural-looking results

## Product Catalog

### CREMO Freezers

1. **ตู้ไอติมครีโม aw-c 5**
   - Dimensions: 1.2m x 0.65m
   - Drive ID: 1O5Fkoalc17BdOqWQgjhn8wQDW5SNl4Uw

2. **ตู้ไอติมครีโม aw-l 4**
   - Dimensions: 1.0m x 0.60m
   - Drive ID: 1W5VQdqZqGUS0wVMSjb8oFHWiZiPwFTA3

## Workflow

1. **User:** `/edit_image`
2. **Bot:** Shows product keyboard
3. **User:** Selects product
4. **Bot:** "Upload image with mock object"
5. **User:** Uploads image
6. **System:**
   - Gets Google Drive direct URL
   - Calls Nano Banana API
   - Replaces object
7. **Bot:** Sends edited image

## API Request Format

```json
{
  "source_image": "https://original-image.jpg",
  "reference_image": "https://drive.google.com/uc?export=download&id=...",
  "prompt": "Replace mock object with CREMO freezer, match perspective and lighting",
  "mode": "object_replacement",
  "settings": {
    "preserve_background": true,
    "match_perspective": true,
    "match_lighting": true
  }
}
```

## Use Cases

### Case 1: Store Mockup
Replace mockup freezer in store photo with real CREMO freezer model.

### Case 2: Social Media Post
Add CREMO product to lifestyle photo replacing placeholder.

### Case 3: Marketing Material
Update old product images with new models.

## Best Practices

1. **Clear Mock Object:** Ensure mock is clearly visible
2. **Good Lighting:** Well-lit source images work best
3. **Similar Angle:** Reference product should match perspective
4. **High Resolution:** Use at least 1080px width

## Troubleshooting

**Poor replacement quality:**
- Use higher resolution images
- Ensure good lighting contrast
- Select product with similar dimensions

**API timeout:**
- Check Nano Banana API key
- Verify image URLs are accessible
- Reduce image size if too large

---

**Version:** 1.0.0
**Last Updated:** November 10, 2025
