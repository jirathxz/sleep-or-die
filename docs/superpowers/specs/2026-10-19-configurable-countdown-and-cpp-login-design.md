# Design Document: Configurable Emergency Countdown & C++ Win32 Login

## 1. Intent & Goal
- อนุญาตให้ผู้ใช้กำหนดเวลานับถอยหลังฉุกเฉิน (Emergency Countdown) ได้เองผ่านหน้าเว็บ Settings (ค่าเริ่มต้นเปลี่ยนจาก 30 วิ เป็น 60 วินาที)
- ทำให้โปรแกรม C++ (`SleepOrDieGuard.exe`) ซิงค์เวลานี้ไปใช้งานจริงในการคำนวณ HP และการนับถอยหลังก่อนสั่ง Sleep/Shutdown
- เพิ่มระบบยืนยันตัวตน (Authentication) ให้กับโปรแกรม C++ ผ่าน Win32 Login Dialog โดยผู้ใช้ต้องล็อกอินก่อนเริ่มเฝ้าระวัง

---

## 2. Architecture & Components

### 2.1 Backend (Laravel)
1. **Database Migration:**
   - เพิ่มคอลัมน์ `emergency_countdown_seconds` (integer, default: 60) ในตาราง `users`
2. **API Endpoints:**
   - `POST /api/daemon/login`: ตรวจสอบ `email` และ `password` ของผู้ใช้ ส่งกลับ:
     ```json
     {
       "success": true,
       "user_id": 1,
       "token": "...",
       "bedtime_hour": 23,
       "bedtime_minute": 15,
       "wake_up_hour": 7,
       "wake_up_minute": 0,
       "emergency_countdown_seconds": 60
     }
     ```
   - `POST /api/presence/update`: ปรับปรุงให้ส่งข้อมูล config ล่าสุด (เช่น `emergency_countdown_seconds`, bedtime) กลับมาใน response เพื่อให้ C++ อัปเดตแบบเรียลไทม์
3. **Web Settings Controller:**
   - อัปเดต `SleepController::saveSettings` ให้รองรับการบันทึก `emergency_countdown_seconds` (10 - 300 วินาที)

### 2.2 Frontend (Inertia + React + Zustand)
1. **Store (`useSleepStore.ts`):**
   - เพิ่ม `emergency_countdown_seconds` (default: 60) ใน State
   - ปรับการคำนวณ HP และการนับถอยหลังช่วง Breach และ Simulation 3-2-1 ให้ใช้ตัวแปร `emergency_countdown_seconds` แทนตัวเลข 30 เดิม
2. **Settings Page (`settings.tsx`):**
   - เพิ่ม Input สำหรับตั้งค่า "เวลานับถอยหลังฉุกเฉิน (วินาที)" ค่าตั้งต้น 60 วินาที

### 2.3 Desktop Daemon (C++ Win32)
1. **Win32 Native Login Dialog:**
   - เมื่อเปิดโปรแกรม หากยังไม่มี `token` หรือ `user_id` ใน `config.json` ให้แสดงหน้าต่าง Dialog ถาม Email และ Password
   - ส่ง HTTP POST ไปยัง `/api/daemon/login` ผ่าน WinHTTP
   - หากสำเร็จ ให้บันทึก `user_id`, `token`, `emergency_countdown_seconds` ลง `config.json` แล้วเริ่มทำงาน
2. **Configurable Countdown:**
   - เพิ่มฟิลด์ `emergencyCountdownSeconds` (default: 60) ใน `DaemonConfig`
   - ปรับ `RunSimulation321()` ให้นับถอยหลังตาม `config.emergencyCountdownSeconds`
   - ปรับ `DaemonLoop()` ในช่วง `SleepStage::Sleep` ให้คำนวณ HP และเวลานับถอยหลังจาก `config.emergencyCountdownSeconds`
3. **System Tray Integration:**
   - เพิ่มเมนูคลิกขวาที่ Tray: "🔑 เข้าสู่ระบบใหม่ (Switch User)" เพื่อเปิด Login Dialog ได้เมื่อต้องการ

---

## 3. Scope & Edge Cases
- **Offline / Network Fail:** หากเชื่อมต่อเซิร์ฟเวอร์ไม่ได้ขณะล็อกอิน แจ้งเตือนข้อผิดพลาดใน Dialog ชัดเจน
- **Token Persistence:** เมื่อล็อกอินสำเร็จครั้งแรก จะเก็บค่าไว้ใน `config.json` ไม่ต้องล็อกอินซ้ำทุกครั้งที่รันเครื่อง
- **Fallback Countdown:** หากไม่ได้ต่อเน็ต ให้ใช้ค่าเริ่มต้น 60 วินาทีเสมอ

---

## 4. Next Step
เมื่ออนุมัติแบบแปลนนี้ จะดำเนินการสร้าง Implementation Plan ละเอียด (ตามหลัก TDD / Verification) ด้วย `superpowers:writing-plans`
