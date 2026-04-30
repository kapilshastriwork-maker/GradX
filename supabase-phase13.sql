-- Community Posts table
create table if not exists public.community_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  author_name text not null,
  author_initials text not null,
  category text not null,
  title text not null,
  content text not null,
  country text,
  field text,
  likes integer default 0,
  is_shikha_answered boolean default false,
  shikha_answer text,
  created_at timestamptz default now()
);

alter table public.community_posts enable row level security;

create policy "Anyone can read posts"
  on public.community_posts for select
  using (true);

create policy "Users can insert own posts"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own posts"
  on public.community_posts for update
  using (auth.uid() = user_id);

-- Post replies table
create table if not exists public.post_replies (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.community_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  author_name text not null,
  author_initials text not null,
  content text not null,
  is_shikha boolean default false,
  created_at timestamptz default now()
);

alter table public.post_replies enable row level security;

create policy "Anyone can read replies"
  on public.post_replies for select
  using (true);

create policy "Users can insert replies"
  on public.post_replies for insert
  with check (auth.uid() = user_id);

-- Cohort messages table
create table if not exists public.cohort_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  author_name text not null,
  author_initials text not null,
  cohort_key text not null,
  message text not null,
  created_at timestamptz default now()
);

alter table public.cohort_messages enable row level security;

create policy "Anyone can read cohort messages"
  on public.cohort_messages for select
  using (true);

create policy "Users can insert cohort messages"
  on public.cohort_messages for insert
  with check (auth.uid() = user_id);

-- Seed 6 realistic community posts so the page isn't empty on first load
insert into public.community_posts
  (user_id, author_name, author_initials, category, title, content, country, field, likes, is_shikha_answered, shikha_answer)
values
  ('00000000-0000-0000-0000-000000000001', 'Arjun Mehta', 'AM', 'Admissions', 'Got into UT Austin MS CS with 8.2 CGPA — my full journey', 'Hey everyone! I just got my I-20 from UT Austin for Fall 2026. I had a 8.2 CGPA from NIT Trichy, GRE 318 (Q167/V151), no publications but 2 solid internships. Applied to 8 universities, got into 4. Happy to answer any questions about the process!', 'USA', 'Computer Science', 47, true, 'Congratulations Arjun! This is a fantastic result. Your GRE quant score of 167 was a key differentiator, and 2 strong internships often outweigh publications for industry-focused MS programs. For anyone reading this — Arjun''s profile is a great example of how a well-rounded application beats a perfect-on-paper one every time.'),
  ('00000000-0000-0000-0000-000000000002', 'Priya Sharma', 'PS', 'Visa', 'F-1 visa approved in 3 minutes — what I said in the interview', 'Just got my F-1 approved at the Chennai consulate! The officer asked 4 questions: Which university, what program, how are you funding it, and do you plan to return to India. Whole thing took 3 minutes. Key: be confident, know your program details, and have a clear story about returning to India. My funding answer: education loan from Poonawalla Fincorp + family support.', 'USA', 'Data Science', 89, true, 'This is gold, Priya! The 4 questions she mentioned are exactly what most F-1 interviews cover. The most important thing is the last one — ties to India. Mentioning a specific plan like joining a family business, a job offer, or returning to support parents makes a huge difference. Bilkul, you nailed it!'),
  ('00000000-0000-0000-0000-000000000003', 'Rahul Nair', 'RN', 'Finance', 'Poonawalla Fincorp loan experience — honest review', 'Just got my education loan sanctioned for 28 lakhs at 10.5%. The process took 9 days from application to sanction letter. Documents they actually verified: admission letter, transcripts, co-applicant salary slips, and bank statements. DigiLocker made it super easy. The 12-month EMI waiver after graduation is genuinely helpful for the initial months abroad.', 'Canada', 'MBA', 62, false, null),
  ('00000000-0000-0000-0000-000000000004', 'Sneha Patel', 'SP', 'SOP', 'My SOP got me into 6/8 universities — here is the structure I used', 'I used a structure that worked really well: Hook (specific moment that sparked interest) → Academic background (2 sentences max) → Key project that connects to program → Why this specific program/faculty → Career goal (specific, not vague) → Why I will succeed. Kept it to 950 words. Avoid starting with "I have always been passionate about..." — every officer has read that 10,000 times.', 'UK', 'Computer Science', 134, true, 'Sneha''s structure is almost exactly what I recommend to every student! The hook is the most underrated part — a specific moment or observation is 10x more memorable than a generic passion statement. And 950 words is the sweet spot — enough to tell your story, short enough to keep the reader engaged.'),
  ('00000000-0000-0000-0000-000000000005', 'Vikram Singh', 'VS', 'Accommodation', 'Boston apartment hunting guide for Indian students', 'Spent 3 weeks researching this so you don''t have to. Best areas near MIT/Harvard: Somerville (cheaper, 20 min by T), Cambridge (expensive but walkable), Allston (student area, many Indians). Average rent for shared 2BR: $1100-1400/person. Use Zillow and Facebook groups "Indians in Boston" for leads. Book at least 3 months before arrival — good places go fast.', 'USA', 'Engineering', 78, false, null),
  ('00000000-0000-0000-0000-000000000006', 'Ananya Krishnan', 'AK', 'Scholarships', 'Won the Fulbright-Nehru Fellowship — my application tips', 'I won the Fulbright-Nehru Master''s Fellowship for my MS in Public Policy at Harvard. The key differentiators: strong statement of purpose focusing on cross-cultural exchange (not just academic goals), 3 very specific community leadership examples, and a clear plan to return to India and apply learnings. The interview was the hardest part — they really probe your India connection.', 'USA', 'Public Policy', 203, true, 'Ananya this is incredibly inspiring! Fulbright is one of the most prestigious and also most misunderstood scholarships. So many students focus purely on academics but Fulbright is specifically looking for cultural ambassadors — people who will strengthen US-India ties. Your point about the India connection is the single most important insight for any Fulbright applicant.');