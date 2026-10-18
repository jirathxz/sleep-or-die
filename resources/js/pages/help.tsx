import React from 'react';
import { Head } from '@inertiajs/react';
import { FolderGit2, BookOpen, ExternalLink, Zap } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function Help() {
    const { t } = useTranslation();

    return (
        <>
            <Head title={`${t('help_title')} - SleepOrDie`} />

            <div className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 select-none">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-medium tracking-tight text-white">
                        {t('help_title')}
                    </h1>
                    <p className="text-xs text-zinc-500 font-light mt-0.5">
                        {t('help_desc')}
                    </p>
                </div>

                {/* Section 1: Core Mechanics Guide */}
                <div className="bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                        <Zap className="size-4 text-emerald-400" />
                        {t('help_mechanics_title')}
                    </span>

                    <div className="space-y-3 text-xs">
                        <div className="bg-[#18181b] rounded-xl p-4 space-y-1">
                            <span className="font-medium text-white">{t('help_rule1_title')}</span>
                            <p className="text-zinc-400 font-light leading-relaxed">
                                {t('help_rule1_desc')}
                            </p>
                        </div>

                        <div className="bg-[#18181b] rounded-xl p-4 space-y-1">
                            <span className="font-medium text-white">{t('help_rule2_title')}</span>
                            <p className="text-zinc-400 font-light leading-relaxed">
                                {t('help_rule2_desc')}
                            </p>
                        </div>

                        <div className="bg-[#18181b] rounded-xl p-4 space-y-1">
                            <span className="font-medium text-white">{t('help_rule3_title')}</span>
                            <p className="text-zinc-400 font-light leading-relaxed">
                                {t('help_rule3_desc')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 2: Developer & Documentation Links */}
                <div className="bg-[#121215] rounded-2xl p-5 md:p-6 space-y-4 shadow-sm">
                    <span className="text-sm font-medium text-white flex items-center gap-2">
                        <BookOpen className="size-4 text-zinc-400" />
                        {t('help_docs_title')}
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
                                    <span className="font-medium text-white">{t('help_gh_title')}</span>
                                    <p className="text-[11px] text-zinc-500 font-light">{t('help_gh_desc')}</p>
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
                                    <span className="font-medium text-white">{t('help_framework_title')}</span>
                                    <p className="text-[11px] text-zinc-500 font-light">{t('help_framework_desc')}</p>
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
