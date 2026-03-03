-- ============================================================
-- My Bible App — Supabase 초기 스키마
-- ============================================================

-- 1) profiles ─ 사용자 프로필
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "프로필 본인 조회"
  on public.profiles for select
  using (auth.uid() = id);

create policy "프로필 본인 생성"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "프로필 본인 수정"
  on public.profiles for update
  using (auth.uid() = id);


-- 2) plan_subscriptions ─ 사용자가 시작한 플랜
-- ============================================================
create table public.plan_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  plan_id     text not null,            -- 예: '1year-complete'
  start_date  date not null default current_date,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),

  -- 동일 플랜 중복 구독 방지
  unique (user_id, plan_id)
);

alter table public.plan_subscriptions enable row level security;

create policy "플랜구독 본인 조회"
  on public.plan_subscriptions for select
  using (auth.uid() = user_id);

create policy "플랜구독 본인 생성"
  on public.plan_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "플랜구독 본인 수정"
  on public.plan_subscriptions for update
  using (auth.uid() = user_id);

create policy "플랜구독 본인 삭제"
  on public.plan_subscriptions for delete
  using (auth.uid() = user_id);


-- 3) reading_progress ─ 읽기 진행 상황 (챕터 단위)
-- ============================================================
create table public.reading_progress (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  plan_subscription_id  uuid not null references public.plan_subscriptions(id) on delete cascade,
  day_number            int  not null,   -- 플랜 내 Day 번호
  reading_index         int  not null,   -- 해당 Day readings 배열 내 인덱스
  completed_at          timestamptz not null default now(),

  -- 같은 Day + reading_index 중복 방지
  unique (plan_subscription_id, day_number, reading_index)
);

alter table public.reading_progress enable row level security;

create policy "읽기진행 본인 조회"
  on public.reading_progress for select
  using (auth.uid() = user_id);

create policy "읽기진행 본인 생성"
  on public.reading_progress for insert
  with check (auth.uid() = user_id);

create policy "읽기진행 본인 삭제"
  on public.reading_progress for delete
  using (auth.uid() = user_id);


-- 4) bookmarks ─ 북마크
-- ============================================================
create table public.bookmarks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  version     text not null,             -- 역본 코드 (예: 'krv')
  book        text not null,             -- 책 코드 (예: 'GEN')
  chapter     int  not null,
  verse       int  not null,
  note        text,                      -- 선택적 메모
  created_at  timestamptz not null default now()
);

alter table public.bookmarks enable row level security;

create policy "북마크 본인 조회"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "북마크 본인 생성"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "북마크 본인 수정"
  on public.bookmarks for update
  using (auth.uid() = user_id);

create policy "북마크 본인 삭제"
  on public.bookmarks for delete
  using (auth.uid() = user_id);


-- ============================================================
-- 인덱스 (조회 성능 최적화)
-- ============================================================
create index idx_plan_subscriptions_user  on public.plan_subscriptions(user_id);
create index idx_reading_progress_sub     on public.reading_progress(plan_subscription_id);
create index idx_reading_progress_user    on public.reading_progress(user_id);
create index idx_bookmarks_user           on public.bookmarks(user_id);
create index idx_bookmarks_ref            on public.bookmarks(user_id, version, book, chapter);


-- ============================================================
-- 트리거: 회원가입 시 profiles 자동 생성
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
