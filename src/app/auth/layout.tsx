// /auth 경로는 Supabase 환경변수가 필요하므로
// 정적 프리렌더링을 비활성화합니다.
export const dynamic = 'force-dynamic';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
