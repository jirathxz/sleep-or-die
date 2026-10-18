# ADR-0001: SleepOrDie Core Engine, Stages, and Verification Architecture

## Status
Accepted

## Context
SleepOrDie เป็นแอปพลิเคชันเพื่อปรับพฤติกรรมการนอนที่มีกลไก Gamification แบบเข้มงวด (Hardcore accountability) ปัญหาสำคัญคือเบราว์เซอร์ไม่สามารถบังคับปิดเครื่องคอมพิวเตอร์ (OS Shutdown) หรือตรวจจับการใช้งานนอกเว็บได้โดยตรง หากอาศัยเพียงคำสัญญาของผู้ใช้อาจทำให้เกิดการโกงได้ง่าย

## Decision
1. **Screen Progression & HP Drain Model:**
   - **Alert Stage (T-30m):** แจ้งเตือนล่วงหน้า 30 นาที (HP 100%)
   - **Lockdown Stage (T-15m):** บีบการใช้งานหน้าจอ เตือนโทนส้ม มีเวลานับถอยหลัง (HP 100%)
   - **Sleep Stage (T-0m):** ถึงเส้นตายเข้านอน เล่นเสียงไซเรน/นาฬิกาปลุกลูปผ่าน Howler.js บังคับกด "ยืนยันเข้านอน"
   - **Post Deadline (> T-0m):** HP จะลดลงนาทีละ ~1.6% (หมด 0% ภายใน 60 นาที) หลอดเลือดเปลี่ยนเป็นแดงกระพริบ
   - **Shutdown Stage (0% HP):** หน้าจอดับสนิท (Blackout) บันทึก 1 Shutdown Strike/Stack
2. **Account Disabled (Permadeath Policy):**
   - การสะสมครบ **5 Shutdown Strikes** จะทำให้บัญชีถูก **Disabled Account** อย่างถาวร (หน้าจอแสดงเป็น Digital Tombstone บันทึกสถิติสูงสุดและตัดสิทธิ์การใช้งาน)
   - **Stack Decay:** การรักษา Streak นอนตรงเวลาต่อเนื่องครบ 7 วัน จะลบล้าง 1 Strike
3. **Discord Presence Verification:**
   - เพื่อป้องกันการเปิดเว็บทิ้งไว้แล้วแอบเล่นคอมพิวเตอร์ต่อ เมื่อผู้ใช้กดยืนยันเข้านอน ระบบจะเปิดช่วงเวลา **Verifying Window 10 นาที**
   - ใช้ **Discord Presence Worker (Node.js/discord.js)** คอยตรวจจับสถานะของ Discord Target หากตรวจพบว่า Target ยัง Online หรือ Active อยู่ จะยกเลิกสถานะนอนและหัก HP ต่อทันที
4. **Time Extension Ticket:**
   - ให้สิทธิ์ยืดเวลาเส้นตาย 30 นาที คืนละไม่เกิน 1 ใบ ได้รับจากการทำ Streak ครบทุก 7 วัน

## Considered Options
- **Native C++ Companion App Only:** ให้สิทธิ์ Shutdown เครื่อง OS จริง แต่มีข้อจำกัดเรื่อง OS Compatibility (Windows/macOS/Linux) และความยากในการแจกจ่าย executable จึงเลื่อนเป็นเฟส 2
- **Self-Report Only (ไม่มีการตรวจสอบ):** ง่ายในการพัฒนา แต่ขัดแย้งกับ Core Concept "Sleep or Die" เพราะขาดความกดดันและการบังคับใช้อย่างจริงจัง
