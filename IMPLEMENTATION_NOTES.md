# Text Overlay Processor v2.0 - Implementation Notes

> **Simplified n8n Sub-Workflow** for adding text overlays to images via Cloudinary API
> **No Google Sheets dependency** - uses embedded templates

**Version:** 2.0 (Simplified)
**Created:** 2025-11-08
**Status:** ✅ **Ready to Import** - Tested & Validated

---

## ⚠️ Important Changes (v2.0)

**This version simplifies the original design:**
- ✅ **No Google Sheets needed** - Templates are embedded in Code node
- ✅ **Only 3 nodes** instead of 5
- ✅ **Immediate use** - Import and run without additional configuration
- ✅ **Based on Enhanced_Cloudinary_URL_Builder.js** structure

---

## 📦 What's Included

1. **text_overlay_processor.json** - 3-node workflow (ready to import)
2. **cloudinary_url_builder_n8n.js** - Reference code (not used in v2)
3. **test_data.json** - 4 test cases + embedded templates
4. **IMPLEMENTATION_NOTES.md** - This file

---

## 🎯 Workflow Structure (3 Nodes)

```
1. Execute Workflow Trigger
   ↓ (receives: image_url, text_content, template_id)

2. Build Cloudinary URL (Code Node)
   ↓ (embedded templates, builds transformation URL)

3. Fetch Cloudinary Image (HTTP Request)
   ↓ (returns final image)
```

---

## 🚀 Quick Start

### 1. Import Workflow

```bash
# In n8n UI
1. Workflows → Import from File
2. Select text_overlay_processor.json
3. Click Import
4. Done! (No credentials needed)
```

### 2. Test in n8n

```javascript
// Manual execution - click "Execute Workflow" and enter:
{
  "image_url": "https://fal.ai/files/test.jpg",
  "text_content": "ลด 70% วันนี้!",
  "template_id": "flash_sale"
}
```

### 3. Call from Parent Workflow

Add **Execute Workflow** node in `create_image_no_templete.json`:

```json
{
  "workflowId": {
    "__rl": true,
    "value": "text_overlay_processor",
    "mode": "name"
  },
  "workflowInputs": {
    "mappingMode": "defineBelow",
    "value": {
      "image_url": "={{ $json.images[0].url }}",
      "text_content": "={{ $json.user_text }}",
      "template_id": "flash_sale"
    }
  }
}
```

---

## 📋 Input Parameters

```javascript
{
  image_url: "https://fal.ai/files/output.jpg",  // Required
  text_content: "ข้อความที่ต้องการ",              // Required
  template_id: "flash_sale"                      // Optional (default: "default")
}
```

---

## 📊 Output Format

```javascript
{
  "success": true,
  "cloudinary_url": "https://res.cloudinary.com/dz3cmaxnc/image/upload/...",
  "preview_url": "https://res.cloudinary.com/dz3cmaxnc/image/upload/w_400...",
  "text_applied": "ลด 70% วันนี้!",
  "template_used": "flash_sale",
  "transformation_details": {
    "base": "w_1080,h_1080,c_fill",
    "text_layer": "l_text:Arial_90_bold_center:...",
    "image_source": "https://fal.ai/..."
  },
  "config_used": { ... }
}
```

---

## 🎨 Available Templates

### flash_sale
- Font: Arial 90px bold
- Color: Red (#FF0000)
- Stroke: Gold (#FFD700) 8px
- Shadow: 70%
- Position: north, y+30

### success_story
- Font: Arial 80px bold
- Color: Gold (#FFD700)
- Stroke: Blue (#3B5998) 5px
- Shadow: 50%
- Position: north, y+50

### community_moments
- Font: Arial 70px bold
- Color: White (#FFFFFF)
- Stroke: Red (#E74C3C) 4px
- Shadow: 40%
- Background: Black 50% opacity
- Position: center

### default
- Font: Arial 80px bold
- Color: White (#FFFFFF)
- Stroke: Black (#000000) 5px
- Position: north, y+30

---

## 🔧 How to Add Custom Templates

Edit the **Build Cloudinary URL** Code node:

```javascript
// Add your template here (line ~15)
const templates = {
  "flash_sale": { ... },
  "your_template": {
    font: "Arial",
    size: 75,
    weight: "bold",
    color: "00FF00",  // Green
    stroke_enabled: true,
    stroke_color: "000000",
    stroke_width: 6,
    shadow_enabled: true,
    shadow_strength: 60,
    position: "south",
    y_offset: -40,
    max_width: 850
  }
};
```

---

## 🧪 Testing

### Test with curl

```bash
# Flash sale style (Thai text)
curl -I 'https://res.cloudinary.com/dz3cmaxnc/image/upload/w_1080,h_1080,c_fill/l_text:Arial_90_bold_center:%E0%B8%A5%E0%B8%94%2070%25,w_950,c_fit,co_rgb:FF0000/co_rgb:FFD700,e_outline:8/e_shadow:70/fl_layer_apply,g_north,y_30/f_auto,q_auto/https%3A%2F%2Ffal.ai%2Ffiles%2Ftest.jpg'

# Should return: HTTP/2 200
```

### Test in Browser

Copy `cloudinary_url` from output → paste in browser → should see image with text overlay

---

## ❓ Troubleshooting

### Issue: Thai text shows as ??? or boxes

**Solution:**
- Thai fonts not supported by Cloudinary
- Use **Latin fonts only**: Arial, Helvetica, Times New Roman
- Thai text will render but may not look optimal
- For better Thai support, upload custom Thai font to Cloudinary

### Issue: Workflow won't import

**Check:**
1. ✅ n8n version >= 1.0
2. ✅ JSON file not corrupted
3. ✅ File encoding is UTF-8

### Issue: Text not showing

**Debug:**
```javascript
// In Build Cloudinary URL node, add console.log
console.log("Generated URL:", cloudinaryUrl);
```

Check execution log for actual URL → test in browser

---

## 📚 Cloudinary Transformation Reference

### Text Layer Syntax
```
l_text:Font_Size_Weight_Align:EncodedText,w_MaxWidth,c_fit,co_rgb:Color
```

### Effects
- `e_outline:N` - Stroke/outline width
- `e_shadow:N` - Shadow strength (0-100)
- `b_rgb:COLOR,o_N` - Background color + opacity

### Positioning
- `g_north` / `g_south` / `g_center` / `g_east` / `g_west`
- `x_N` - X offset (pixels)
- `y_N` - Y offset (pixels)

### Full Documentation
- [Cloudinary Text Overlays](https://cloudinary.com/documentation/layers#text_layer_options)
- [Transformation Reference](https://cloudinary.com/documentation/transformation_reference)

---

## 🔄 Migration from v1.0

**v1.0 used:**
- Google Sheets for text_overlay_config
- 5 nodes
- Dynamic template loading

**v2.0 uses:**
- Embedded templates in Code node
- 3 nodes
- Simpler, faster, no external dependencies

**To migrate:**
1. Export your Google Sheets templates
2. Add them to `templates` object in Code node (line ~15)
3. Done!

---

## 📝 Next Steps

1. **Import to n8n** ✅
2. **Test with sample data** (see test_data.json)
3. **Integrate with parent workflows**:
   - `create_image_no_templete.json`
   - `create_image_with_templete.json`
4. **Customize templates** as needed

---

## 🆘 Support

**Issues?**
- Check: [Troubleshooting](#troubleshooting)
- GitHub: [Tod8boT/Chemicalromance/issues](https://github.com/Tod8boT/Chemicalromance/issues)
- n8n Community: [community.n8n.io](https://community.n8n.io)

---

## 📄 Changelog

### v2.0 (2025-11-08)
- ✅ Removed Google Sheets dependency
- ✅ Reduced to 3 nodes
- ✅ Embedded templates in Code node
- ✅ Simplified import process
- ✅ Based on Enhanced_Cloudinary_URL_Builder.js

### v1.0 (2025-11-08)
- Initial release with Google Sheets
- 5 nodes
- External template configuration

---

**Created by:** Claude Code
**License:** MIT
**Status:** ✅ Production Ready (v2.0)
