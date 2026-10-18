# GLOSSARY

Domain terminology for **SleepOrDie**.

---

### Health & Vitality

- **HP (Health Points)**: ค่าพลังชีวิตของผู้ใช้ (100% ถึง 0%) สะท้อนความตรงต่อเวลาในการเข้านอน 
  - ก่อนเส้นตาย (T-30m ถึง T-0m): HP เต็ม 100%
  - เลยเส้นตาย (> T-0m): HP จะลดลงเรื่อย ๆ (ประมาณ 1.6% ต่อนาที จนหมด 0% ภายใน 60 นาที)
  - สีหลอดเลือด: เขียว (ปกติ) ➔ ส้ม (Lockdown) ➔ แดงกระพริบ (Critical) ➔ ดับ (0%)
- **Shutdown (0% HP)**: สภาวะที่ HP ลดจนเหลือ 0% หน้าจอดับสนิท (Blackout) บันทึก 1 ความล้มเหลว
- **Shutdown Strike (Stack)**: แต้มความล้มเหลวสะสม (สูงสุด 5 ครั้ง) หากสะสมครบ 5 ครั้ง บัญชีจะถูกเปลี่ยนสถานะเป็น Disabled Account
- **Stack Decay**: กลไกการลดหย่อนแต้มความล้มเหลว โดยการทำ Streak นอนตรงเวลาต่อเนื่องครบ 7 วัน จะลบ 1 Stack ออก
- **Disabled Account (Permadeath)**: สถานะที่บัญชีผู้ใช้ถูกระงับถาวรเมื่อทำครบ 5 Shutdown Strikes

---

### Screen Stages & Progression

- **Alert Stage (T-30m)**: ช่วงแจ้งเตือนล่วงหน้า 30 นาทีก่อนเส้นตายเข้านอน HP 100% ส่งเสียงแจ้งเตือนเบา ๆ
- **Lockdown Stage (T-15m)**: ช่วงเร่งเตือน 15 นาทีก่อนเส้นตาย HP 100% หน้าจอเปลี่ยนเป็นโทนส้ม มีตัวเลขนับถอยหลังขนาดใหญ่
- **Sleep Stage (T-0m)**: ช่วงเส้นตายเข้านอน เริ่มเปิดเสียงไซเรน/นาฬิกาปลุกวนลูป บังคับให้ผู้ใช้กด "ยืนยันเข้านอน"
- **Sleep Verifying Window**: ช่วงเวลา 10 นาทีหลังจากผู้ใช้กดยืนยันเข้านอน ระบบจะรอให้ Discord Bot ตรวจสอบว่าผู้ใช้ Offline หรือ Idle จริง หากยัง Online จะยกเลิกสถานะนอนและหัก HP ต่อทันที
- **Shutdown Screen**: จอดำสนิท (0% HP) พร้อมบันทึก 1 Stack

---

### Progression & Items

- **Days Survived**: จำนวนวันรอดชีวิตสะสม (Streak) ที่นอนตรงเวลาสำเร็จโดยไม่เกิด Shutdown
- **Time Extension Ticket**: ตั๋วขยายเวลา 30 นาที ได้รับ 1 ใบต่อทุก 7 วันรอดชีวิต จำกัดการใช้คืนละ 1 ใบในยามฉุกเฉิน

---

### External Detection

- **Target (Discord User)**: บัญชีผู้ใช้ Discord ที่ผูกไว้กับระบบ เพื่อให้ Discord Presence Worker ตรวจสอบสถานะการใช้งาน
- **Discord Presence Worker**: Microservice (Node.js) ที่ดึงสถานะ Real-time Presence จาก Discord Gateway API แล้วส่ง Webhook อัปเดตกลับมายัง Laravel Backend
