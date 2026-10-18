import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

import { isSupabaseConfigured, signUpWithSupabase } from '@/lib/supabase';
import { useState } from 'react';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const [supabaseStatus, setSupabaseStatus] = useState<string | null>(null);

    const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (isSupabaseConfigured() && email && password) {
            try {
                await signUpWithSupabase(email, password, name);
                setSupabaseStatus('Supabase Account Created');
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Register error';
                console.warn('Supabase register sync notice:', message);
            }
        }
    };

    return (
        <>
            <Head title="สมัครสมาชิก" />
            <Form
                {...store.form()}
                onSubmit={handleRegisterSubmit}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">ชื่อผู้ใช้งาน</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="ชื่อผู้ใช้งาน"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">อีเมล</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">รหัสผ่าน</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="รหัสผ่าน"
                                    passwordrules={passwordRules}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    ยืนยันรหัสผ่าน
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="ยืนยันรหัสผ่าน"
                                    passwordrules={passwordRules}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                สมัครสมาชิก
                            </Button>
                        </div>

                        <div className="text-center text-sm text-neutral-400">
                            มีบัญชีผู้ใช้อยู่แล้ว?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                เข้าสู่ระบบ
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {supabaseStatus && (
                <div className="mb-4 text-center text-xs text-emerald-400">
                    {supabaseStatus}
                </div>
            )}
        </>
    );
}

Register.layout = {
    title: 'สมัครสมาชิก',
    description: 'กรอกข้อมูลด้านล่างเพื่อสร้างบัญชีผู้ใช้ใหม่',
};
