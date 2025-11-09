# n8n Workflows

โฟลเดอร์นี้เก็บ n8n workflow definitions ทั้งหมด

## โครงสร้าง

```
workflows/
├── README.md                    # เอกสารนี้
├── examples/                    # ตัวอย่าง workflows
│   ├── facebook-webhook.json    # Facebook Trigger + Webhook
│   └── ...
└── templates/                   # Templates ที่ใช้บ่อย
```

## วิธีใช้งาน

### Import Workflow เข้า n8n

1. เปิด n8n UI
2. คลิก **Workflows** → **Import from File**
3. เลือกไฟล์ `.json` จากโฟลเดอร์นี้
4. ตั้งค่า credentials ที่จำเป็น
5. Activate workflow

### Export Workflow จาก n8n

1. เปิด workflow ใน n8n
2. คลิก **...** (menu)
3. เลือก **Export**
4. Save ไฟล์ในโฟลเดอร์นี้
5. Commit และ push ขึ้น GitHub

## Best Practices

- ใช้ชื่อไฟล์ที่อธิบายตัวเองได้ (e.g., `facebook-webhook-to-slack.json`)
- เพิ่ม description ใน workflow metadata
- ลบข้อมูล sensitive (API keys, tokens) ก่อน commit
- Test workflow ก่อน push

## Resources

- [n8n Documentation](https://docs.n8n.io)
- [n8n Community](https://community.n8n.io)
- [n8n Workflow Templates](https://n8n.io/workflows)
