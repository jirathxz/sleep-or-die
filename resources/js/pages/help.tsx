import React from 'react';
import { Head } from '@inertiajs/react';
import { HelpCircle, FolderGit2, BookOpen, ExternalLink, ShieldCheck, Skull, Zap } from 'lucide-react';

export default function Help() {
    return (
        <>
            <Head title="ช่วยเหลือและคู่มือ - SleepOrDie" />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-medium tracking-tight text-white">
                        คู่มือและความช่วยเหลือ
                    </h1>
                    <p className="text-xs text-zinc-500 font-light mt-0.5">
                        คำอธิบายกฎเกณฑ์ กลไกการลงโทษ และเอกสารคู่มือการพัฒนา
                    </p>
                </div>

                {/* Section 1: Core Mechanics Guide */}
                <div className="bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                        <Zap className="size-4 text-emerald-400" />
                        กลไกการทำงานของ SleepOrDie
                    </span>

                    <div className="space-y-3 text-xs">
                        <div className="bg-[#18181b] rounded-xl p-4 space-y-1">
                            <span className="font-medium text-white">1. การคำนวณเวลานอนอัตโนมัติ</span>
                            <p className="text-zinc-400 font-light leading-relaxed">
                                เมื่อคุณกำหนดเวลาตื่น ระบบจะคำนวณเวลาที่ควรเข้านอนย้อนหลัง 5 รอบการนอน รอบละ 90 นาที รวม 7 ชั่วโมง 30 นาที บวกระยะเวลาผ่อนคลาย 15 นาที รวมเป็น 7 ชั่วโมง 45 นาที
                            </p>
                        </div>

                        <div className="bg-[#18181b] rounded-xl p-4 space-y-1">
                            <span className="font-medium text-white">2. การลดลงของพลังชีวิต</span>
                            <p className="text-zinc-400 font-light leading-relaxed">
                                หากถึงเวลาเส้นตายแล้วคุณยังไม่กดยืนยันการนอน เลือดจะเริ่มลดลงทันที 1 หน่วย ทุก 2 นาที และระบบจะส่งสัญญาณเสียงไซเรนเตือนภัย
                            </p>
                        </div>

                        <div className="bg-[#18181b] rounded-xl p-4 space-y-1">
                            <span className="font-medium text-white">3. กฎการระงับบัญชีถาวร 5 สไตรค์</span>
                            <p className="text-zinc-400 font-light leading-relaxed">
                                หากเลือดลดเหลือ 0 จะเกิดการชัตดาวน์และบันทึก 1 สไตรค์ หากสะสมครบ 5 ครั้ง บัญชีจะถูกระงับถาวร • คุณสามารถล้างสไตรค์ได้ 1 ครั้ง เมื่อนอนตรงเวลาติดต่อกันครบ 5 วัน
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 2: Developer & Documentation Links (Requirement #2) */}
                <div className="bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                        <BookOpen className="size-4 text-zinc-400" />
                        เอกสารและซอร์สโค้ด
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <a
                            href="https://github.com/jirathxz/sleep-or-die.git"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#18181b] rounded-xl p-4 flex items-center justify-between hover:bg-zinc-800 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <FolderGit2 className="size-5 text-zinc-400 group-hover:text-white" />
                                <div>
                                    <span className="font-medium text-white">GitHub Repository</span>
                                    <p className="text-[11px] text-zinc-500 font-light">ซอร์สโค้ดและ Discord Bot</p>
                                </div>
                            </div>
                            <ExternalLink className="size-4 text-zinc-600 group-hover:text-white" />
                        </a>

                        <a
                            href="https://laravel.com/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#18181b] rounded-xl p-4 flex items-center justify-between hover:bg-zinc-800 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <BookOpen className="size-5 text-zinc-400 group-hover:text-white" />
                                <div>
                                    <span className="font-medium text-white">Framework Docs</span>
                                    <p className="text-[11px] text-zinc-500 font-light">Laravel 12 & Inertia React</p>
                                </div>
                            </div>
                            <ExternalLink className="size-4 text-zinc-600 group-hover:text-white" />
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}
