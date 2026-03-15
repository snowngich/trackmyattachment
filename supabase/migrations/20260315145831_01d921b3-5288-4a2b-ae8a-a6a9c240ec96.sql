-- Confirm testsupervisor email and give supervisor role
UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'testsupervisor@test.com';

-- Change testsupervisor's role from student to supervisor
UPDATE public.user_roles SET role = 'supervisor' WHERE user_id = '1b0df084-4c5c-4bc3-9c70-52c8ba460522';
