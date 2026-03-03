import type { BibleBook, BibleVersion, BibleVerse } from '@/types/bible';

// ============================================================
// 성경 데이터 로드 유틸리티
// public/bible-data/{version}/{book}.json 에서 로드
// 메모리 캐시로 같은 요청은 재사용
// ============================================================

// ── 캐시 ──────────────────────────────────────────────────────
// key: "krv/gen" → 해당 책 전체 JSON
const bookDataCache = new Map<string, BibleBookData>();

/** JSON 파일 하나(책 전체)의 구조 */
interface BibleBookData {
    book: string;           // 약어 (예: "gen")
    name: string;           // 한글 이름 (예: "창세기")
    name_en: string;        // 영어 이름 (예: "Genesis")
    chapters: ChapterData[];
}

interface ChapterData {
    chapter: number;
    verses: VerseData[];
}

interface VerseData {
    verse: number;
    text: string;
}

/** 검색 결과 타입 */
export interface SearchResult {
    version: string;
    book: string;
    bookName: string;
    chapter: number;
    verse: number;
    text: string;
}

// ── 66권 메타 데이터 ──────────────────────────────────────────
// 각 책의 약어(영문 파일명)·한글명·영문명·총 장수 등
interface BookInfo {
    id: number;
    abbr: string;        // JSON 파일명 겸 약어 (예: "gen")
    name: string;        // 한글 이름
    name_en: string;     // 영어 이름
    testament: 'old' | 'new';
    chapters: number;    // 총 장수
}

export const BOOK_INFO: BookInfo[] = [
    // ── 구약 39권 ──
    { id: 1, abbr: 'gen', name: '창세기', name_en: 'Genesis', testament: 'old', chapters: 50 },
    { id: 2, abbr: 'exo', name: '출애굽기', name_en: 'Exodus', testament: 'old', chapters: 40 },
    { id: 3, abbr: 'lev', name: '레위기', name_en: 'Leviticus', testament: 'old', chapters: 27 },
    { id: 4, abbr: 'num', name: '민수기', name_en: 'Numbers', testament: 'old', chapters: 36 },
    { id: 5, abbr: 'deu', name: '신명기', name_en: 'Deuteronomy', testament: 'old', chapters: 34 },
    { id: 6, abbr: 'jos', name: '여호수아', name_en: 'Joshua', testament: 'old', chapters: 24 },
    { id: 7, abbr: 'jdg', name: '사사기', name_en: 'Judges', testament: 'old', chapters: 21 },
    { id: 8, abbr: 'rut', name: '룻기', name_en: 'Ruth', testament: 'old', chapters: 4 },
    { id: 9, abbr: '1sa', name: '사무엘상', name_en: '1 Samuel', testament: 'old', chapters: 31 },
    { id: 10, abbr: '2sa', name: '사무엘하', name_en: '2 Samuel', testament: 'old', chapters: 24 },
    { id: 11, abbr: '1ki', name: '열왕기상', name_en: '1 Kings', testament: 'old', chapters: 22 },
    { id: 12, abbr: '2ki', name: '열왕기하', name_en: '2 Kings', testament: 'old', chapters: 25 },
    { id: 13, abbr: '1ch', name: '역대상', name_en: '1 Chronicles', testament: 'old', chapters: 29 },
    { id: 14, abbr: '2ch', name: '역대하', name_en: '2 Chronicles', testament: 'old', chapters: 36 },
    { id: 15, abbr: 'ezr', name: '에스라', name_en: 'Ezra', testament: 'old', chapters: 10 },
    { id: 16, abbr: 'neh', name: '느헤미야', name_en: 'Nehemiah', testament: 'old', chapters: 13 },
    { id: 17, abbr: 'est', name: '에스더', name_en: 'Esther', testament: 'old', chapters: 10 },
    { id: 18, abbr: 'job', name: '욥기', name_en: 'Job', testament: 'old', chapters: 42 },
    { id: 19, abbr: 'psa', name: '시편', name_en: 'Psalms', testament: 'old', chapters: 150 },
    { id: 20, abbr: 'pro', name: '잠언', name_en: 'Proverbs', testament: 'old', chapters: 31 },
    { id: 21, abbr: 'ecc', name: '전도서', name_en: 'Ecclesiastes', testament: 'old', chapters: 12 },
    { id: 22, abbr: 'sng', name: '아가', name_en: 'Song of Solomon', testament: 'old', chapters: 8 },
    { id: 23, abbr: 'isa', name: '이사야', name_en: 'Isaiah', testament: 'old', chapters: 66 },
    { id: 24, abbr: 'jer', name: '예레미야', name_en: 'Jeremiah', testament: 'old', chapters: 52 },
    { id: 25, abbr: 'lam', name: '예레미야애가', name_en: 'Lamentations', testament: 'old', chapters: 5 },
    { id: 26, abbr: 'ezk', name: '에스겔', name_en: 'Ezekiel', testament: 'old', chapters: 48 },
    { id: 27, abbr: 'dan', name: '다니엘', name_en: 'Daniel', testament: 'old', chapters: 12 },
    { id: 28, abbr: 'hos', name: '호세아', name_en: 'Hosea', testament: 'old', chapters: 14 },
    { id: 29, abbr: 'jol', name: '요엘', name_en: 'Joel', testament: 'old', chapters: 3 },
    { id: 30, abbr: 'amo', name: '아모스', name_en: 'Amos', testament: 'old', chapters: 9 },
    { id: 31, abbr: 'oba', name: '오바댜', name_en: 'Obadiah', testament: 'old', chapters: 1 },
    { id: 32, abbr: 'jon', name: '요나', name_en: 'Jonah', testament: 'old', chapters: 4 },
    { id: 33, abbr: 'mic', name: '미가', name_en: 'Micah', testament: 'old', chapters: 7 },
    { id: 34, abbr: 'nam', name: '나훔', name_en: 'Nahum', testament: 'old', chapters: 3 },
    { id: 35, abbr: 'hab', name: '하박국', name_en: 'Habakkuk', testament: 'old', chapters: 3 },
    { id: 36, abbr: 'zep', name: '스바냐', name_en: 'Zephaniah', testament: 'old', chapters: 3 },
    { id: 37, abbr: 'hag', name: '학개', name_en: 'Haggai', testament: 'old', chapters: 2 },
    { id: 38, abbr: 'zec', name: '스가랴', name_en: 'Zechariah', testament: 'old', chapters: 14 },
    { id: 39, abbr: 'mal', name: '말라기', name_en: 'Malachi', testament: 'old', chapters: 4 },
    // ── 신약 27권 ──
    { id: 40, abbr: 'mat', name: '마태복음', name_en: 'Matthew', testament: 'new', chapters: 28 },
    { id: 41, abbr: 'mrk', name: '마가복음', name_en: 'Mark', testament: 'new', chapters: 16 },
    { id: 42, abbr: 'luk', name: '누가복음', name_en: 'Luke', testament: 'new', chapters: 24 },
    { id: 43, abbr: 'jhn', name: '요한복음', name_en: 'John', testament: 'new', chapters: 21 },
    { id: 44, abbr: 'act', name: '사도행전', name_en: 'Acts', testament: 'new', chapters: 28 },
    { id: 45, abbr: 'rom', name: '로마서', name_en: 'Romans', testament: 'new', chapters: 16 },
    { id: 46, abbr: '1co', name: '고린도전서', name_en: '1 Corinthians', testament: 'new', chapters: 16 },
    { id: 47, abbr: '2co', name: '고린도후서', name_en: '2 Corinthians', testament: 'new', chapters: 13 },
    { id: 48, abbr: 'gal', name: '갈라디아서', name_en: 'Galatians', testament: 'new', chapters: 6 },
    { id: 49, abbr: 'eph', name: '에베소서', name_en: 'Ephesians', testament: 'new', chapters: 6 },
    { id: 50, abbr: 'php', name: '빌립보서', name_en: 'Philippians', testament: 'new', chapters: 4 },
    { id: 51, abbr: 'col', name: '골로새서', name_en: 'Colossians', testament: 'new', chapters: 4 },
    { id: 52, abbr: '1th', name: '데살로니가전서', name_en: '1 Thessalonians', testament: 'new', chapters: 5 },
    { id: 53, abbr: '2th', name: '데살로니가후서', name_en: '2 Thessalonians', testament: 'new', chapters: 3 },
    { id: 54, abbr: '1ti', name: '디모데전서', name_en: '1 Timothy', testament: 'new', chapters: 6 },
    { id: 55, abbr: '2ti', name: '디모데후서', name_en: '2 Timothy', testament: 'new', chapters: 4 },
    { id: 56, abbr: 'tit', name: '디도서', name_en: 'Titus', testament: 'new', chapters: 3 },
    { id: 57, abbr: 'phm', name: '빌레몬서', name_en: 'Philemon', testament: 'new', chapters: 1 },
    { id: 58, abbr: 'heb', name: '히브리서', name_en: 'Hebrews', testament: 'new', chapters: 13 },
    { id: 59, abbr: 'jas', name: '야고보서', name_en: 'James', testament: 'new', chapters: 5 },
    { id: 60, abbr: '1pe', name: '베드로전서', name_en: '1 Peter', testament: 'new', chapters: 5 },
    { id: 61, abbr: '2pe', name: '베드로후서', name_en: '2 Peter', testament: 'new', chapters: 3 },
    { id: 62, abbr: '1jn', name: '요한일서', name_en: '1 John', testament: 'new', chapters: 5 },
    { id: 63, abbr: '2jn', name: '요한이서', name_en: '2 John', testament: 'new', chapters: 1 },
    { id: 64, abbr: '3jn', name: '요한삼서', name_en: '3 John', testament: 'new', chapters: 1 },
    { id: 65, abbr: 'jud', name: '유다서', name_en: 'Jude', testament: 'new', chapters: 1 },
    { id: 66, abbr: 'rev', name: '요한계시록', name_en: 'Revelation', testament: 'new', chapters: 22 },
];

// ── 역본 목록 ─────────────────────────────────────────────────
export const BIBLE_VERSIONS: BibleVersion[] = [
    { id: 'krv', name: '개역개정', language: 'ko', abbreviation: 'KRV' },
    { id: 'kor', name: '우리말성경', language: 'ko', abbreviation: 'KOR' },
    { id: 'niv', name: 'NIV', language: 'en', abbreviation: 'NIV' },
];

// ── 기존 하위 호환 ────────────────────────────────────────────
/** BibleBook 형태로 변환 (기존 코드와 호환) */
export const BIBLE_BOOKS: BibleBook[] = BOOK_INFO.map((b) => ({
    id: b.id,
    name: b.name,
    abbreviation: b.abbr,
    testament: b.testament,
    chapters: b.chapters,
}));

export function getBookById(bookId: number): BibleBook | undefined {
    return BIBLE_BOOKS.find((b) => b.id === bookId);
}

export function getOldTestamentBooks(): BibleBook[] {
    return BIBLE_BOOKS.filter((b) => b.testament === 'old');
}

export function getNewTestamentBooks(): BibleBook[] {
    return BIBLE_BOOKS.filter((b) => b.testament === 'new');
}

// ============================================================
// 핵심 유틸리티 (JSON 기반, 메모리 캐시)
// ============================================================

/**
 * 내부: 특정 역본의 특정 책 JSON을 fetch + 캐시
 * 경로: /bible-data/{version}/{book}.json
 */
async function loadBookData(version: string, bookAbbr: string): Promise<BibleBookData | null> {
    const cacheKey = `${version}/${bookAbbr}`;

    if (bookDataCache.has(cacheKey)) {
        return bookDataCache.get(cacheKey)!;
    }

    try {
        const res = await fetch(`/bible-data/${version}/${bookAbbr}.json`);
        if (!res.ok) {
            console.error(`[bible-data] ${cacheKey} 로드 실패 (${res.status})`);
            return null;
        }
        const data: BibleBookData = await res.json();
        bookDataCache.set(cacheKey, data);
        return data;
    } catch (err) {
        console.error(`[bible-data] ${cacheKey} fetch 에러:`, err);
        return null;
    }
}

// ── 1. getBibleBooks ──────────────────────────────────────────
/**
 * 해당 번역본의 모든 책 목록 반환
 * (메타데이터 기반이라 네트워크 요청 없음)
 */
export function getBibleBooks(version: string): BookInfo[] {
    // 현재는 모든 역본이 66권 동일하므로 그대로 반환
    // 향후 역본별 차이가 있다면 여기서 필터링 가능
    return BOOK_INFO;
}

// ── 2. getChapter ─────────────────────────────────────────────
/**
 * 특정 장의 모든 절 반환
 * @param version - 역본 코드 (예: "krv")
 * @param book    - 책 약어 (예: "gen")
 * @param chapter - 장 번호 (1부터 시작)
 * @returns 절 배열 또는 빈 배열
 */
export async function getChapter(
    version: string,
    book: string,
    chapter: number
): Promise<VerseData[]> {
    const data = await loadBookData(version, book);
    if (!data) return [];

    const ch = data.chapters.find((c) => c.chapter === chapter);
    return ch?.verses ?? [];
}

// ── 3. getVerse ───────────────────────────────────────────────
/**
 * 특정 절 하나 반환
 * @returns 절 데이터 또는 null
 */
export async function getVerse(
    version: string,
    book: string,
    chapter: number,
    verse: number
): Promise<VerseData | null> {
    const verses = await getChapter(version, book, chapter);
    return verses.find((v) => v.verse === verse) ?? null;
}

// ── 4. searchBible ────────────────────────────────────────────
/**
 * 성경 전체에서 텍스트 검색
 * 캐시된 책만 검색하므로, 전체 검색 시에는 모든 책을 먼저 로드해야 합니다.
 *
 * @param version - 역본 코드
 * @param query   - 검색어 (대소문자 무시)
 * @param maxResults - 최대 결과 수 (기본 50)
 * @returns 검색 결과 배열
 */
export async function searchBible(
    version: string,
    query: string,
    maxResults = 50
): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // 모든 66권을 순회하며 검색
    for (const book of BOOK_INFO) {
        if (results.length >= maxResults) break;

        const data = await loadBookData(version, book.abbr);
        if (!data) continue;

        for (const ch of data.chapters) {
            if (results.length >= maxResults) break;

            for (const v of ch.verses) {
                if (results.length >= maxResults) break;

                if (v.text.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        version,
                        book: book.abbr,
                        bookName: book.name,
                        chapter: ch.chapter,
                        verse: v.verse,
                        text: v.text,
                    });
                }
            }
        }
    }

    return results;
}

// ── 5. getBookInfo ────────────────────────────────────────────
/**
 * 책 약어로 책 정보 조회
 * @param bookAbbr - 책 약어 (예: "gen", "psa", "mat")
 * @returns 책 메타 정보 또는 undefined
 */
export function getBookInfo(bookAbbr: string): BookInfo | undefined {
    return BOOK_INFO.find((b) => b.abbr === bookAbbr);
}

// ── 기존 호환: loadChapter (BibleVerse[] 형태) ───────────────
/**
 * 기존 컴포넌트와 호환되는 장 로드 함수
 * BibleVerse 타입으로 변환하여 반환
 */
export async function loadChapter(
    version: string,
    bookId: number,
    chapter: number
): Promise<BibleVerse[]> {
    const bookInfo = BOOK_INFO.find((b) => b.id === bookId);
    if (!bookInfo) return [];

    const verses = await getChapter(version, bookInfo.abbr, chapter);

    return verses.map((v, idx) => ({
        id: bookId * 100000 + chapter * 1000 + v.verse,
        book: bookId,
        chapter,
        verse: v.verse,
        text: v.text,
    }));
}
