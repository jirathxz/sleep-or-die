import { useState, useEffect, useCallback } from 'react';

export type LanguageMode = 'normal' | 'tactical';

export const translations = {
    normal: {
        // เมนูนำทาง (Sidebar & BottomNav)
        nav_dashboard: 'แผงควบคุม',
        nav_alarms: 'แจ้งเตือนเวลานอน',
        nav_schedule: 'ตารางการนอน',
        nav_history: 'ประวัติการนอน',
        nav_progression: 'สถานะชีวิต',
        nav_inventory: 'กระเป๋าเก็บของ',
        nav_market: 'ตลาดมืด',
        nav_quests: 'ภารกิจและรางวัล',
        nav_analytics: 'สถิติการนอน',
        nav_settings: 'การตั้งค่าระบบ',
        nav_help: 'คู่มือการใช้งาน',

        // หมวดหมู่เมนูด้านข้าง
        group_main: 'เมนูหลัก',
        group_progression: 'ความก้าวหน้า',
        group_system: 'ระบบ',

        // หัวข้อหน้า Dashboard
        dashboard_title: 'แผงควบคุม',
        dashboard_desc: 'ระดับพลังชีวิตและเวลานับถอยหลังสู่เส้นตายเข้านอนคืนนี้',

        // หลอดพลังชีวิต (HP Bar)
        hp_title: 'ระดับพลังชีวิต',
        hp_status_normal: 'ระบบเสถียร',
        hp_status_caution: 'ล็อคดาวน์: เตรียมปิดระบบ',
        hp_status_critical: 'วิกฤต: เลือดลดต่อเนื่อง',
        hp_status_dead: 'ระบบหยุดทำงาน: พลังชีวิตหมด',

        // เลเวลและค่าประสบการณ์ (Level & EXP)
        level_label: 'เลเวล',
        discipline_1: 'มือใหม่หัดนอน',
        discipline_2: 'ผู้ควบคุมวงจรสลีป',
        discipline_3: 'ผู้เชี่ยวชาญการฟื้นฟู',
        discipline_4: 'ปรมาจารย์วินัยนิทรา',
        discipline_5: 'เทพแห่งการพักผ่อน',

        // สถิติและตั๋ว (StatsBadge)
        stats_survived: 'วันรอดชีวิตสะสม',
        stats_survived_unit: 'วันต่อเนื่อง',
        stats_streak_reward: 'รับฟรี 1 ตั๋วขยายเวลา ทุกสถิติ 7 วัน',
        stats_strikes: 'สถิติสไตรค์ชัตดาวน์',
        stats_strikes_unit: 'ครั้ง',
        stats_strikes_warn: 'หากชัตดาวน์ครบ 5 ครั้ง บัญชีจะถูกระงับ',
        stats_strikes_critical: 'เตือน: อีก 1 ครั้งบัญชีจะถูกระงับถาวร',
        stats_tickets: 'ตั๋วขยายเวลาฉุกเฉิน',
        stats_tickets_unit: 'ใบพร้อมใช้',
        stats_tickets_desc: '+30 นาที ต่อใบ',
        stats_btn_ticket: 'กดใช้ตั๋ว',

        // จอนับถอยหลังและการนอน (Countdown & Sleep)
        countdown_title: 'นับถอยหลังสู่เวลานอนคืนนี้',
        countdown_verified: 'อยู่ในสถานะเข้านอนแล้ว • ระบบกำลังตรวจจับผ่าน Discord Guard',
        countdown_simulating: 'โหมดจำลอง: นับถอยหลังสู่เวลานอน',
        countdown_warning: 'ระยะเตือน: เหลือเวลาอีก 30 นาทีก่อนนอน',
        countdown_lockdown: 'ระยะล็อคดาวน์: เหลือเวลาอีก 15 นาที • กำลังบังคับออกจากระบบ',
        countdown_emergency: 'ฉุกเฉิน: มีเวลาอีกไม่กี่วินาทีก่อนพลังชีวิตหมด',
        countdown_shutdown: 'เข้าสู่สภาวะชัตดาวน์ ปิดระบบ',
        unit_hours: 'ชั่วโมง',
        unit_minutes: 'นาที',
        unit_seconds: 'วินาที',
        label_target: 'เส้นตายเข้านอนคืนนี้:',
        label_wake: 'เวลาตื่นเป้าหมาย:',
        sleep_cycles: '5 รอบการนอน',
        btn_confirm_sleep: 'ยืนยันการเข้านอน',
        btn_confirmed_sleep: 'อยู่ในสถานะนอนแล้ว',
        btn_simulate_start: 'ทดสอบเวลานอน 3 2 1',
        btn_simulate_reset: 'คืนค่าปกติ',

        // หน้าแจ้งเตือนเวลานอน (Alarms Page)
        alarms_title: 'ระบบตั้งเวลาแจ้งเวลานอน',
        alarms_desc: 'กำหนดเวลาเข้านอน ระบบจะคำนวณและแจ้งเตือนตามลำดับขั้นตอนก่อนถึงเส้นตาย',
        alarms_add_btn: 'เพิ่มกำหนดเวลานอน',
        alarms_primary_target: 'เป้าหมายเวลาเข้านอนหลัก',
        alarms_wake_label: 'เวลาตื่นเป้าหมาย',
        alarms_sleep_label: 'เวลาเข้านอนเป้าหมาย',
        alarms_save_btn: 'บันทึกเป้าหมายเวลานอน',
        alarms_rules_title: 'ขั้นตอนการเตือนภัยก่อนเส้นตาย',
        alarms_rule_1_title: 'แจ้งเตือนผ่อนคลายก่อนนอน • 30 นาทีก่อนเส้นตาย',
        alarms_rule_1_desc: 'ส่งสัญญาณกระตุ้นให้เริ่มวางงาน สรุปกิจกรรมประจำวัน และเตรียมตัวเข้านอน',
        alarms_rule_2_title: 'แจ้งเตือนล็อคดาวน์หน้าจอ • 15 นาทีก่อนเส้นตาย',
        alarms_rule_2_desc: 'เร่งจังหวะเตือนขั้นสูง บังคับปิดแสงสีฟ้า ปิดหน้าจอคอม และหยุดใช้งานโซเชียลมีเดีย',
        alarms_rule_3_title: 'สัญญาณไซเรนเส้นตายเข้านอน',
        alarms_rule_3_desc: 'ส่งเสียงไซเรนฉุกเฉินและแจ้งเตือน Discord เมื่อถึงเวลา หากไม่เข้านอน HP จะเริ่มลดลงทันที',
        alarms_test_alert: 'ทดสอบสัญญาณเสียง',

        // หน้าตารางการนอน (Schedule Page)
        schedule_title: 'ตารางเส้นตายการนอน',
        schedule_desc: 'คำนวณและกำหนดเส้นตายเข้านอนรายวัน เพื่อรักษาวินัยและป้องกันการสูญเสียพลังชีวิต',
        schedule_formula_title: 'สูตรคำนวณการนอนตามหลักสรีรวิทยา',
        schedule_cycles_badge: '5 รอบการนอน',
        schedule_deep_sleep: 'รอบการหลับลึก 90 นาที',
        schedule_deep_sleep_val: '5 รอบ = 7 ชม. 30 นาที',
        schedule_relax_time: 'ระยะเวลาผ่อนคลาย',
        schedule_relax_time_val: '+15 นาที เผื่อเวลาหลับ',
        schedule_total_time: 'เวลานอนรวมที่แนะนำ',
        schedule_total_time_val: '7 ชั่วโมง 45 นาที',
        schedule_weekly_table: 'ตารางเวลาประจำสัปดาห์',
        schedule_sleep_label: 'นอน:',
        schedule_wake_label: 'ตื่น:',
        schedule_cycles_unit: 'รอบ',

        // วันในสัปดาห์
        day_mon: 'จันทร์',
        day_tue: 'อังคาร',
        day_wed: 'พุธ',
        day_thu: 'พฤหัสบดี',
        day_fri: 'ศุกร์',
        day_sat: 'เสาร์',
        day_sun: 'อาทิตย์',

        // หน้าประวัติการนอน (History Page)
        history_title: 'ประวัติการเข้านอนตรงเวลา',
        history_desc: 'บันทึกสถิติความตรงต่อเวลา อัตราการรอดชีวิต และประวัติการกดยืนยันเวลานอน',
        history_table_title: 'บันทึกประวัติล่าสุด',
        history_col_date: 'วันและเวลา',
        history_col_bedtime: 'เวลานอน',
        history_col_wake: 'เวลาตื่น',
        history_col_duration: 'รวมระยะเวลา',
        history_col_status: 'สถานะ',
        history_col_reward: 'รางวัล',
        history_on_time: 'ตรงเวลา',
        history_late_ticket: 'สาย • ใช้ตั๋วฉุกเฉิน',

        // หน้าสถานะชีวิต (Progression Page)
        progression_title: 'สถานะชีวิตและความก้าวหน้า',
        progression_desc: 'ระบบระดับวินัย EXP และกฎระเบียบบทลงโทษชัตดาวน์',
        progression_tier_label: 'ระดับผู้ควบคุมวินัย',
        progression_exp_label: 'EXP สะสม',
        progression_hp_overview: 'ภาพรวมพลังชีวิต',
        progression_shutdown_rules: 'กฎระเบียบบทลงโทษการชัตดาวน์',
        progression_strike_rule_badge: 'กฎสไตรค์ 5 ครั้ง',
        progression_hp_current: 'พลังชีวิตปัจจุบัน',
        progression_hp_desc: 'ลดลงทันทีที่เลยเวลานอน และลดลง 1 หน่วย ทุก 2 นาที',
        progression_strikes_title: 'สถิติสไตรค์ชัตดาวน์',
        progression_strikes_desc: 'หากเลือดลดถึง 0% จะถูกบันทึก 1 สไตรค์ • ล้างสไตรค์ได้เมื่อนอนตรงเวลา 5 วันติดต่อกัน',
        progression_lockout_title: 'สถานะการระงับบัญชีถาวร',
        progression_lockout_desc: 'เมื่อครบ 5 สไตรค์ บัญชีจะถูกระงับถาวรและไม่สามารถกู้คืนได้',
        progression_status_active: 'ปกติ (ACTIVE)',

        // หน้าภารกิจและรางวัล (Quests Page)
        quests_title: 'ภารกิจและรางวัล',
        quests_desc: 'ทำภารกิจประจำวันเพื่อรับ EXP และตั๋วขยายเวลาฉุกเฉิน',
        quests_my_tickets: 'ตั๋วที่มี:',
        quests_tickets_unit: 'ใบ',
        quests_daily_title: 'ภารกิจประจำวัน',
        quests_achievements_title: 'ความสำเร็จสะสม',
        quest_d1_title: 'ปิดหน้าจอก่อนเวลาเส้นตาย',
        quest_d1_desc: 'กดยืนยันการนอนก่อนถึงเวลาเป้าหมาย',
        quest_d2_title: 'ตรวจจับออฟไลน์ผ่าน Discord',
        quest_d2_desc: 'คงสถานะออฟไลน์ให้ครบ 10 นาทีแรกหลังยืนยันการนอน',
        quest_d3_title: 'รักษาพลังชีวิตเต็ม 100%',
        quest_d3_desc: 'ไม่ปล่อยให้หลอดเลือดเริ่มลดลงในคืนนี้',
        ach_1_title: 'เริ่มต้นการเปลี่ยนแปลง',
        ach_1_desc: 'นอนตรงเวลาติดต่อกันครบ 3 วัน',
        ach_2_title: 'วินัยเหล็กไหล',
        ach_2_desc: 'รอดชีวิตสะสมครบ 7 วัน รับฟรี 1 ตั๋วขยายเวลา',
        ach_3_title: 'ผู้พิชิตรัตติกาล',
        ach_3_desc: 'รอดชีวิตสะสมครบ 30 วันโดยไม่มีสไตรค์ชัตดาวน์',
        ach_status_unlocked: 'ปลดล็อคแล้ว',
        ach_status_progress: 'กำลังดำเนินการ',
        unit_days: 'วัน',

        // หน้าสถิติและการวิเคราะห์ (Analytics Page)
        analytics_title: 'สถิติและการวิเคราะห์',
        analytics_desc: 'วิเคราะห์ความสม่ำเสมอและคุณภาพของการนอนหลับรายสัปดาห์',
        analytics_consistency: 'ความสม่ำเสมอ',
        analytics_avg_sleep: 'ชั่วโมงนอนเฉลี่ย',
        analytics_avg_sleep_unit: 'ชม.',
        analytics_on_time_rate: 'สถิตินอนตรงเวลา',
        analytics_recovery_title: 'ประสิทธิภาพการฟื้นฟู',
        analytics_recovery_val: 'ยอดเยี่ยม',
        analytics_chart_title: 'ระยะเวลาการนอนรอบ 7 วัน',
        analytics_chart_target: 'เป้าหมาย 7.75 ชม.',
        analytics_total_survived: 'วันรอดชีวิตสะสม',

        // หน้าคู่มือและความช่วยเหลือ (Help Page)
        help_title: 'คู่มือและความช่วยเหลือ',
        help_desc: 'คำอธิบายกฎเกณฑ์ กลไกการลงโทษ และเอกสารคู่มือการพัฒนา',
        help_mechanics_title: 'กลไกการทำงานของ SleepOrDie',
        help_rule1_title: '1. การคำนวณเวลานอนอัตโนมัติ',
        help_rule1_desc: 'เมื่อคุณกำหนดเวลาตื่น ระบบจะคำนวณเวลาที่ควรเข้านอนย้อนหลัง 5 รอบการนอน รอบละ 90 นาที รวม 7 ชั่วโมง 30 นาที บวกระยะเวลาผ่อนคลาย 15 นาที รวมเป็น 7 ชั่วโมง 45 นาที',
        help_rule2_title: '2. การลดลงของพลังชีวิต',
        help_rule2_desc: 'หากถึงเวลาเส้นตายแล้วคุณยังไม่กดยืนยันการนอน เลือดจะเริ่มลดลงทันที 1 หน่วย ทุก 2 นาที และระบบจะส่งสัญญาณเสียงไซเรนเตือนภัย',
        help_rule3_title: '3. กฎการระงับบัญชีถาวร 5 สไตรค์',
        help_rule3_desc: 'หากเลือดลดเหลือ 0 จะเกิดการชัตดาวน์และบันทึก 1 สไตรค์ หากสะสมครบ 5 ครั้ง บัญชีจะถูกระงับถาวร • คุณสามารถล้างสไตรค์ได้ 1 ครั้ง เมื่อนอนตรงเวลาติดต่อกันครบ 5 วัน',
        help_docs_title: 'เอกสารและซอร์สโค้ด',
        help_gh_title: 'GitHub Repository',
        help_gh_desc: 'ซอร์สโค้ดและ Discord Bot',
        help_framework_title: 'Framework Docs',
        help_framework_desc: 'Laravel 12 & Inertia React',

        // หน้ากระเป๋าเก็บของ (Inventory Page)
        inventory_title: 'กระเป๋าเก็บของ',
        inventory_desc: 'จัดการช่องเก็บสัมภาระ เสบียง และไอเทมฟื้นฟูพลังชีวิตยุทธวิธี',
        inventory_dossier_title: 'ข้อมูลสายลับ',
        inventory_case_title: 'ช่องเก็บของกระเป๋าเหล็ก',
        inventory_capacity: 'ความจุ:',
        inventory_slots: 'ช่อง',
        inventory_status_ready: 'สถานะ: พร้อมใช้งาน',
        inventory_rotate_hint: 'คลิกไอเทมเพื่อกดใช้งานหรือทิ้งไอเทม',
        inventory_btn_market: 'ไปตลาดมืด',
        inventory_camo_active: 'เกราะพรางตัว STEALTH CAMO: ทำงานอยู่ (ป้องกันสถิติหลุด 1 คืน)',
        item_ration_name: 'RATION',
        item_ration_desc: 'ฟื้นฟู HP +30% & เพิ่มตั๋วฉุกเฉิน +1 ใบ',
        item_spray_name: 'EMERGENCY TICKET',
        item_spray_desc: 'ตั๋วขยายเวลาฉุกเฉิน +30 นาที (เพิ่มสิทธิ์ตั๋ว +1 ใบ)',
        item_camo_name: 'STEALTH CAMO',
        item_camo_desc: 'เกราะพรางตัว ป้องกันสถิติหลุด 1 คืน',
        item_empty_slot: 'ช่องว่าง',
        modal_use_title: 'ยืนยันการใช้งานไอเทม',
        modal_btn_use: 'กดใช้งาน',
        modal_btn_discard: 'ทิ้งไอเทม',
        modal_btn_cancel: 'ยกเลิก',

        // หน้าตลาดมืด (Market Page)
        market_title: 'ตลาดมืดเสบียง',
        market_desc: 'แลกเปลี่ยนแต้ม EXP เพื่อรับเสบียงยุทธวิธีและอัปเกรดความจุกระเป๋า',
        market_exp_available: 'EXP ที่มี',
        market_bag_slots: 'ช่องกระเป๋า',
        market_rank_label: 'ยศปัจจุบัน',
        market_codec_freq: 'สัญญาณวิทยุ CODEC: 141.80',
        market_merchant_name: 'พ่อค้าตลาดมืด',
        market_quote: '"ยินดีต้อนรับ สหาย... หึๆๆ... วันนี้จะซื้ออะไรดีล่ะ?"',
        market_warning: 'คำเตือน: ซื้อของจะหักแต้ม EXP ทันที และอาจทำให้เลเวลลดลงได้หากแต้มไม่พอ',
        market_btn_buy: 'ซื้อ',
        market_btn_upgrade: 'อัปเกรด',
        market_upgraded: 'อัปเกรดแล้ว',
        market_btn_inventory: 'ดูกระเป๋าเก็บของ',
        market_case_m_title: 'ATTACHÉ CASE (M)',
        market_case_m_desc: 'อัปเกรดกระเป๋า: 16 ช่อง (+4 ช่องถาวร)',
        market_case_l_title: 'ATTACHÉ CASE (L)',
        market_case_l_desc: 'อัปเกรดกระเป๋า: 20 ช่อง (ความจุสูงสุด • ต้องมี Case M ก่อน)',

        // แผงจำลองสถานะยุทธวิธี (Simulation Lab)
        sim_lab_title: 'แผงจำลองสถานะยุทธวิธี',
        sim_btn_hp_minus: '-25% พลังชีวิต',
        sim_btn_ff5s: 'กรอเวลา 5 วิ',
        sim_btn_alert: '1. เตือนก่อนนอน',
        sim_btn_lockdown: '2. ล็อคดาวน์',
        sim_btn_emergency: '3. ฉุกเฉิน 30 วิ',
        sim_btn_shutdown: '4. ชัตดาวน์ FAILED',
        sim_btn_reset: 'คืนค่าปกติ',
        sim_failed_title: 'MISSION FAILED: ชัตดาวน์ปิดระบบ',
        sim_failed_desc: 'พลังชีวิตลดลงเหลือ 0% • ตรวจพบสภาวะอดนอนวิกฤต',
        sim_failed_respawn: 'ฟื้นฟูระบบ / คืนชีพ',
    },
    tactical: {
        // เมนูนำทาง (Sidebar & BottomNav) - Pure English Tactical HUD
        nav_dashboard: 'COMMAND CENTER',
        nav_alarms: 'SIREN ALERTS',
        nav_schedule: 'TIMELINE PROTOCOL',
        nav_history: 'BLACKBOX LOGS',
        nav_progression: 'VITAL PROGRESSION',
        nav_inventory: 'ATTACHÉ CASE',
        nav_market: 'BLACK MARKET',
        nav_quests: 'MISSION REWARDS',
        nav_analytics: 'TELEMETRY',
        nav_settings: 'SYSTEM CORE',
        nav_help: 'FIELD MANUAL',

        // หมวดหมู่เมนูด้านข้าง
        group_main: 'OPERATIONS',
        group_progression: 'PROGRESSION',
        group_system: 'SYSTEM',

        // หัวข้อหน้า Dashboard
        dashboard_title: 'COMMAND CENTER',
        dashboard_desc: 'VITAL MATRIX TELEMETRY AND SHUTDOWN PROTOCOL COUNTDOWN',

        // หลอดพลังชีวิต (HP Bar)
        hp_title: 'VITAL MATRIX',
        hp_status_normal: 'SYSTEM NOMINAL',
        hp_status_caution: 'LOCKDOWN IMMINENT',
        hp_status_critical: 'CRITICAL ENERGY DEPLETION',
        hp_status_dead: 'TERMINATED: CORE SHUTDOWN',

        // เลเวลและค่าประสบการณ์ (Level & EXP)
        level_label: 'CLEARANCE LEVEL',
        discipline_1: 'RECRUIT TRAINEE',
        discipline_2: 'SLEEP CYCLE SPECIALIST',
        discipline_3: 'RECOVERY VETERAN',
        discipline_4: 'STASIS COMMANDER',
        discipline_5: 'APEX OPERATOR',

        // สถิติและตั๋ว (StatsBadge)
        stats_survived: 'SURVIVAL STREAK',
        stats_survived_unit: 'CONSECUTIVE DAYS',
        stats_streak_reward: '1 OVERRIDE KEY GRANTED EVERY 7 DAYS',
        stats_strikes: 'SHUTDOWN STRIKES',
        stats_strikes_unit: 'STRIKES',
        stats_strikes_warn: 'TERMINATION AT 5 STRIKES',
        stats_strikes_critical: 'CRITICAL: 1 STRIKE UNTIL PERMANENT LOCKOUT',
        stats_tickets: 'EMERGENCY OVERRIDE KEYS',
        stats_tickets_unit: 'KEYS READY',
        stats_tickets_desc: '+30 MINUTES PER KEY',
        stats_btn_ticket: 'EXECUTE OVERRIDE',

        // จอนับถอยหลังและการนอน (Countdown & Sleep)
        countdown_title: 'STASIS DEADLINE COUNTDOWN',
        countdown_verified: 'STASIS ACTIVE • DISCORD GUARD TELEMETRY RUNNING',
        countdown_simulating: 'CRITICAL SIMULATION IN PROGRESS',
        countdown_warning: 'WARNING T-30m: 30 MINUTES UNTIL DEADLINE',
        countdown_lockdown: 'LOCKDOWN T-15m: FORCED LOGOUT IMMINENT',
        countdown_emergency: 'EMERGENCY: SYSTEM SHUTDOWN IMMINENT',
        countdown_shutdown: 'SYSTEM TERMINATED • STANDBY DISABLED',
        unit_hours: 'HRS',
        unit_minutes: 'MIN',
        unit_seconds: 'SEC',
        label_target: 'TARGET DEADLINE:',
        label_wake: 'WAKE-UP BASE:',
        sleep_cycles: '5 SLEEP CYCLES',
        btn_confirm_sleep: 'ENGAGE STASIS',
        btn_confirmed_sleep: 'STASIS PROTOCOL CONFIRMED',
        btn_simulate_start: 'SIMULATE T-3s',
        btn_simulate_reset: 'ABORT SIMULATION',

        // หน้าแจ้งเตือนเวลานอน (Alarms Page)
        alarms_title: 'SIREN ALERTS PROTOCOL',
        alarms_desc: 'BEDTIME PROTOCOL TIMING AND MULTI-STAGE AUDIO SIREN CONTROLS',
        alarms_add_btn: 'ADD SCHEDULE',
        alarms_primary_target: 'ACTIVE BEDTIME TARGET',
        alarms_wake_label: 'TARGET WAKE TIME',
        alarms_sleep_label: 'TARGET BEDTIME',
        alarms_save_btn: 'SAVE PROTOCOL TARGET',
        alarms_rules_title: 'DISCIPLINARY ESCALATION PROTOCOLS',
        alarms_rule_1_title: 'PRE-STASIS DECOMPRESSION • T-30 MINUTES',
        alarms_rule_1_desc: 'INITIAL AUDIO CUE: CEASE HIGH-INTENSITY OPERATIONS AND INITIATE WIND-DOWN',
        alarms_rule_2_title: 'SCREEN LOCKDOWN • T-15 MINUTES',
        alarms_rule_2_desc: 'HIGH-FREQUENCY ESCALATION: FORCE WORKSTATION DISPLAY SHUTOFF AND TERMINATE BROWSING',
        alarms_rule_3_title: 'ZERO-HOUR SIREN DEADLINE',
        alarms_rule_3_desc: 'EMERGENCY SIREN BROADCAST: FAILURE TO ENGAGE STASIS INITIATES RAPID VITALITY DEPLETION',
        alarms_test_alert: 'TEST AUDIO SIREN',

        // หน้าตารางการนอน (Schedule Page)
        schedule_title: 'TIMELINE PROTOCOL',
        schedule_desc: 'DAILY STASIS DEADLINES AND CIRCADIAN RHYTHM RECOVERY CYCLES',
        schedule_formula_title: 'CIRCADIAN CALCULATION ALGORITHM',
        schedule_cycles_badge: '5 SLEEP CYCLES',
        schedule_deep_sleep: '90-MINUTE SLEEP CYCLE',
        schedule_deep_sleep_val: '5 CYCLES = 7 HRS 30 MIN',
        schedule_relax_time: 'LATENCY BUFFER',
        schedule_relax_time_val: '+15 MIN LATENCY BUFFER',
        schedule_total_time: 'RECOMMENDED DURATION',
        schedule_total_time_val: '7 HOURS 45 MINUTES',
        schedule_weekly_table: 'WEEKLY TIMELINE PROTOCOL',
        schedule_sleep_label: 'SLEEP:',
        schedule_wake_label: 'WAKE:',
        schedule_cycles_unit: 'CYCLES',

        // วันในสัปดาห์
        day_mon: 'MON',
        day_tue: 'TUE',
        day_wed: 'WED',
        day_thu: 'THU',
        day_fri: 'FRI',
        day_sat: 'SAT',
        day_sun: 'SUN',

        // หน้าประวัติการนอน (History Page)
        history_title: 'BLACKBOX ARCHIVE',
        history_desc: 'AUDIT LOGS OF SLEEP DISCIPLINE, STRIKES AND STASIS CONFIRMATIONS',
        history_table_title: 'TELEMETRY AUDIT LOGS',
        history_col_date: 'TIMESTAMP',
        history_col_bedtime: 'BEDTIME',
        history_col_wake: 'WAKE TIME',
        history_col_duration: 'DURATION',
        history_col_status: 'STATUS',
        history_col_reward: 'REWARD',
        history_on_time: 'NOMINAL',
        history_late_ticket: 'BREACH • OVERRIDE USED',

        // หน้าสถานะชีวิต (Progression Page)
        progression_title: 'VITAL PROGRESSION CORE',
        progression_desc: 'CLEARANCE LEVEL PROGRESSION, EXP MILESTONES AND PENALTIES',
        progression_tier_label: 'CLEARANCE DESIGNATION',
        progression_exp_label: 'ACCUMULATED EXP',
        progression_hp_overview: 'VITAL MATRIX SUMMARY',
        progression_shutdown_rules: 'TERMINATION ENFORCEMENT PROTOCOL',
        progression_strike_rule_badge: '5-STRIKE PROTOCOL',
        progression_hp_current: 'CURRENT VITAL ENERGY',
        progression_hp_desc: 'DEPLETES IMMEDIATELY PAST DEADLINE • -1 HP EVERY 2 MINUTES',
        progression_strikes_title: 'SHUTDOWN STRIKES',
        progression_strikes_desc: 'CORE FAILS AT 0% HP TRIGGER 1 STRIKE • CLEAR 1 STRIKE WITH 5 CONSECUTIVE ON-TIME DAYS',
        progression_lockout_title: 'PERMANENT LOCKOUT STATUS',
        progression_lockout_desc: 'PERMANENT LOCKOUT OCCURS AT 5 STRIKES • IRREVERSIBLE ACTION',
        progression_status_active: 'NOMINAL (ACTIVE)',

        // หน้าภารกิจและรางวัล (Quests Page)
        quests_title: 'TACTICAL MISSIONS',
        quests_desc: 'EXECUTE DAILY SLEEP MISSIONS TO EARN EXP AND OVERRIDE KEYS',
        quests_my_tickets: 'OVERRIDE KEYS:',
        quests_tickets_unit: 'KEYS',
        quests_daily_title: 'DAILY DIRECTIVES',
        quests_achievements_title: 'HONOR ACQUISITIONS',
        quest_d1_title: 'ENGAGE BEFORE DEADLINE',
        quest_d1_desc: 'CONFIRM SLEEP PROTOCOL BEFORE TARGET DEADLINE',
        quest_d2_title: 'DISCORD OFFLINE TELEMETRY',
        quest_d2_desc: 'MAINTAIN OFFLINE STATUS FOR FIRST 10 MINUTES AFTER SLEEP CONFIRMATION',
        quest_d3_title: 'MAINTAIN 100% VITALITY',
        quest_d3_desc: 'PREVENT ANY HP DEPLETION THROUGHOUT THE NIGHT',
        ach_1_title: 'INITIATION PROTOCOL',
        ach_1_desc: 'ACHIEVE 3 CONSECUTIVE ON-TIME DAYS',
        ach_2_title: 'IRON DISCIPLINE',
        ach_2_desc: 'SURVIVE 7 CONSECUTIVE DAYS • GRANTS 1 OVERRIDE KEY',
        ach_3_title: 'NIGHT CONQUEROR',
        ach_3_desc: 'SURVIVE 30 DAYS WITH ZERO SHUTDOWN STRIKES',
        ach_status_unlocked: 'UNLOCKED',
        ach_status_progress: 'IN PROGRESS',
        unit_days: 'DAYS',

        // หน้าสถิติและการวิเคราะห์ (Analytics Page)
        analytics_title: 'SYSTEM TELEMETRY',
        analytics_desc: 'WEEKLY CIRCADIAN RHYTHM ANALYSIS AND DISCIPLINE METRICS',
        analytics_consistency: 'CONSISTENCY RATE',
        analytics_avg_sleep: 'AVERAGE SLEEP',
        analytics_avg_sleep_unit: 'HRS',
        analytics_on_time_rate: 'ON-TIME RECORD',
        analytics_recovery_title: 'RECOVERY EFFICIENCY',
        analytics_recovery_val: 'OPTIMAL',
        analytics_chart_title: '7-DAY SLEEP CYCLE TELEMETRY',
        analytics_chart_target: 'TARGET: 7.75 HRS',
        analytics_total_survived: 'SURVIVAL LOG',

        // หน้าคู่มือและความช่วยเหลือ (Help Page)
        help_title: 'FIELD MANUAL & DOCS',
        help_desc: 'PROTOCOL SPECIFICATIONS, PENALTY MECHANISMS AND ARCHITECTURE',
        help_mechanics_title: 'SLEEP-OR-DIE OPERATIONAL PROTOCOLS',
        help_rule1_title: '1. AUTOMATIC CIRCADIAN CALCULATION',
        help_rule1_desc: 'TARGET WAKE TIME AUTOMATICALLY CALCULATES BEDTIME REVERSING 5 SLEEP CYCLES (90 MIN EACH = 7.5 HRS) PLUS 15 MIN DECOMPRESSION BUFFER (7 HRS 45 MIN TOTAL).',
        help_rule2_title: '2. RAPID VITALITY DEPLETION',
        help_rule2_desc: 'FAILURE TO CONFIRM STASIS AT ZERO-HOUR TRIGGERS -1 HP PER 2 MINUTES AND INITIATES AUDITORY SIREN BROADCASTS.',
        help_rule3_title: '3. 5-STRIKE TERMINATION PROTOCOL',
        help_rule3_desc: 'HP ZERO RESULTS IN CORE SHUTDOWN AND 1 STRIKE. ACCUMULATING 5 STRIKES TRIGGERS PERMANENT LOCKOUT. CLEAR 1 STRIKE VIA 5 CONSECUTIVE ON-TIME DAYS.',
        help_docs_title: 'DOCUMENTATION & ARCHIVES',
        help_gh_title: 'GITHUB REPOSITORY',
        help_gh_desc: 'SOURCE CODE & DISCORD TELEMETRY',
        help_framework_title: 'FRAMEWORK DOCS',
        help_framework_desc: 'LARAVEL 12 & INERTIA REACT',

        // หน้ากระเป๋าเก็บของ (Inventory Page)
        inventory_title: 'ATTACHÉ CASE',
        inventory_desc: 'TACTICAL SPATIAL INVENTORY AND EMERGENCY LIFE-SUPPORT RATIONS',
        inventory_dossier_title: 'OPERATOR DOSSIER',
        inventory_case_title: 'ATTACHÉ MATRIX',
        inventory_capacity: 'CAPACITY:',
        inventory_slots: 'SLOTS',
        inventory_status_ready: 'STATUS: READY',
        inventory_rotate_hint: 'CLICK ITEM TO DEPLOY OR DISCARD',
        inventory_btn_market: 'VISIT BLACK MARKET',
        inventory_camo_active: 'STEALTH CAMO SHIELD: ACTIVE (1-NIGHT STRIKE MITIGATION)',
        item_ration_name: 'RATION',
        item_ration_desc: 'RESTORE +30% HP & GRANTS +1 OVERRIDE KEY',
        item_spray_name: 'EMERGENCY TICKET',
        item_spray_desc: 'EMERGENCY EXTENSION PASS (+30 MIN BUFFER)',
        item_camo_name: 'STEALTH CAMO',
        item_camo_desc: 'CLOAKING FIELD • PREVENTS 1 STRIKE FAILURE',
        item_empty_slot: 'EMPTY SLOT',
        modal_use_title: 'CONFIRM ITEM DEPLOYMENT',
        modal_btn_use: 'DEPLOY ITEM',
        modal_btn_discard: 'DISCARD ITEM',
        modal_btn_cancel: 'CANCEL',

        // หน้าตลาดมืด (Market Page)
        market_title: 'BLACK MARKET',
        market_desc: 'EXP TELEMETRY PROCUREMENT & STORAGE EXPANSION',
        market_exp_available: 'AVAILABLE EXP',
        market_bag_slots: 'STORAGE CAPACITY',
        market_rank_label: 'CLEARANCE RANK',
        market_codec_freq: 'RADIO CODEC: 141.80',
        market_merchant_name: 'UNDERGROUND MERCHANT',
        market_quote: '"WELCOME, STRANGER... HEH HEH HEH... WHAT ARE YA BUYIN\'?"',
        market_warning: 'ALERT: PROCUREMENT DEDUCTS EXP TELEMETRY DIRECTLY',
        market_btn_buy: 'PURCHASE',
        market_btn_upgrade: 'UPGRADE',
        market_upgraded: 'UPGRADED',
        market_btn_inventory: 'VIEW ATTACHÉ CASE',
        market_case_m_title: 'ATTACHÉ CASE (M)',
        market_case_m_desc: 'STORAGE EXPANSION: 16 SLOTS (+4 PERMANENT SLOTS)',
        market_case_l_title: 'ATTACHÉ CASE (L)',
        market_case_l_desc: 'MAX EXPANSION: 20 SLOTS (REQUIRES CASE M)',

        // แผงจำลองสถานะยุทธวิธี (Simulation Lab)
        sim_lab_title: 'TACTICAL SIMULATION LAB',
        sim_btn_hp_minus: '-25% LIFE',
        sim_btn_ff5s: 'FAST FORWARD (5s)',
        sim_btn_alert: '1. ALERT T-30m',
        sim_btn_lockdown: '2. LOCKDOWN T-15m',
        sim_btn_emergency: '3. EMERGENCY T-30s',
        sim_btn_shutdown: '4. MISSION FAILED',
        sim_btn_reset: 'RESET SYSTEM',
        sim_failed_title: 'MISSION FAILED: SYSTEM TERMINATED',
        sim_failed_desc: 'CRITICAL SLEEP DEPRIVATION DETECTED • LIFE MATRIX AT 0%',
        sim_failed_respawn: 'CONTINUE / RESPAWN',
    },
};

export function useTranslation() {
    const [langMode, setLangModeState] = useState<LanguageMode>(() => {
        if (typeof window === 'undefined') return 'normal';
        return (localStorage.getItem('sleep_language_mode') as LanguageMode) || 'normal';
    });

    useEffect(() => {
        const handleStorage = () => {
            const current = (localStorage.getItem('sleep_language_mode') as LanguageMode) || 'normal';
            setLangModeState(current);
        };
        window.addEventListener('sleep_language_mode_changed', handleStorage);
        return () => window.removeEventListener('sleep_language_mode_changed', handleStorage);
    }, []);

    const t = useCallback(
        (key: keyof typeof translations.normal | string, fallback?: string): string => {
            const dict = translations[langMode] || translations.normal;
            return (dict as Record<string, string>)[key] ?? fallback ?? key;
        },
        [langMode]
    );

    const setMode = useCallback((mode: LanguageMode) => {
        setLangModeState(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem('sleep_language_mode', mode);
            window.dispatchEvent(new Event('sleep_language_mode_changed'));
        }
    }, []);

    return {
        langMode,
        isTactical: langMode === 'tactical',
        t,
        setMode,
    };
}
