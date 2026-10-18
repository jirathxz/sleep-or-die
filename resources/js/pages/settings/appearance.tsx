import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="การแสดงผล" />

            <h1 className="sr-only">การแสดงผล</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="การแสดงผล"
                    description="ปรับแต่งรูปแบบธีมและการแสดงผลของระบบ"
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'การแสดงผล',
            href: editAppearance(),
        },
    ],
};
