# DESIGN SYSTEM SPECIFICATION (DESIGN.md)
**Project:** SleepOrDie — Hardcore Sleep & Discipline Protocol  
**Style Architecture:** Minimalist Industrial Dark / Anti-AI Cliché System  
**Core Rules:** Dark/Gray 80% • White 20% • No Border • Perfect Border Radius • No Badge • Font: Kanit

---

## 1. ปรัชญาการออกแบบ (Design Philosophy & Manifesto)

ระบบการออกแบบนี้ถูกสร้างขึ้นเพื่อปฏิเสธความจำเจและข้อบกพร่องที่พบบ่อยใน **AI-Generated UI** โดยเน้นความสุขุม เรียบง่าย ทรงพลัง มีโครงสร้างที่ชัดเจน (Ergonomic Visual Hierarchy) และเหมาะสำหรับการใช้งานจริงในชีวิตประจำวัน ไม่สร้างความล้าทางสายตา (Visual Fatigue)

### กฎสัดส่วนสี 80/20 (The 80/20 Contrast Rule)
- **80% Dark & Neutral Grays:** พื้นที่ส่วนใหญ่ (Canvas, Surface Panels, Backgrounds, Muted Structure) ถูกจัดอยู่ในช่วงโทนสีเทาเข้มหลายระดับ เพื่อสร้างมิติและความลึกโดยไม่ต้องพึ่งพาเส้นขอบ
- **20% Crisp White & High-Contrast Accents:** พื้นที่ข้อมูลสำคัญ (Primary Value, Active Countdown, Core Action, Key Status) ใช้สีขาวสะอาดตา (#FFFFFF / #F4F4F5) หรือสีเน้นสถานะเฉพาะจุด เพื่อดึงสายตาไปยังสิ่งที่สำคัญที่สุดทันทีใน 1 วินาทีแรก

---

## 2. แก้ปัญหา 7 จุดสังเกตของ AI-Generated UI (Anti-Pattern Matrix)

| จุดสังเกตที่มักพบใน AI UI | ปัญหาที่เกิดขึ้น | กฎบังคับใช้ของ SleepOrDie (Solution Rule) |
| :--- | :--- | :--- |
| **1. Layout** | ยัดทุกข้อมูลใส่ Card ซ้ำ ๆ กันจนรก | **Fluid Tonal Planes:** เลิกใช้ Card ในทุกจุด ใช้การแบ่งกลุ่มข้อมูลด้วยพื้นที่ว่าง (Negative Space) และระดับสีพื้นผิว (Tonal Shift) ไม่ล้อมกรอบสิ่งที่ไม่มีปฏิสัมพันธ์ |
| **2. Spacing** | เว้นช่องไฟกว้างเกินไป ข้อมูลลอยกระจัดกระจาย | **Compact Proximity:** จัดระยะตาม Gestalt Principle สิ่งที่เกี่ยวข้องกันชิดกัน (Gap 8px–12px) ส่วนที่ต่างกันแยกด้วยระยะ 20px–32px พอดีกับสายตา ไม่สร้าง Void ขนาดใหญ่ |
| **3. Typography** | ตัวหนังสือใหญ่และหนา (ExtraBold/Black) แทบทุกบรรทัด | **Kanit Balanced Scale:** ใช้ Font **Kanit** จำกัดน้ำหนักหลักที่ 400 (Regular) และ 500 (Medium) อนุญาตให้ใช้ 600 (SemiBold) เฉพาะตัวเลขสถิติหรือหัวข้อหลักเท่านั้น |
| **4. Color** | สาด Gradient สีม่วง-น้ำเงิน หรือเรืองแสง (Glow) เลอะเทอะ | **Pure Dark/Gray Neutrality:** ห้ามใช้ Gradient สีม่วงนีออน ใช้สีเทาเนื้อแมตต์ (Matte Slate/Charcoal) สะอาด ไร้แสงสะท้อนหรือ Drop Shadow รกตา |
| **5. Visual Hierarchy** | ทุกอย่างโดดเด่นเท่ากัน สายตาไม่รู้จะโฟกัสตรงไหน | **Single Primary Focal Point:** มีพระเอกเพียงจุดเดียวต่อหน้าจอ (เช่น Countdown & Health Bar) ส่วนควบคุมอื่นทำหน้าที่เป็นบริบทเสริม (Subordinate) |
| **6. Components** | แปะ Badge / Chip / Icon ตกแต่งพร่ำเพรื่อ | **Strictly No Badge:** แบนการใช้ Badge/Tag แคปซูลซ้อนกัน แสดงสถานะด้วยข้อความตรงไปตรงมา หรือไฟจุดสถานะขนาด 6px (Status Dot) แทน |
| **7. UX Logic** | ดูสวยแต่คลิกยาก ขั้นตอนใช้งานไม่คล่องตัว | **Instant Kinetic Action:** ปุ่มกดขนาดพอดีนิ้ว (Min 44px) รองรับคีย์บอร์ดชอร์ตคัต ไม่ต้องคลิกซ้อนหลายขั้นตอนเพื่อยืนยันการนอน |

---

## 3. ระบบสี (Color Token System)

```
[ Canvas: #09090B ] ───────────────────────────────────────────── (Background 80%)
       │
       ├── [ Surface-1: #121215 ]  (Planes / Containers)
       ├── [ Surface-2: #18181B ]  (Interactive Elements / Hover)
       ├── [ Text-Muted: #71717A ] (Labels, Secondary Metadata)
       │
[ Crisp White: #FFFFFF ] ──────────────────────────────────────── (High Contrast 20%)
       │
       ├── [ Text-Primary: #FAFAFA ] (Headers, Numbers, Main Readings)
       └── [ Functional Accents ]
             ├── Safe: #10B981 (Subtle Emerald)
             ├── Warning: #F59E0B (Subtle Amber)
             └── Critical: #EF4444 (Subtle Crimson)
```

### Color Palette Specification:
- **Canvas (Default Background):** `#09090B` (Zinc-950)
- **Surface Elevation 1 (Containers/Planes):** `#121215`
- **Surface Elevation 2 (Controls/Buttons/Inputs):** `#18181B` (Zinc-900)
- **Surface Elevation 3 (Hover/Active states):** `#27272A` (Zinc-800)
- **Primary Text & Focal Accent (20%):** `#FFFFFF` / `#FAFAFA`
- **Secondary / Subdued Text:** `#A1A1AA` (Zinc-400)
- **Muted / Metadata Text:** `#71717A` (Zinc-500)

> 🚫 **ข้อห้ามเด็ดขาด (Prohibited):**
> - ห้ามใช้ขอบสีสว่าง (No 1px solid white/gray borders)
> - ห้ามใช้ Multi-color Gradient ฟุ้งกระจาย (No Purple/Cyan AI-glow)
> - ห้ามใช้ Box Shadow สีสดเรืองแสง

---

## 4. โครงสร้างเส้นขอบและการไล่ระดับมิติ (Border & Elevation: "No Border")

แนวคิด **"No Border"** ไม่ได้หมายถึงการทำให้องค์ประกอบกลืนหายไป แต่เป็นการแบ่งขอบเขตด้วย **Tonal Elevation (ความต่างของระดับสีเทา)**:

1. **Surface Separation:**
   - ใช้วิธีเปลี่ยนพื้นหลังจาก `#09090B` (Canvas) เป็น `#121215` (Container) เพื่อสร้างระนาบที่แยกกันอย่างเป็นธรรมชาติ
   - กรณีที่ต้องการแยกบรรทัดในตารางหรือรายการ ให้ใช้ `border-b border-white/[0.04]` (Opacity ต่ำมาก) หรือเว้นระยะ `gap` แทนเส้นขอบทึบ
2. **Elevated Surfaces:**
   - ใช้ Soft Ambient Shadow ที่โปร่งแสงและเป็นธรรมชาติ:
     `box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);`
3. **Interactive Focus State:**
   - เมื่อโฟกัส input หรือปุ่มกด ห้ามใช้กรอบหนา ใช้เพียงวงแหวนโปร่งแสงบางเบา `ring-1 ring-white/20`

---

## 5. การคำนวณความโค้งมนที่สมบูรณ์แบบ (Perfect Border Radius)

ความโค้งมนของมุมต้องมีความสอดคล้องทางคณิตศาสตร์ (Concentric Nested Radius Formula):

$$\mathbf{R_{\text{inner}} = R_{\text{outer}} - \text{Padding}}$$

หากนำกล่องที่มีความโค้งเท่ากันไปซ้อนข้างในกล่องอื่น จะเกิดความรู้สึกเบี้ยวทางสายตา ดังนั้นระบบนี้จึงกำหนดโทเค็นที่เคร่งครัด:

| ขนาด Token | ค่ารัศมี (Radius) | การนำไปใช้งาน (Usage) |
| :--- | :--- | :--- |
| `radius-outer` | `16px` (`rounded-2xl`) | Main Screen Containers, Outer Application Modules |
| `radius-surface` | `12px` (`rounded-xl`) | Sub-panels, Settings Dialogs, Health Display Pods |
| `radius-control` | `8px` (`rounded-lg`) | Action Buttons, Input Fields, Time Pickers |
| `radius-inner` | `4px` (`rounded`) | Inner Indicators, Metric Bars, Mini Progress Trackers |

> 🚫 **ข้อห้าม:** ห้ามใช้ `rounded-full` (มุมแคปซูลทรงยา) กับปุ่มทั่วไป เพื่อหลีกเลี่ยงภาพลักษณ์แบบของเล่นหรือ Badge สำเร็จรูป ให้ใช้ `rounded-lg` (8px) หรือ `rounded-xl` (12px) เท่านั้น

---

## 6. อักษรศาสตร์ (Typography System: Font Kanit)

ใช้ฟอนต์ **Kanit** (Google Fonts) ซึ่งมีความเป็นระเบียบ ทันสมัย และอ่านง่ายทั้งภาษาไทยและตัวเลขอังกฤษ

```css
font-family: 'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Hierarchy & Weights Scale:

| ลำดับ (Role) | ขนาด (Size) | น้ำหนัก (Weight) | สี (Color) | การใช้งาน |
| :--- | :--- | :--- | :--- | :--- |
| **Metric Display** | `48px` - `64px` | `500 Medium` | `#FFFFFF` | ตัวเลขนับถอยหลัง, เปอร์เซ็นต์พลังชีวิต |
| **Page Title** | `22px` - `26px` | `600 SemiBold` | `#FAFAFA` | หัวข้อหน้าจอ เช่น "ระบบควบคุมการนอน" |
| **Section Header** | `15px` - `17px` | `500 Medium` | `#F4F4F5` | ชื่อหมวดหมู่การตั้งค่า, ข้อมูลสุขภาพ |
| **Body / Readout** | `14px` | `400 Regular` | `#D4D4D8` | คำอธิบาย, ข้อมูลสรุป, ข้อความนำทาง |
| **Sub-text / Meta** | `12px` - `13px` | `300 Light / 400` | `#71717A` | เวลาเป้าหมาย, หน่วยกำกับ, สถิติสะสม |

### กฎสำคัญด้านตัวพิมพ์:
- **ห้าม Bold พร่ำเพรื่อ:** ข้อความทั่วไปและปุ่มกดใช้น้ำหนัก `400 Regular` หรือ `500 Medium` เท่านั้น ไม่ใช้ `700 Bold` หรือ `800 ExtraBold` กับข้อความยาว
- **ตัวเลขสถิติ (Tabular Numbers):** ใช้ CSS `font-variant-numeric: tabular-nums;` เพื่อไม่ให้ตัวเลขขยับสั่นขณะเวลานับถอยหลัง

---

## 7. กฎการไม่ใช้ Badge (The "No Badge" Standard)

AI มักติดการแปะ `<Badge>` แคปซูลสีฉูดฉาดไว้ตามมุมกล่องเพื่อบอกสถานะ ทำให้หน้าจอเหมือนแดชบอร์ดต้นแบบที่ยังไม่เสร็จ

### วิธีแสดงสถานะโดยไม่ใช้ Badge:
1. **Semantic Text Hierarchy:** ใช้ตัวอักษรและน้ำหนักบอกสถานะโดยตรง เช่น:
   - *แทนที่จะเป็น:* `<Badge variant="danger">5 Strikes</Badge>`
   - *ให้เป็น:* `ความเสี่ยงบัญชี: 5/5 ครั้ง` หรือ `Account Risk: 5/5 Strikes` (ใช้สีแดงเรียบที่ตัวเลข หรือตัวอักษรสีขาวกับคำบรรยายสีเทา)
2. **Minimal Status Dot (จุดไฟนำสายตา):**
   - ใช้ไฟสถานะทรงกลมขนาดเล็ก `size-2` (8px) แบบ Flat ข้างชื่อสถานะ:
     - 🟢 สีเขียว: ปกติ
     - 🟡 สีส้ม: ระยะเตือน
     - 🔴 สีแดง: ระยะวิกฤต หรือพลังชีวิตหมด
3. **Inline Metrics:** เขียนตัวเลขควบคู่กับ Label ในแถวเดียวกันโดยไม่ต้องมีกล่องแคปซูลหุ้ม

---

## 8. กฎความเป็นเอกภาพทางภาษาและข้อห้ามใช้วงเล็บ (Language Purity & No Parentheses Rule)

เพื่อความเป็นมืออาชีพ ความสะอาดของหน้าตา UI และความกระชับ ไม่ให้ดูเหมือนงานแปลดิบที่ยังไม่ได้ขัดเกลา ระบบมีข้อกำหนดด้านภาษาดังนี้:

### 1) ห้ามมีวงเล็บ `()` กำกับข้อความบนหน้าเว็บเด็ดขาด
- 🚫 **ห้าม:** ห้ามใส่วงเล็บกำกับคำแปลสองภาษา หรือข้อความอธิบายขยายความย่อย เช่น:
  - `แผงควบคุม (Dashboard)`
  - `การตั้งค่าระบบ (Unified Settings)`
  - `เส้นตายเข้านอนคืนนี้ (Bedtime Deadline)`
  - `พลังชีวิต (HP)`
  - `(Strike Recorded)`
  - `(5 รอบการนอน)`
  - `อยู่ในสถานะนอน (ตรวจจับออฟไลน์...)`
- ✅ **ถูกต้อง:** ใช้ข้อความตรงไปตรงมา ไร้วงเล็บ หากต้องการคั่นข้อมูลให้ใช้จุดนำสายตา `•` หรือเว้นวรรค เช่น:
  - `แผงควบคุม`
  - `การตั้งค่าระบบ`
  - `เส้นตายเข้านอนคืนนี้`
  - `พลังชีวิต`
  - `5 รอบการนอน`
  - `อยู่ในสถานะนอน • ตรวจจับออฟไลน์ผ่าน Discord และ C++ Guard`

### 2) ภาษาไทยนำในคำทั่วไป / ภาษาอังกฤษล้วนเฉพาะคำศัพท์ทางเทคนิค
- **คำใดที่ภาษาไทยสื่อความหมายได้สมบูรณ์และเป็นธรรมชาติ ให้ใช้ภาษาไทยล้วน ไม่จำเป็นต้องใช้ภาษาอังกฤษ:**
  - ใช้ **`แผงควบคุม`** (ห้ามใช้ Dashboard)
  - ใช้ **`การตั้งค่า`** (ห้ามใช้ Settings)
  - ใช้ **`ประวัติการนอน`** (ห้ามใช้ History)
  - ใช้ **`ตารางเวลา`** (ห้ามใช้ Schedule)
  - ใช้ **`ภารกิจและรางวัล`** (ห้ามใช้ Quests & Rewards)
  - ใช้ **`การวิเคราะห์`** (ห้ามใช้ Analytics)
  - ใช้ **`ความช่วยเหลือ`** (ห้ามใช้ Help)
  - ใช้ **`เสียงเตือน`** (ห้ามใช้ Alarms)
  - ใช้ **`พลังชีวิต`** (ห้ามใช้ HP หรือ Health Bar)
  - ใช้ **`ระดับและประสบการณ์`** (แทน Level & EXP)
  - ใช้ **`เข้าสู่ระบบ`** / **`สมัครสมาชิก`** (แทน Log in / Register)
- **หากเป็นคำศัพท์เฉพาะทางหรือชื่อระบบ ให้ใช้ภาษาอังกฤษเดี่ยวๆ ไปเลยโดยไม่ต้องมีวงเล็บคำแปลไทย:**
  - ตัวอย่าง: `Discord`, `Token`, `API`, `Windows Sign Out`, `Sleep Mode`, `Shutdown`, `LockWorkStation`, `WinHTTP`

---

## 9. ตัวอย่างโครงสร้าง Component ตามข้อกำหนด (Blueprint Code)

### 1) Container (No Border, Tonal Shift, Perfect Radius):
```tsx
// ✅ ถูกต้อง: ไร้เส้นขอบ ใช้สีพื้นเทาเข้ม มีมิติด้วย Tonal Contrast
<section className="bg-[#121215] rounded-2xl p-6 space-y-4">
    <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-300">ความพร้อมของระบบ</h2>
        <span className="text-xs text-zinc-500 font-light">อัปเดตแบบเรียลไทม์</span>
    </div>
    
    <div className="bg-[#18181B] rounded-xl p-4">
        {/* Sub-surface nested correctly: R_inner (12px) = R_outer (16px) - Padding approx */}
        <span className="text-2xl font-medium text-white tabular-nums">100%</span>
    </div>
</section>
```

### 2) Button (No Badge, Clean Ergonomics):
```tsx
// ✅ ถูกต้อง: ปุ่มเรียบ คมชัด สัดส่วนขาว 20%
<button className="h-11 px-5 rounded-lg bg-white text-zinc-950 font-medium text-sm transition-colors hover:bg-zinc-200 active:scale-[0.99] flex items-center justify-center gap-2">
    ยืนยันการเข้านอน
</button>
```

### 3) Countdown & Status (Balanced Hierarchy):
```tsx
// ✅ ถูกต้อง: ข้อมูลเด่นเพียงจุดเดียว ไม่มี Badge และไม่มีวงเล็บกวนสายตา
<div className="flex flex-col items-center justify-center py-8">
    <span className="text-xs uppercase tracking-wider text-zinc-500 font-normal mb-1">
        เวลาที่เหลือก่อนถึงเส้นตาย
    </span>
    <span className="text-6xl font-medium text-white tracking-tight tabular-nums">
        02:45:18
    </span>
    <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
        <span className="size-2 rounded-full bg-emerald-500" />
        <span>อยู่ในเกณฑ์ปลอดภัย • เป้าหมาย 23:15 น.</span>
    </div>
</div>
```

---

## 10. สรุป Checklist สำหรับการ Review โค้ด UI

- [ ] **สีพื้นผิว:** ใช้โทน Dark/Gray `#09090B` ถึง `#18181B` ครบ 80% หรือไม่?
- [ ] **สีคอนทราสต์:** มีสีขาวและสีเน้นไม่เกิน 20% สว่างเฉพาะจุดสำคัญหรือไม่?
- [ ] **เส้นขอบ:** ตัด border เส้นทึบ 1px รอบกล่องออกทั้งหมดแล้วหรือไม่?
- [ ] **ความโค้งมน:** ใช้ Nested Radius ที่ถูกต้อง (`16px` นอก, `12px` กลาง, `8px` ใน) หรือไม่?
- [ ] **Badge:** กำจัด Badge / Pill / Chip ที่ไม่จำเป็นออกหมดแล้วหรือไม่?
- [ ] **ภาษาและวงเล็บ:** ห้ามมีวงเล็บ `()` กำกับข้อความบน UI เด็ดขาด และใช้ภาษาไทยล้วนในส่วนที่สื่อความหมายได้ชัดเจน เช่น "แผงควบคุม" แทน "Dashboard" หรือไม่?
- [ ] **Typography:** โหลดและแสดงผลด้วยฟอนต์ `Kanit` สัดส่วนน้ำหนักเหมาะสม ไม่หนาเกินไปหรือไม่?
- [ ] **UX:** ใช้งานได้จริงใน 1-2 คลิก ข้อมูลกระชับ ไม่ต้องเลื่อนหาในพื้นที่ว่างที่กว้างเกินไปหรือไม่?

