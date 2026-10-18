drop policy if exists "team read" on storage.objects;
drop policy if exists "team admin write" on storage.objects;
drop table if exists sessions, team, settings cascade;
drop function if exists is_admin();

create table settings(
  id int primary key default 1 check(id=1),
  tagline text, term_question text, about text, stats jsonb,
  join_url text, intake_date text, email text, instagram text, override_msg text
);

create table sessions(
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, session_date date not null,
  start_time time, end_time time, venue text,
  status text default 'upcoming' check(status in('upcoming','cancelled','completed'))
);

create table team(
  id uuid primary key default gen_random_uuid(),
  name text not null, role text not null, photo_url text, sort int default 0
);

create function is_admin() returns boolean language sql stable as $fn$
  select auth.uid() = '9488915f-55b1-44ed-9353-5bb6b061f107'::uuid
$fn$;

alter table settings enable row level security;
alter table sessions enable row level security;
alter table team enable row level security;

create policy "read" on settings for select using(true);
create policy "admin write" on settings for all using(is_admin()) with check(is_admin());
create policy "read" on sessions for select using(true);
create policy "admin write" on sessions for all using(is_admin()) with check(is_admin());
create policy "read" on team for select using(true);
create policy "admin write" on team for all using(is_admin()) with check(is_admin());

insert into storage.buckets(id,name,public) values('team','team',true) on conflict (id) do nothing;
create policy "team read" on storage.objects for select using(bucket_id='team');
create policy "team admin write" on storage.objects for all
  using(bucket_id='team' and is_admin()) with check(bucket_id='team' and is_admin());

insert into settings values(
  1,
  'Real money questions. Student-led answers.',
  'What are the basics of finance?',
  'Every term, the club votes on one real-world money question, like how stock markets crash or why they exist. We split into small groups, look things up, ask people who might know, and put together a short presentation for everyone.

Nobody in this club is an expert, and you do not need a finance background. It is less lecture, more group project you actually chose.',
  '{"members":"4","meetings":"2","questions":"0"}',
  'https://docs.google.com/forms/d/e/1FAIpQLSfW34CR1Gh99Dr2JKFym2o9H3QfB98kz9mCxxakNyWAa6TwYg/viewform',
  'To be announced',
  'ishantjain0804@gmail.com',
  '',
  ''
);

insert into team(name,role,sort) values
  ('Ishant Jain','President',1),
  ('Aditya Kumar Jain','Vice President',2),
  ('Maanvika','Secretary',3),
  ('Hitesh Somani','Treasurer',4);

insert into sessions(title,description,session_date,start_time,end_time,venue) values(
  'Kickoff: choosing this term''s question',
  'Everyone pitches a money question and we vote on one.',
  '2026-10-24','15:30','16:30','School library (update in admin)'
);