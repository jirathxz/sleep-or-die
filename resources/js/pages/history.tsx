import React, { useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { useSleepStore } from '@/stores/useSleepStore';
import { MissionHistoryView } from '@/components/Sleep/MissionHistoryView';

export default function History() {
    const { fetchStatus } = useSleepStore();

    useEffect(() => {
        fetchStatus();
    }, []);

    return (
        <>
            <Head title="ประวัติการนอน - SleepOrDie" />
            <div className="max-w-4xl w-full mx-auto p-4 md:p-6 select-none">
                <MissionHistoryView />
            </div>
        </>
    );
}
