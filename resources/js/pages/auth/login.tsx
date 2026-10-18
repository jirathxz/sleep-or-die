import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { isSupabaseConfigured, signInWithSupabase } from '@/lib/supabase';
import { useState } from 'react';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [supabaseStatus, setSupabaseStatus] = useState<string | null>(null);

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (isSupabaseConfigured() && email && password) {
            try {
                await signInWithSupabase(email, password);
                setSupabaseStatus('Supabase Authenticated');
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Auth error';
                console.warn('Supabase sign-in sync notice:', message);
            }
        }
    };
    return (
        <>
            <Head title="เข้าสู่ระบบ" />

            <Form
                {...store.form()}
                onSubmit={handleFormSubmit}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">อีเมล</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">รหัสผ่าน</Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            ลืมรหัสผ่าน?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="รหัสผ่าน"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">จดจำฉันไว้ในระบบ</Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                เข้าสู่ระบบ
                            </Button>
                        </div>

                        <div className="text-center text-sm text-neutral-400">
                            ยังไม่มีบัญชีผู้ใช้?{' '}
                            <TextLink href={register()} tabIndex={5}>
                                สมัครสมาชิก
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-emerald-400">
                    {status}
                </div>
            )}
            {supabaseStatus && (
                <div className="mb-4 text-center text-xs text-emerald-400">
                    {supabaseStatus}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'เข้าสู่ระบบ',
    description: 'กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ',
};
