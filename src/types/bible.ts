// ============================================================
// 성경 웹앱 타입 정의
// ============================================================

/** 성경 버전 (역본) */
export interface BibleVersion {
  id: string;
  name: string;        // 예: "개역개정", "NIV"
  language: string;    // 예: "ko", "en"
  abbreviation: string; // 예: "KRV", "NIV"
}

/** 성경 책 */
export interface BibleBook {
  id: number;
  name: string;          // 예: "창세기"
  abbreviation: string;  // 예: "창"
  testament: 'old' | 'new';
  chapters: number;      // 총 장 수
}

/** 성경 장 */
export interface BibleChapter {
  book: number;
  chapter: number;
  verses: BibleVerse[];
}

/** 성경 절 */
export interface BibleVerse {
  id: number;
  book: number;
  chapter: number;
  verse: number;
  text: string;
}

/** 읽기 플랜 */
export interface ReadingPlan {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  duration_label: string;   // 예: "365일", "46주"
  category: string;
  image_url?: string;
  icon?: string;            // lucide 아이콘명
  gradient?: string;        // CSS 그라데이션 클래스
  created_at: string;
}

/** 사용자의 플랜 진행 정보 (카드 표시용) */
export interface PlanProgressInfo {
  planId: string;
  started: boolean;
  progressPercent: number;  // 0~100
  currentDay: number;
  totalDays: number;
}

/** 플랜 일일 과제 */
export interface PlanDay {
  id: string;
  plan_id: string;
  day_number: number;
  readings: PlanReading[];
}

/** 플랜 읽기 범위 */
export interface PlanReading {
  book: number;
  chapter_start: number;
  chapter_end: number;
}

/** 사용자 플랜 진행 상태 */
export interface UserPlanProgress {
  id: string;
  user_id: string;
  plan_id: string;
  current_day: number;
  completed_days: number[];
  started_at: string;
  completed_at?: string;
}

/** 사용자 프로필 */
export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  created_at: string;
}

/** 하이라이트 / 밑줄 */
export interface Highlight {
  id: string;
  user_id: string;
  book: number;
  chapter: number;
  verse: number;
  color: string;
  created_at: string;
}

/** 북마크 */
export interface Bookmark {
  id: string;
  user_id: string;
  book: number;
  chapter: number;
  verse?: number;
  note?: string;
  created_at: string;
}
