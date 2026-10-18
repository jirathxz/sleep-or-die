# SleepOrDie - Tech Stack & Libraries

ตารางสรุปรายการ Library / Package สำหรับโปรเจกต์ **SleepOrDie** เพื่อพัฒนาระบบตั้งเวลาแจ้งเตือนการนอนและ Gamification

---

## สรุปรายการ Library / Package

| Library / Package | หน้าที่การทำงาน | ความสำคัญ | ฝั่งการทำงาน |
| :--- | :--- | :---: | :---: |
| [Howler.js](https://howlerjs.com/) | เล่นเสียงปลุก Loop, ควบคุม Volume, Fade in/out | **สูงมาก** | Frontend |
| [Laravel WebPush](https://github.com/laravel-notification-channels/webpush) | ส่ง Web Push Notification ไปยัง Browser | **สูงมาก** | Backend |
| [Laravel Scheduler](https://laravel.com/docs/13.x/scheduling) | ตรวจสอบเวลาปลุกและจัดการงานตามเวลา (Cron/Schedule) | **สูงมาก** | Backend |
| [Laravel Queue + Redis](https://laravel.com/docs/13.x/queues) | ประมวลผลคิวการแจ้งเตือนและรันงานเบื้องหลังแบบ Asynchronous | **สูง** | Backend / Infra |
| [Zustand](https://zustand.docs.pmnd.rs/) | จัดการ Global State ของนาฬิกา, นับถอยหลัง และ UI State | **สูง** | Frontend |
| [date-fns](https://date-fns.org/) | จัดการคำนวณวัน เวลา และ Timezone | **สูง** | Frontend |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | แปลงเว็บให้เป็น Progressive Web App (Offline & Push support) | **สูง** | Frontend / Build |
| [Laravel Reverb](https://laravel.com/docs/13.x/reverb) | ระบบ Real-time WebSocket ส่ง Events ทันทีแบบ Low-latency | **ปานกลาง** | Backend / Fullstack |
| [Motion](https://motion.dev/) | ทำ Interactive Animation บน UI และเอฟเฟกต์ Gamification | **ปานกลาง** | Frontend |
| [Recharts](https://recharts.org/) | แสดงผลกราฟสถิติการนอน, EXP และ Streak ประจำสัปดาห์/เดือน | **ปานกลาง** | Frontend |

---

## รายละเอียดเชิงสถาปัตยกรรม (Architecture Breakdown)

### 1. Core Sleep & Alarm Engine (ความสำคัญ: สูงมาก)
- **Laravel Scheduler (`schedule:run`):** หัวใจหลักในการ trigger เช็คเงื่อนไขเวลาเข้านอน/ตื่นนอนของผู้ใช้งาน
- **Laravel WebPush:** แจ้งเตือนผู้ใช้ผ่าน Browser แม้จะไม่ได้เปิดหน้าเว็บทิ้งไว้ (จำเป็นสำหรับ Web App)
- **Howler.js:** Engine สำหรับเล่นเสียงปลุก มีความเสถียรสูง รองรับ audio unlock บน mobile browser และการ fade-in เพื่อไม่ให้ผู้ใช้ตกใจ

### 2. State & Background Processing (ความสำคัญ: สูง)
- **Laravel Queue + Redis:** ป้องกันไม่ให้การส่ง notification หรือคำนวณ penalty/EXP มาบล็อก request ปกติ
- **Zustand:** จัดการ state ของ timer / sleep tracking บน React ได้เบาและเร็วกว่า Context API
- **date-fns:** คำนวณ delta เวลา, sleep debt, bed time target อย่างแม่นยำ
- **vite-plugin-pwa:** รองรับ Service Worker, App Manifest เพื่อให้ติดตั้งบนมือถือได้เสมือน Native App

### 3. Gamification & User Experience (ความสำคัญ: ปานกลาง)
- **Laravel Reverb:** สำหรับ sync สถานะข้ามอุปกรณ์แบบ real-time (เช่น กดยืนยันนอนบนมือถือ แล้วจอคอมอัปเดตทันที)
- **Motion (Framer Motion):** สร้าง transition ตอนหลอดเลือด (HP) ลดลง, เลเวลอัป, หรือเอฟเฟกต์ Game Over ("Die")
- **Recharts:** Dashboard สรุปคุณภาพการนอนและประวัติ Streak เพื่อกระตุ้นวินัย
