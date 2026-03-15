-- Update passwords for test accounts (password: Test1234!)
UPDATE auth.users SET encrypted_password = crypt('Test1234!', gen_salt('bf')) WHERE email IN ('testflowstudent@test.com', 'testsupervisor@test.com');
