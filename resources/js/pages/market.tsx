import React from 'react';
import { Head, router } from '@inertiajs/react';
import { BlackMarketView } from '@/components/Sleep/BlackMarketView';

export default function Market() {
    return (
        <>
            <Head title="ตลาดมืดเสบียง (Black Market) - SleepOrDie" />
            <div className="max-w-4xl w-full mx-auto p-4 md:p-6 select-none">
                <BlackMarketView
                    onSwitchTab={(tabIndex) => {
                        if (tabIndex === 2) {
                            router.visit('/inventory');
                        } else {
                            router.visit('/dashboard');
                        }
                    }}
                />
            </div>
        </>
    );
}
