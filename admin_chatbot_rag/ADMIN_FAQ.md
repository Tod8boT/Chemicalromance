# ❓ ADMIN FAQ - คำถามที่ถามบ่อยสำหรับ Admin

**Updated:** 2025-11-11 15:55 UTC  
**Category:** Admin Support Documentation  
**For:** CREMO System Administrators  

---

## 🔧 **System Status & Monitoring**

### **Q: วิธีตรวจสอบสถานะ workflows ทั้งหมด**
**A:** ใช้คำสั่งใน admin chatbot:
```
/status all
/workflows health
/check errors
```
หรือดูใน CURRENT_STATUS.md สำหรับข้อมูลล่าสุด

### **Q: Workflow ไหนที่ active อยู่ตอนนี้?**
**A:** Currently deployed workflows:
- ✅ WF1: Text Control (QEyEzI9sWt4PBCOc)
- ✅ WF3: Logo Placement (Dt6QetvGrKhjkjRp)  
- ✅ WF5: Integration (wLGa6vjr9QzH2z2H)
- ✅ WF2: URL Builder (9m7TFGMc1UUwl48W)
- ✅ WF4: Auto Storage (FHk0IJVDIUIoSbv0)
- ✅ WF6: Image Edit (dpxAENjM9uOhqbey)

### **Q: วิธีดู error logs**
**A:** 
1. เข้า n8n UI: http://host.docker.internal:5678
2. ไป Executions tab
3. Filter by \"error\" status
4. หรือใช้ admin bot: `/logs errors last 24h`

---

## 🎨 **Arc Curve Feature**

### **Q: Arc curve คืือะไร? ทำไมสำคัญ?**
**A:** Arc curve เป็นฟีเจอร์เฉพาะของ CREMO:
- **Range:** -180° ถึง +180°
- **Brand Identity:** เป็นเอกลักษณ์ของแบรนด์
- **Usage Goal:** เป้าหมาย >30% (ปัจจุบัน ~34% ✅)
- **Available in:** WF5 + WF2

### **Q: User บอกว่า arc curve ใช้ไม่ได้**
**A:** Troubleshooting steps:
1. ตรวจสอบว่าใช้ workflow WF5 หรือ WF2
2. ค่า angle ต้องอยู่ในช่วง -180 ถึง +180
3. ตรวจสอบ Google Sheets settings
4. Test ด้วย default value: +30°

---

## 👥 **User Support**

### **Q: User ไม่สามารถใส่ข้อความไทยได้**
**A:** Thai text troubleshooting:
1. ตรวจสอบ encoding: ต้องใช้ UTF-8
2. Font support: แนะนำ Mitr, Kanit, Sarabun
3. Check workflow: WF1 Text Control ทำงานปกติ
4. Test command: `/test thai ทดสอบภาษาไทย`

### **Q: รูปไม่ขึ้น/Upload ไม่ได้**
**A:** Image upload issues:
1. **Size limit:** รูป <20MB, วิดีโอ <50MB
2. **Formats:** JPG, PNG, WebP (รูป), MP4, MOV (วิดีโอ)
3. **Cloudinary status:** ตรวจ WF4 Auto Storage
4. **Network:** ตรวจ connection ระหว่าง Telegram-Cloudinary

### **Q: Text overlay ใช้เวลานาน**
**A:** Performance optimization:
1. **Normal time:** 3-6 วินาที
2. **Slow causes:** รูปใหญ่, network, multiple layers
3. **Check:** WF5 Integration workflow health
4. **Monitor:** ใช้ `/performance WF5`

---

## 🔧 **Technical Operations**

### **Q: วิธี restart workflow ที่มีปัญหา**
**A:** Workflow restart procedure:
```
1. เข้า n8n UI
2. หา workflow จาก ID
3. กด \"Deactivate\" แล้ว \"Activate\"
4. หรือใช้ admin bot: /restart WF5
```

### **Q: วิธีอัปเดต Google Sheets settings**
**A:** 
1. เข้า Google Sheets ที่เชื่อมกับ workflow
2. แก้ไขข้อมูลในคอลัมน์ที่ต้องการ
3. Workflow จะใช้ข้อมูลใหม่ทันที (no restart needed)
4. Test ด้วย sample user

### **Q: Credentials หมดอายุ ต้องทำยังไง**
**A:** Credential renewal:
```
1. n8n UI > Credentials section
2. หา expired credential (มีไอคอนแดง)
3. กด Edit > Re-authenticate
4. Test connection
5. Affected workflows จะกลับมาทำงานเอง
```

---

## 📊 **Analytics & Reporting**

### **Q: วิธีดู usage statistics**
**A:** Usage analytics:
```
Admin bot commands:
- /stats daily (รายวัน)
- /stats weekly (รายสัปดาห์)
- /stats features (การใช้ feature)
- /stats arc_curve (arc curve adoption)
```

### **Q: วิธีสร้างรายงานให้ผู้จัดการ**
**A:** Report generation:
1. ใช้ `/report monthly` (รายงานประจำเดือน)
2. `/report performance` (ประสิทธิภาพระบบ)
3. `/export data last_month` (export ข้อมูล)
4. หรือดูใน Google Sheets analytics

---

## 🚨 **Emergency Procedures**

### **Q: ระบบล่ม/ใช้ไม่ได้ทั้งหมด**
**A:** Emergency response:
```
1. ตรวจสอบ n8n instance: http://host.docker.internal:5678
2. ตรวจ internet connection
3. ตรวจ Telegram bot token
4. Contact developer team ด่วน
5. แจ้ง users ผ่าน Telegram channel
```

### **Q: User data หาย/ผิดพลาด**
**A:** Data recovery:
1. **Stop workflow** ที่เกี่ยวข้องทันที
2. Check Google Sheets backup
3. ดู execution history ใน n8n
4. Contact database admin
5. **Never** delete anything without backup

---

## 🔐 **Security & Privacy**

### **Q: User ขอลบข้อมูลตามกฎ PDPA**
**A:** PDPA compliance:
1. Verify user identity
2. ใช้ `/delete_user_data CHAT_ID`
3. Remove from Google Sheets
4. Clear execution logs
5. Confirm deletion via email/Telegram

### **Q: พบ suspicious activity**
**A:** Security incident:
1. Document everything
2. Block suspicious user: `/block CHAT_ID`
3. Check access logs
4. Report to security team
5. Monitor for similar patterns

---

## 📱 **Integration Issues**

### **Q: Cloudinary ขึ้น error**
**A:** Cloudinary troubleshooting:
1. ตรวจ API key status
2. ตรวจ quota/usage limits
3. Test manual upload
4. Check network connectivity
5. Contact Cloudinary support if needed

### **Q: Google Sheets ไม่ update**
**A:** Google Sheets issues:
1. ตรวจ service account permissions
2. ตรวจ sheet sharing settings
3. ตรวจ API quota
4. Re-authorize connection
5. Test with sample data

---

## 🎓 **Training & Best Practices**

### **Q: Admin ใหม่ต้องรู้อะไรบ้าง**
**A:** Admin onboarding checklist:
```
✅ อ่าน CURRENT_STATUS.md
✅ ทำความเข้าใจ 6 workflows
✅ เรียนรู้ admin bot commands
✅ ฝึก troubleshooting scenarios
✅ ดู permission ของตัวเอง
✅ รู้จัก escalation procedures
```

### **Q: Best practices สำหรับ admin**
**A:** 
```
✅ ตรวจสอบระบบทุกเช้า
✅ Monitor error rates daily
✅ Backup critical data weekly
✅ Update documentation เมื่อมีการเปลี่ยนแปลง
✅ Test workflows after updates
✅ Keep credentials secure
✅ Communicate changes to users
```

---

## 📞 **Escalation & Contacts**

### **Q: เมื่อไหร่ต้อง escalate**
**A:** Escalation triggers:
```
🚨 Immediate (Developer team):
- ระบบล่มทั้งหมด
- Data corruption
- Security breach
- API completely down

⚠️ Within 2 hours (Tech lead):
- Single workflow failure
- Performance degradation >50%
- Multiple user complaints
- Credential issues

📋 Next business day (Product team):
- Feature requests
- UI/UX improvements
- Analytics questions
- Documentation updates
```

---

**สำหรับคำถามที่ไม่อยู่ในนี้ ใช้ admin chatbot หรือ contact development team**

**Last Updated:** 2025-11-11 15:55 UTC  
**Next Review:** 2025-12-11
