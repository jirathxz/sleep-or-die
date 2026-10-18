# 🛡️ SleepOrDie - Native Windows Desktop Guard

แอปพลิเคชันแบ็คกราวด์ฝังเครื่อง Windows สำหรับตรวจจับพฤติกรรมการใช้งานหน้าจอ, ยิงเสียงสัญญาณเตือนตามช่วงเวลา (Progress Alert Stages) และสั่งล็อคเครื่อง / ปิดเครื่องอัตโนมัติเมื่อละเมิดเวลานอนจน HP เหลือ 0%

---

## 📂 โครงสร้างโฟลเดอร์ (`desktop-daemon/`)

| ไฟล์ | หน้าที่ |
| :--- | :--- |
| `SleepOrDieGuard.exe` | ตัวแอปหลัก C++ แบบ Native ประสิทธิภาพสูง ไม่กินแรม ไม่ต้องลง runtime เพิ่ม |
| `main.cpp` | ซอร์สโค้ด C++ (ใช้ Win32 API: `GetLastInputInfo`, `LockWorkStation`, `Beep`) |
| `daemon.py` | ตัวสำรองภาษา Python (Zero-dependency ใช้ `ctypes` + `winsound`) |
| `build.bat` | สคริปต์คอมไพล์ C++ ด้วย MSVC (`cl.exe`) ให้เป็น `.exe` |
| `run-daemon.bat` | ดับเบิ้ลคลิกเพื่อรันตัวตรวจจับสถานะทันที |
| `test-daemon.bat` | ดับเบิ้ลคลิกเพื่อทดสอบจำลองนับถอยหลัง **3 - 2 - 1** และการลด HP จนถึงการล็อคเครื่อง |
| `config.json` | ไฟล์ตั้งค่าเวลานอน, เปิด/ปิดเสียง, และเลือกระหว่างล็อคหน้าจอหรือปิดเครื่อง |

---

## ⏱️ ขั้นตอนการทำงาน (Progress Stages: Alert ➔ Lockdown ➔ Sleep ➔ Shutdown)

แอปจะตรวจสอบเวลานาฬิกาของเครื่องเทียบกับเวลาเป้าหมาย และตรวจสอบการขยับเมาส์/แป้นพิมพ์แบบ Real-time:

```
[Normal] ➔ [T-30m: Alert] ➔ [T-15m: Lockdown] ➔ [T-0m: Sleep Deadline] ➔ [0% HP: Shutdown]
```

### 1. 🟡 Alert Stage (T-30 นาที ก่อนเวลานอน)
- **เสียงเตือน:** เสียง Chime คู่โน้ตสูง 2 จังหวะ (`Beep 587Hz -> 880Hz`)
- **การแจ้งเตือน:** แจ้งเตือนข้อความเตือนให้ผู้ใช้เริ่มเคลียร์งาน, บันทึกไฟล์ และเตรียมตัวพักสายตา

### 2. 🟠 Lockdown Stage (T-15 นาที ก่อนเวลานอน)
- **เสียงเตือน:** เสียงจังหวะการเต้นของหัวใจถี่เร่งเร้า (`Heartbeat Beep 440Hz`)
- **การแจ้งเตือน:** เตือนให้ปิดแอปพลิเคชันทั้งหมด, ลุกจากโต๊ะ และเตรียมตัวเข้านอน

### 3. 🔴 Sleep Deadline Stage (เมื่อถึงหรือเลยเวลานอน)
- **ตรวจจับพฤติกรรม (Win32 Anti-Evasion):** 
  - ใช้ `GetLastInputInfo()` สแกนการขยับเมาส์หรือการพิมพ์คีย์บอร์ด
  - หากพบว่าผู้ใช้ยังนั่งเล่นคอมพิวเตอร์อยู่ (Idle time < 30 วินาที)
  - ระบบจะยิงเสียงหวอฉุกเฉิน (`Emergency Siren 988Hz -> 1318Hz`) ทันที
  - **หัก HP ผู้ใช้ทีละ 5% - 20% ทุกๆ รอบที่ตรวจพบว่ายังไม่ยอมนอน!**

### 4. 💀 Shutdown / Disciplinary Lockdown Stage (เมื่อ HP ลดเหลือ 0%)
- **เสียงเตือน:** เสียงลดความถี่แบบ Power-down (`659Hz -> 494Hz -> 330Hz -> 165Hz`)
- **การลงโทษ (Enforcement):**
  - **LockWorkStation:** ล็อคหน้าจอ Windows ทันที เพื่อบังคับให้ผู้ใช้หยุดใช้เครื่อง
  - **Windows Shutdown (ตัวเลือกเสริม):** สั่ง `shutdown /s /t 60` เพื่อสั่งปิดเครื่อง PC ภายใน 60 วินาที

---

## 🚀 วิธีการใช้งาน

### 1. วิธีรันเฝ้าระวังปกติ (รันตอนเปิดเครื่องหรือก่อนทำงาน)
- ดับเบิ้ลคลิกที่ไฟล์ **`run-daemon.bat`** (หรือพิมพ์ `SleepOrDieGuard.exe` ใน Terminal)

### 2. วิธีทดสอบจำลองเวลานอน 3 - 2 - 1 ทันที
- ดับเบิ้ลคลิกที่ไฟล์ **`test-daemon.bat`**
- หรือรันคำสั่ง:
  ```cmd
  SleepOrDieGuard.exe --test
  ```
  *(จะนับถอยหลัง 3.. 2.. 1.. แจ้งเตือนเสียงหวอ ลดเลือด HP จนเหลือ 0% และล็อคหน้าจอ Windows ให้เห็นการทำงานทันที)*

### 3. การตั้งค่าใน `config.json`
```json
{
  "bedtime_hour": 23,
  "bedtime_minute": 15,
  "enable_audio": true,
  "lock_workstation_on_breach": true,
  "enforce_system_shutdown": false,
  "idle_threshold_seconds": 30
}
```
- `bedtime_hour`: ชั่วโมงที่ต้องนอน (เช่น 23 สำหรับ 23:00)
- `bedtime_minute`: นาทีที่ต้องนอน (เช่น 15)
- `lock_workstation_on_breach`: สั่งล็อคหน้าจอเมื่อโดนลงโทษ (`true`/`false`)
- `enforce_system_shutdown`: สั่งปิดเครื่องคอมพิวเตอร์จริงเมื่อ HP เหลือ 0% (`true`/`false`)
