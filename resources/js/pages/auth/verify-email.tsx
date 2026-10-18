import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';

export default function VerifyEmail() {
    return (
        <div className="space-y-4 text-center">
            <Head title="Email verification" />
            <p className="text-sm text-neutral-400">
                ระบบไม่จำเป็นต้องยืนยันอีเมล สามารถเข้าใช้งานแดชบอร์ดได้ทันที
            </p>
            <Link href={dashboard()}>
                <Button className="w-full">ไปที่หน้าแดชบอร์ด</Button>
            </Link>
        </div>
    );
}

VerifyEmail.layout = {
    title: 'Email verification',
    description: 'Email verification is not required.',
};
