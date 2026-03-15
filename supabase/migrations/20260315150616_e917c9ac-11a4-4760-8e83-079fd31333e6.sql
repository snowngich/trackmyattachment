-- Insert test attachment for the flow student with active status
INSERT INTO public.attachments (student_id, company_id, supervisor_id, coordinator_id, supervisor_name, lecturer_name, start_date, end_date, status)
VALUES ('5738baed-d664-47eb-8da5-60ef7c40467f', '97442ab3-86c5-4c39-ae97-4161be735163', '1b0df084-4c5c-4bc3-9c70-52c8ba460522', '348bb10c-8ae6-4995-aded-2f992ce3d45c', 'Test Supervisor', 'Josh', '2026-03-01', '2026-06-30', 'active');

-- Insert a test log for that attachment
INSERT INTO public.logs (attachment_id, week_number, content, submitted_at, supervisor_approved)
VALUES (
  (SELECT id FROM public.attachments WHERE student_id = '5738baed-d664-47eb-8da5-60ef7c40467f' ORDER BY created_at DESC LIMIT 1),
  1,
  'Week 1 activities at Safaricom PLC',
  now(),
  false
);

-- Insert test log entries
INSERT INTO public.log_entries (log_id, entry_date, activity, time_from, time_to, lesson_learnt)
VALUES (
  (SELECT id FROM public.logs WHERE attachment_id = (SELECT id FROM public.attachments WHERE student_id = '5738baed-d664-47eb-8da5-60ef7c40467f' ORDER BY created_at DESC LIMIT 1) LIMIT 1),
  '2026-03-03', 'Orientation and setup of development environment', '08:00', '17:00', 'Learned about company tech stack'
);
