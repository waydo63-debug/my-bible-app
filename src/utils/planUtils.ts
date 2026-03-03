// ============================================================
// 플랜 유틸리티
// JSON 범위 데이터를 개별 챕터 배열로 변환
// ============================================================

import type { PlanDay, Reading } from '@/types/plan';
import { BOOK_INFO } from '@/lib/bible-data';

/** 개별 챕터 아이템 */
export interface ExpandedChapter {
    /** 성경 책 코드 (예: "GEN") */
    book: string;
    /** BOOK_INFO 숫자 ID (라우팅용, 예: 1) */
    bookId: number;
    /** 장 번호 */
    chapter: number;
    /** 표시 라벨 (예: "창세기 1장") */
    label: string;
    /** 원래 readings 배열 내 인덱스 */
    readingIndex: number;
    /** 고유 키 (예: "GEN-1") — 스토어에서 완료 추적용 */
    chapterKey: string;
}

/**
 * 책 코드(대문자) → 한글 이름 변환
 * JSON의 book 필드("GEN")를 BOOK_INFO의 abbr("gen")와 매칭
 */
function getBookName(bookCode: string): string {
    const info = BOOK_INFO.find(
        (b) => b.abbr === bookCode.toLowerCase(),
    );
    return info?.name ?? bookCode;
}

/**
 * 책 코드(대문자) → BOOK_INFO 숫자 ID 변환
 * 성경 본문 페이지 라우팅(/bible/[version]/[bookId]/[chapter])에 사용
 */
function getBookId(bookCode: string): number {
    const info = BOOK_INFO.find(
        (b) => b.abbr === bookCode.toLowerCase(),
    );
    return info?.id ?? 0;
}

/**
 * PlanDay의 readings 배열을 개별 챕터 배열로 전개
 *
 * @example
 * // readings: [{ book: "GEN", startChapter: 1, endChapter: 3, label: "창세기 1-3장" }]
 * // → [
 * //   { book: "GEN", bookId: 1, chapter: 1, label: "창세기 1장", chapterKey: "GEN-1", ... },
 * //   { book: "GEN", bookId: 1, chapter: 2, label: "창세기 2장", chapterKey: "GEN-2", ... },
 * //   { book: "GEN", bookId: 1, chapter: 3, label: "창세기 3장", chapterKey: "GEN-3", ... },
 * // ]
 */
export function expandReadings(day: PlanDay): ExpandedChapter[] {
    const result: ExpandedChapter[] = [];

    day.readings.forEach((reading: Reading, readingIndex: number) => {
        const bookName = getBookName(reading.book);
        const bookId = getBookId(reading.book);

        for (let ch = reading.startChapter; ch <= reading.endChapter; ch++) {
            result.push({
                book: reading.book,
                bookId,
                chapter: ch,
                label: `${bookName} ${ch}장`,
                readingIndex,
                chapterKey: `${reading.book}-${ch}`,
            });
        }
    });

    return result;
}

/**
 * 특정 Day의 전체 챕터 키 목록을 반환
 * (모든 챕터 완료 여부 확인에 사용)
 */
export function getAllChapterKeys(day: PlanDay): string[] {
    return expandReadings(day).map((ch) => ch.chapterKey);
}
