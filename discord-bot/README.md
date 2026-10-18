# SleepOrDie - Discord Presence Guard

Microservice สำหรับเชื่อมต่อ Discord Gateway เพื่อตรวจจับสถานะ (Presence) ของผู้ใช้เป้าหมายแบบ Real-time และส่ง Webhook กลับไปยัง Laravel API เมื่อผู้ใช้ฝ่าฝืนข้อตกลงในการนอน

---

## วิธีติดตั้งและเริ่มใช้งาน

### 1. สร้างบอทบน Discord Developer Portal
1. เข้าไปที่ [Discord Developer Portal](https://discord.com/developers/applications)
2. สร้าง Application ใหม่ และสร้าง Bot
3. ในแท็บ **Bot** -> ส่วน **Privileged Gateway Intents** ให้เปิดใช้งาน:
   - **PRESENCE INTENT** (สำคัญมาก สำหรับตรวจจับสถานะ Online/Activity)
   - **SERVER MEMBERS INTENT**
4. Copy Bot Token มาใช้งาน
5. เชิญบอทเข้า Discord Server ที่คุณและเป้าหมายอยู่ด้วย OAuth2 URL Generator (`bot` scope พร้อม permission อ่านข้อความ/ดูสมาชิก)

### 2. ตั้งค่า Configuration
คัดลอก `.env.example` เป็น `.env`:
```bash
cp .env.example .env
```
กำหนดค่าใน `.env`:
- `DISCORD_BOT_TOKEN`: Token ของบอท
- `TARGET_DISCORD_USER_ID`: Discord User ID ของเป้าหมาย (คลิกขวาที่ชื่อใน Discord แล้วเลือก "Copy User ID")
- `API_WEBHOOK_URL`: `http://127.0.0.1:8000/api/discord/presence-update`

### 3. เริ่มรัน Worker
```bash
npm install
npm start
```
