// 관리자 로그인 관련 API 함수들입니다.
export const adminLogin = async (email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/auth/login2`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || '로그인 실패');
    }

    const json = await res.json();
    return json.result;
};