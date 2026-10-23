# DESIGN SYSTEM SPECIFICATION (DESIGN.md)
**Project:** SleepOrDie — Hardcore Sleep & Discipline Protocol  
**Style Architecture:** Minimalist Industrial Dark / High-Discipline Visual Hierarchy  
**Core Rules:** Dark/Gray 80% • White 20% • No Border • Concentric Radius • No Badge • Zero Emoji • Direct Microcopy • Normal Font: Kanit • Special Font: Chakra Petch

---

## 1. ปรัชญาและโครงสร้างลำดับสายตา (Design Philosophy & Visual Hierarchy)

ระบบการออกแบบนี้สร้างขึ้นเพื่อปฏิเสธความจำเจ ความรก และข้อบกพร่องของ AI-Generated UI โดยมุ่งเน้นความสุขุม เรียบง่าย ทรงพลัง และมีลำดับความสำคัญของสายตา (Visual Hierarchy) ที่ชัดเจนที่สุด ผู้ใช้ต้องเข้าใจสถานะและเวลาเส้นตายได้ภายใน 1 วินาทีแรกโดยไม่เกิดความล้าทางสายตา

### ลำดับความสำคัญของข้อมูลบนหน้าจอ (Visual Hierarchy 3 Levels)
1. **Primary Focal Point (จุดเด่นระดับ 1 - ขาว 20% เด่นชัดที่สุด):**
   - เวลานับถอยหลังสู่เส้นตาย (Countdown Timer) และหลอดพลังชีวิต (HP Bar)
   - เป็นจุดรวมสายตาเพียงจุดเดียวต่อหน้าจอ ใช้ขนาดตัวอักษรใหญ่ คอนทราสต์ขาวบริสุทธิ์ (#FFFFFF) ท่ามกลางพื้นหลังมืดสนิท
2. **Secondary Controls (ระดับ 2 - ข้อมูลและปุ่มควบคุมหลัก):**
   - ปุ่มยืนยันการนอน (Confirm Sleep) และแท็บนำทางหลัก (Clean Navigation)
   - ใช้ขนาดและคอนทราสต์ระดับกลาง เป็นระเบียบ ไม่แย่งความเด่นจากจุดศูนย์กลาง
3. **Tertiary Metadata (ระดับ 3 - ข้อมูลบริบทและส่วนเสริม):**
   - สถิติสะสม, เวลาเป้าหมาย, ข้อมูลเชื่อมต่อ และเมนูตั้งค่ารอง
   - ใช้สีเทาเรียบ (#71717A ถึง #A1A1AA) ตัวอักษรขนาดกะทัดรัด อยู่ในระนาบที่เงียบสงบ

### กฎสัดส่วนสี 80/20 (The 80/20 Contrast Rule)
- **80% Dark & Neutral Grays:** พื้นที่ส่วนใหญ่ (Canvas, Surface Panels, Backgrounds) อยู่ในช่วงเทาเข้มหลายระดับ เพื่อสร้างมิติและความลึกโดยไม่ต้องใช้เส้นขอบ
- **20% Crisp White & High-Contrast Accents:** สงวนสีขาวบริสุทธิ์ (#FFFFFF) และสีสถานะเฉพาะจุดสำหรับข้อมูลวิกฤตเท่านั้น

---

## 2. แก้ปัญหาจุดสังเกตของ AI-Generated UI (Anti-Pattern Matrix)

| จุดสังเกตที่มักพบใน AI UI | ปัญหาที่เกิดขึ้น | กฎบังคับใช้ของ SleepOrDie (Solution Rule) |
| :--- | :--- | :--- |
| **1. Layout** | ยัดทุกข้อมูลใส่ Card ซ้ำๆ จนรกหน้าจอ | **Fluid Tonal Planes:** แบ่งกลุ่มด้วยระยะห่างและระดับสีเทา ไม่ล้อมกรอบสิ่งที่ไม่มีปฏิสัมพันธ์ |
| **2. Spacing** | เว้นช่องไฟกว้างเกินไป ข้อมูลลอยกระจัดกระจาย | **Compact Proximity:** จัดกลุ่มชิดกัน (Gap 8px–12px) ส่วนที่ต่างกันแยก 20px–32px |
| **3. Typography** | ตัวหนังสือหนาเกร่อ ขาดน้ำหนักเปรียบเทียบ | **Dual Font & Balanced Weight:** ฟอนต์ Kanit ในธีมปกติ และ Chakra Petch ในธีมพิเศษ จำกัดน้ำหนักที่ 400 และ 500 |
| **4. Color & Glow** | สาด Gradient นีออนหรือเงาเรืองแสงรกตา | **Pure Matte Neutrality:** พื้นผิวเนื้อแมตต์ ปราศจาก Gradient หลากสีและแสงเรืองแสงฟุ้งกระจาย |
| **5. Navigation** | ใส่ตัวเลข 01, 02 หรือ 1. 2. 3. นำหน้าเมนู | **Clean Nav Labels:** ตัดตัวเลขนำหน้าออกทั้งหมด ใช้ชื่อหมวดหมู่สั้น กระชับ ตรงประเด็น |
| **6. Decoration** | ใส่เครื่องหมาย // หรือโค้ดสัญลักษณ์รกหน้า | **No "//" in Normal Theme:** ห้ามใช้เครื่องหมาย // ตกแต่งในธีมปกติ เน้นความเรียบหรูระดับโปรดักชัน |
| **7. Emojis** | แปะอีโมจิตามหัวข้อ ปุ่ม และสถานะ | **Zero Emoji Standard:** ห้ามใช้อีโมจิเป็นองค์ประกอบ UI เด็ดขาด ให้ใช้ SVG Icons หรือจุดสถานะเรียบ |
| **8. Copywriting** | ขึ้นต้นด้วยคำว่า "ระบบ" หรือเวิ่นเว้อ | **Direct Microcopy:** ตัดคำว่า "ระบบ" และ "System" ออกทั้งหมด สื่อสารด้วยคำกริยาตรงไปตรงมา |
| **9. Low-Usage Controls** | แผ่ปุ่มทดสอบและคำสั่งรองเต็มหน้าจอ | **Progressive Disclosure:** ยุบส่วนที่กดใช้น้อยลง Dropdown หรือปุ่มกะทัดรัด (Compact Controls) |

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
             ├── Safe: #10B981 (Emerald)
             ├── Warning: #F59E0B (Amber)
             └── Critical: #EF4444 (Crimson)
```

### Color Palette Specification:
- **Canvas (Default Background):** `#09090B` (Zinc-950)
- **Surface Elevation 1 (Containers/Planes):** `#121215`
- **Surface Elevation 2 (Controls/Buttons/Inputs):** `#18181B` (Zinc-900)
- **Surface Elevation 3 (Hover/Active states):** `#27272A` (Zinc-800)
- **Primary Text & Focal Accent (20%):** `#FFFFFF` / `#FAFAFA`
- **Secondary / Subdued Text:** `#A1A1AA` (Zinc-400)
- **Muted / Metadata Text:** `#71717A` (Zinc-500)

[ กฎข้อห้ามเด็ดขาด ]
- ห้ามใช้ขอบสีสว่างทึบ (No 1px solid white/gray borders)
- ห้ามใช้ Gradient สีม่วง-ฟ้าแบบ AI ทั่วไป
- ห้ามใช้ Box Shadow สีสดเรืองแสง

---

## 4. โครงสร้างเส้นขอบและการไล่ระดับมิติ (Border & Elevation: "No Border")

แนวคิด **"No Border"** คือการกำหนดขอบเขตด้วยระดับสีพื้นผิว (Tonal Shift) และระยะว่าง (Spacing):

1. **Surface Separation:**
   - เปลี่ยนพื้นหลังจาก `#09090B` (Canvas) เป็น `#121215` (Container) เพื่อสร้างระนาบที่แยกกันอย่างเป็นธรรมชาติ
   - ในกรณีที่ต้องแยกบรรทัดในรายการ ให้ใช้เส้นโปร่งแสงบางเบา `border-b border-white/[0.04]` หรือใช้ช่องว่าง `gap` แทน
2. **Elevated Surfaces:**
   - ใช้ Ambient Shadow โปร่งแสงนุ่มนวล:
     `box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.4);`
3. **Interactive Focus State:**
   - เมื่อโฟกัส Input หรือปุ่มกด ให้ใช้วงแหวนโปร่งแสงบางเบา `ring-1 ring-white/20` ห้ามใช้กรอบหนาฉูดฉาด

---

## 5. การคำนวณความโค้งมนที่สมบูรณ์แบบ (Concentric Border Radius)

ความโค้งมนของมุมต้องสอดคล้องทางคณิตศาสตร์ตามสูตร:

$$\mathbf{R_{\text{inner}} = R_{\text{outer}} - \text{Padding}}$$

| ขนาด Token | ค่ารัศมี (Radius) | การนำไปใช้งาน (Usage) |
| :--- | :--- | :--- |
| `radius-outer` | `16px` (`rounded-2xl`) | Main Screen Containers, Outer Modules |
| `radius-surface` | `12px` (`rounded-xl`) | Sub-panels, Settings Dialogs, Metric Pods |
| `radius-control` | `8px` (`rounded-lg`) | Action Buttons, Dropdowns, Input Fields |
| `radius-inner` | `4px` (`rounded`) | Inner Indicators, Metric Bars, Sliders |

[ กฎข้อห้าม ] ห้ามใช้ `rounded-full` (ทรงแคปซูลยา) กับปุ่มกดทั่วไป เพื่อหลีกเลี่ยงภาพลักษณ์แบบของเล่นสำเร็จรูป ให้ใช้ `rounded-lg` (8px) หรือ `rounded-xl` (12px) เท่านั้น

---

## 6. อักษรศาสตร์และระบบ 2 ธีม (Typography: Normal Theme vs Special Theme)

ระบบรองรับ 2 สไตล์ตามบริบทการใช้งาน โดยแยกฟอนต์และโทนอย่างเด็ดขาด:

### 1) Normal Theme (ธีมปกติ - มาตรฐาน Minimalist Industrial Dark)
- **Primary Font:** **Kanit** (Google Fonts)
- **ลักษณะ:** สุขุม อ่านง่าย สะอาดตา ไร้การปรุงแต่งรกรุงรัง
- **กฎเหล็กของ Normal Theme:**
  - **ห้ามใช้เครื่องหมาย `//` โดยเด็ดขาด:** ห้ามมี `// RADAR`, `// SETTINGS`, `// STATUS` ในธีมปกติเด็ดขาด ให้ใช้ชื่อหมวดหมู่ตัวพิมพ์มาตรฐาน
  - สัดส่วนตัวหนังสือเป็นระเบียบ ไม่ใช้ตัวหนาพรำเพรื่อ

```css
/* Normal Theme Typography */
font-family: 'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### 2) Special Theme (ธีมพิเศษ - Tactical / Military Terminal)
- **Primary Font:** **Chakra Petch** (Google Fonts)
- **ลักษณะ:** เหลี่ยมเรขาคณิต สไตล์หน้าจอยุทธวิธีทางทหาร (Tactical HUD / Cybernetic Command)
- **การนำไปใช้งาน:** ใช้งานเมื่อเปิดใช้งานโหมดธีมพิเศษ (Tactical Green / Terminal) เพื่อให้ได้ความรู้สึกจริงจังและเฉียบคม

```css
/* Special Theme Typography */
.theme-special, [data-theme="special"] {
    font-family: 'Chakra Petch', -apple-system, BlinkMacSystemFont, sans-serif !important;
}
```

### Hierarchy & Weights Scale:

| ลำดับ (Role) | ขนาด (Size) | น้ำหนัก (Weight) | สี (Color) | การใช้งาน |
| :--- | :--- | :--- | :--- | :--- |
| **Metric Display** | `48px` - `64px` | `500 Medium` | `#FFFFFF` | ตัวเลขนับถอยหลัง, เปอร์เซ็นต์ HP |
| **Page Title** | `20px` - `24px` | `600 SemiBold` | `#FAFAFA` | หัวข้อหน้าจอ เช่น "แผงควบคุม" |
| **Section Header** | `14px` - `16px` | `500 Medium` | `#F4F4F5` | ชื่อกลุ่มข้อมูล, หัวข้อย่อย |
| **Body / Readout** | `13px` - `14px` | `400 Regular` | `#D4D4D8` | ข้อมูลสรุป, คำอธิบายการตั้งค่า |
| **Sub-text / Meta** | `11px` - `12px` | `300 Light / 400` | `#71717A` | เวลาเป้าหมาย, หน่วยกำกับ, รายละเอียดรอง |

- **ตัวเลขสถิติ (Tabular Numbers):** ใช้ CSS `font-variant-numeric: tabular-nums;` เสมอ เพื่อป้องกันตัวเลขสั่นไหวขณะนับถอยหลัง

---

## 7. โครงสร้างเมนูนำทาง (Navigation Architecture: "No Numbering")

### กฎการตัดตัวเลขนำหน้าออกจากเมนูนำทาง
ห้ามใส่ตัวเลขลำดับ เช่น `1.`, `2.`, `3.` หรือ `01`, `02`, `03` นำหน้าชื่อเมนูหรือแท็บนำทาง เพื่อให้การนำทางดูสะอาด เป็นมืออาชีพ และไม่สร้างความสับสนกับตัวเลขข้อมูลสถิติ

[ ตัวอย่างที่ห้ามใช้ ]
- `01 เรดาร์` หรือ `01 RADAR`
- `02 คลังอุปกรณ์` หรือ `02 INVENTORY`
- `03 ตลาดมืด` หรือ `03 BLACK MARKET`
- `04 ประวัติภารกิจ` หรือ `04 MISSION HISTORY`
- `1. แผงควบคุม  2. ตารางเวลา  3. การตั้งค่า`

[ ตัวอย่างที่ถูกต้อง ]
- `เรดาร์`
- `คลังอุปกรณ์`
- `ตลาดมืด`
- `ประวัติภารกิจ`
- `ตารางเวลา`
- `การตั้งค่า`

---

## 8. การจัดการ UI ที่กดใช้น้อย (Progressive Disclosure & Compact Controls)

เพื่อรักษา Visual Hierarchy ให้โดดเด่น และไม่ให้ปุ่มที่ไม่ค่อยได้กดมาแย่งพื้นที่สายตา ให้ใช้หลักการ **Progressive Disclosure**:

1. **ยุบเครื่องมือเสริมลง Dropdown / Popover:**
   - **โหมดจำลองและทดสอบ (Simulation / Debug Presets):** ยุบรวมไว้ใน Dropdown "ทดสอบระบบ" หรือปุ่มไอคอนขนาดกะทัดรัด
   - **การกระทำสำรอง (Secondary Actions):** เช่น การปรับแต่งขั้นสูง, ล็อกเอาต์ หรือเมนูจัดการบัญชี ให้รวมไว้ใน Dropdown เมนูของโปรไฟล์หรือจุดสามจุด
2. **Compact Controls (การควบคุมขนาดกะทัดรัด):**
   - ส่วนปรับเวลาฉุกเฉินหรือสลับโหมด ให้ใช้ตัวเลือกแบบ Segmented Control แบนเรียบ หรือ Dropdown ขนาดเล็ก (Height 32px–36px) แทนการวางการ์ดขนาดใหญ่
   - ซ่อนข้อมูลการดีบั๊กหรือรายละเอียดเชิงลึกไว้ใน Collapsible Drawer หรือ Tooltip เมื่อนำเมาส์ไปชี้

---

## 9. กฎการไม่ใช้ Badge (The "No Badge" Standard)

แบนการใช้กล่องแคปซูลสีฉูดฉาด (<Badge>) ลอยอยู่ตามมุมกล่อง

### วิธีแสดงสถานะที่ถูกต้อง:
1. **Semantic Text Hierarchy:** แสดงสถานะด้วยข้อความและระดับสีของตัวอักษรโดยตรง
   - *แทนที่จะเป็น:* `<Badge variant="danger">5 Strikes</Badge>`
   - *ให้เป็น:* `บันทึกโทษ: 5/5 ครั้ง` (ตัวเลขสีแดงเรียบ ตัวหนังสือสีขาว-เทา)
2. **Minimal Status Dot (จุดไฟนำสายตา):**
   - ใช้จุดไฟสถานะทรงกลมขนาดเล็ก `size-2` (8px) แบบ Flat ข้างข้อความ:
     - จุดสีเขียว: ปกติ / กำลังตรวจจับ
     - จุดสีส้ม: ระยะเตือน
     - จุดสีแดง: ระยะวิกฤต / พลังชีวิตหมด
3. **Inline Metrics:** วางตัวเลขและหน่วยวัดในบรรทัดเดียวกันโดยไม่ต้องตีกรอบหุ้ม

---

## 10. ภาษา ข้อความแจ้งเตือน และข้อห้ามใช้อิโมจิ (Language, Direct Copy & Zero Emoji)

### 1) ห้ามใช้อิโมจิเป็นองค์ประกอบ UI เด็ดขาด (Zero Emoji Standard)
- **ห้ามมีอีโมจิในทุกส่วนของ UI:** ห้ามใส่อีโมจิในปุ่ม, หัวข้อ, การแจ้งเตือน (Toast), แท็บเมนู, หรือสถานะใดๆ
- **สิ่งที่ใช้แทนอีโมจิ:**
  - ใช้ **Lucide / SVG Icons** สีโมโนโครมขนาดเล็ก (16px–20px)
  - ใช้ **Status Dot** ขนาด 6px–8px สำหรับบอกสถานะ
  - ใช้ **Typography & Space** ในการสื่อสาร

### 2) ห้ามขึ้นต้นข้อความด้วย "ระบบ" หรือ "System" (Direct Action Copy)
ข้อความแจ้งเตือน Toast, Alert, และคำอธิบายสถานะต้องสื่อสารด้วยการกระทำโดยตรง ไม่ต้องอ้างอิงคำว่า "ระบบ" นำหน้า:

| รูปแบบที่ห้ามใช้ (Prohibited) | รูปแบบที่ถูกต้อง (Correct & Direct) |
| :--- | :--- |
| `ระบบ: บันทึกการตั้งค่าสำเร็จ` | `บันทึกการตั้งค่าแล้ว` |
| `[ ระบบ ] ยืนยันการใช้ตั๋วฉุกเฉิน` | `ใช้ตั๋วฉุกเฉินสำเร็จ เลื่อนเวลา +30 นาที` |
| `ระบบกำลังตรวจจับผ่าน C++ Guard` | `กำลังตรวจจับผ่าน C++ Guard` |
| `ระบบพร้อมทำงาน` | `พร้อมใช้งาน` |
| `ระบบพบข้อผิดพลาดในการเชื่อมต่อ` | `เชื่อมต่อไม่สำเร็จ ตรวจสอบ Token อีกครั้ง` |
| `System: Alert sequence initiated` | `Alert sequence initiated` |

### 3) ภาษาไทยนำในคำทั่วไป / ภาษาอังกฤษเฉพาะคำศัพท์ทางเทคนิค
- ใช้ภาษาไทยกระชับและเป็นธรรมชาติ:
  - ใช้ `แผงควบคุม` (ไม่ใช้ Dashboard)
  - ใช้ `การตั้งค่า` (ไม่ใช้ Settings)
  - ใช้ `ประวัติภารกิจ` (ไม่ใช้ Mission History)
  - ใช้ `ตารางเวลา` (ไม่ใช้ Schedule)
  - ใช้ `พลังชีวิต` (ไม่ใช้ HP Bar)
  - ใช้ `ยืนยันการนอน` (ไม่ใช้ Confirm Sleep)
- คำศัพท์เฉพาะทางเทคนิคให้ใช้ภาษาอังกฤษเดี่ยวๆ โดยไม่ต้องมีวงเล็บคำแปลไทย:
  - `Discord`, `Token`, `C++ Guard`, `LockWorkStation`, `API`, `WinHTTP`

### 4) ห้ามมีวงเล็บ `()` กำกับข้อความขยายความซ้ำซ้อน
- ห้ามใส่วงเล็บขยายความ เช่น `แผงควบคุม (Dashboard)`, `พลังชีวิต (HP)`, `(ตรวจจับออฟไลน์)`
- ให้ใช้คำเดี่ยว หรือคั่นข้อมูลย่อยด้วยจุดนำสายตา `•` เช่น:
  - `อยู่ในสถานะนอน • ตรวจจับออฟไลน์ผ่าน Discord และ C++ Guard`

---

## 11. ตัวอย่างโครงสร้าง Component ตามข้อกำหนด (Blueprint Code)

### 1) Navigation Bar (ไร้ตัวเลขนำหน้า, ไร้เครื่องหมาย `//`):
```tsx
// ถูกต้อง: เมนูสะอาด ไร้ตัวเลข 01 02, ไร้ //, ไม่ใช้อีโมจิ
<nav className="flex items-center gap-1 bg-[#121215] p-1.5 rounded-xl">
    <button className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-zinc-950 transition-colors">
        เรดาร์
    </button>
    <button className="px-4 py-2 rounded-lg text-sm font-normal text-zinc-400 hover:text-white hover:bg-[#18181B] transition-colors">
        คลังอุปกรณ์
    </button>
    <button className="px-4 py-2 rounded-lg text-sm font-normal text-zinc-400 hover:text-white hover:bg-[#18181B] transition-colors">
        ตลาดมืด
    </button>
    <button className="px-4 py-2 rounded-lg text-sm font-normal text-zinc-400 hover:text-white hover:bg-[#18181B] transition-colors">
        ประวัติภารกิจ
    </button>
</nav>
```

### 2) Compact Dropdown สำหรับคำสั่งที่กดใช้น้อย (Progressive Disclosure):
```tsx
// ถูกต้อง: ยุบคำสั่งทดสอบและเครื่องมือรองลง Dropdown ไม่เกะกะสายตา
<div className="relative inline-block text-left">
    <button className="h-9 px-3 rounded-lg bg-[#18181B] text-xs text-zinc-400 hover:text-white hover:bg-[#27272A] flex items-center gap-2 transition-colors">
        <Sliders className="size-3.5" />
        <span>ทดสอบระบบ</span>
        <ChevronDown className="size-3" />
    </button>
    {/* Dropdown Menu Items */}
    <div className="absolute right-0 mt-1 w-48 bg-[#121215] rounded-lg shadow-xl p-1 border border-white/[0.04] space-y-0.5">
        <button className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-[#18181B] rounded">
            จำลองนับถอยหลัง 3 2 1
        </button>
        <button className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-[#18181B] rounded">
            ทดสอบเสียงเตือน
        </button>
        <button className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-[#18181B] rounded">
            รีเซ็ตพลังชีวิต
        </button>
    </div>
</div>
```

### 3) Countdown & Primary Focal Point (เด่นชัด ไร้ Badge ไร้อีโมจิ):
```tsx
// ถูกต้อง: ข้อมูลสำคัญอันดับ 1 ชัดเจนที่สุด ไร้ Badge และไร้วงเล็บ
<div className="flex flex-col items-center justify-center py-10">
    <span className="text-xs tracking-wider text-zinc-500 font-normal mb-1">
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

### 4) Direct Microcopy Notification (ไร้คำว่า "ระบบ", กระชับ ได้ใจความ):
```tsx
// ถูกต้อง: สื่อสารตรงประเด็น ทันใจใน 1 วินาที
<div className="bg-[#18181B] text-zinc-200 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between border border-white/[0.04]">
    <span>ใช้ตั๋วฉุกเฉินสำเร็จ เลื่อนเวลาเป้าหมายเป็น 23:45 น.</span>
    <button className="text-zinc-500 hover:text-white text-xs ml-4">ปิด</button>
</div>
```

---

## 12. รายการตรวจสอบสำหรับการ Review โค้ด UI (Checklist)

- [ ] **Visual Hierarchy:** มีจุดเด่นระดับ 1 (Countdown/HP) ชัดเจนเพียงจุดเดียว ไม่แย่งสายตากันหรือไม่?
- [ ] **Zero Emoji:** ปราศจากอีโมจิในทุกปุ่ม ข้อความสถานะ หัวข้อ และการแจ้งเตือน 100% หรือไม่?
- [ ] **Direct Copy:** ปราศจากคำขึ้นต้นว่า "ระบบ" หรือ "System" ในข้อความ Toast และสถานะทั้งหมดหรือไม่?
- [ ] **No "//" in Normal Theme:** ปราศจากเครื่องหมาย `//` ตกแต่งในหน้าจอโหมดปกติหรือไม่?
- [ ] **No Numbering in Nav:** เมนูและแท็บนำทางปราศจากตัวเลข `1. 2. 3.` หรือ `01, 02` หรือไม่?
- [ ] **Compact / Dropdown for Secondary UI:** ส่วนที่กดใช้น้อย (เช่น ปุ่มทดสอบ, ดีบั๊ก, เมนูย่อย) ถูกยุบลงเป็น Dropdown หรือใช้ขนาดกะทัดรัดแล้วหรือไม่?
- [ ] **Dual Theme Typography:**
  - ธีมปกติ แสดงผลด้วยฟอนต์ `Kanit` สะอาดตา
  - ธีมพิเศษ (Special / Tactical) แสดงผลด้วยฟอนต์ `Chakra Petch`
- [ ] **สีและคอนทราสต์:** คุมโทน Dark/Gray 80% และใช้สีขาว/สีเน้นคอนทราสต์ไม่เกิน 20% หรือไม่?
- [ ] **No Border & Perfect Radius:** ตัดเส้นขอบแข็งทึบออก และใช้ Concentric Radius (`16px`, `12px`, `8px`, `4px`) หรือไม่?
- [ ] **No Badge:** แสดงสถานะด้วยข้อความและ Status Dot แทน Badge ทรงแคปซูลหรือไม่?
- [ ] **No Parentheses:** ปราศจากวงเล็บ `()` กำกับคำแปลหรือขยายความซ้ำซ้อนบนหน้าจอหรือไม่?
