-- ═══════════════════════════════════════════════════════
-- RX Inc. CMS — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════

-- Popups table
CREATE TABLE IF NOT EXISTS popups (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title_ko    TEXT NOT NULL,
  title_en    TEXT DEFAULT '',
  content_ko  TEXT DEFAULT '',
  content_en  TEXT DEFAULT '',
  image_url   TEXT DEFAULT '',
  link_url    TEXT DEFAULT '',
  link_text_ko TEXT DEFAULT '자세히 보기',
  link_text_en TEXT DEFAULT 'Learn More',
  is_active   BOOLEAN DEFAULT TRUE,
  start_date  DATE,
  end_date    DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- News table
CREATE TABLE IF NOT EXISTS news (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title_ko    TEXT NOT NULL,
  title_en    TEXT DEFAULT '',
  summary_ko  TEXT DEFAULT '',
  summary_en  TEXT DEFAULT '',
  category    TEXT DEFAULT 'News',
  date        DATE NOT NULL,
  link_url    TEXT DEFAULT '',
  image_url   TEXT DEFAULT '',
  is_published BOOLEAN DEFAULT TRUE,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE popups ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (frontend needs this)
CREATE POLICY "popups_read" ON popups FOR SELECT TO anon USING (true);
CREATE POLICY "news_read"   ON news   FOR SELECT TO anon USING (true);

-- Allow authenticated users full access (admin dashboard)
CREATE POLICY "popups_auth_select" ON popups FOR SELECT TO authenticated USING (true);
CREATE POLICY "popups_auth_insert" ON popups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "popups_auth_update" ON popups FOR UPDATE TO authenticated USING (true);
CREATE POLICY "popups_auth_delete" ON popups FOR DELETE TO authenticated USING (true);

CREATE POLICY "news_auth_select" ON news FOR SELECT TO authenticated USING (true);
CREATE POLICY "news_auth_insert" ON news FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "news_auth_update" ON news FOR UPDATE TO authenticated USING (true);
CREATE POLICY "news_auth_delete" ON news FOR DELETE TO authenticated USING (true);

-- Insert test data: popup
INSERT INTO popups (title_ko, title_en, content_ko, content_en, link_url, link_text_ko, link_text_en, is_active)
VALUES (
  'RX Inc. 홈페이지가 새롭게 단장했습니다!',
  'RX Inc. Website Has Been Renewed!',
  '더 나은 경험을 위해 홈페이지를 개편했습니다.\n새로운 기능과 디자인을 확인해 보세요.',
  'We have revamped our website for a better experience.\nCheck out the new features and design.',
  'https://rx.energy',
  '자세히 보기',
  'Learn More',
  TRUE
);

-- Insert test data: news articles
INSERT INTO news (title_ko, title_en, summary_ko, summary_en, category, date, link_url, is_published, sort_order)
VALUES
  (
    'RX, IAEA AI & 원자력 에너지 심포지엄 참가',
    'RX at IAEA AI & Nuclear Energy Symposium',
    'AI 기술을 활용한 원자력 안전 혁신에 관해 발표했습니다.',
    'Presented on nuclear safety innovation leveraging AI technology.',
    'News',
    '2026-02-06',
    'https://www.linkedin.com/company/rx-inc/',
    TRUE,
    0
  ),
  (
    'RX, 2025 KAERI 코어기업 선정',
    'RX Selected as KAERI Core Company 2025',
    '한국원자력연구원 코어기업으로 선정되었습니다.',
    'Selected as a KAERI core company.',
    'News',
    '2026-02-10',
    'https://www.linkedin.com/company/rx-inc/',
    TRUE,
    1
  ),
  (
    'RX CEO 인터뷰: SMR 시대를 위한 원자력 엔지니어링 재정의',
    'RX CEO Interview: Redefining Nuclear Engineering for the SMR Era',
    'SMR 기술의 미래와 RX의 비전에 대해 이야기했습니다.',
    'Discussed the future of SMR technology and RX vision.',
    'Interview',
    '2026-02-10',
    'https://www.linkedin.com/company/rx-inc/',
    TRUE,
    2
  );
