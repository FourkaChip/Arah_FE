// 마스터 로그인 관련 API 함수들입니다.

// 마스터 로그인 함수입니다.
export const masterLogin = async (email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/master/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email, password}),
    });
    if (!res.ok) throw new Error('로그인 실패');
    return (await res.json()).result;
};

// 마스터 로그인 시 2차 인증을 위한 이메일 전송 함수입니다.
export const sendMasterVerifyCode = async (verifyToken: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/master/verify-code/send`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${verifyToken}`,
        },
    });

    if (!res.ok) throw new Error('인증번호 전송 실패');
    return (await res.json()).result;
};

// 마스터 인증 코드 확인 함수입니다.
export const confirmMasterVerifyCode = async ({
                                                  code,
                                                  verifyToken,
                                              }: {
    code: string;
    verifyToken: string;
}) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/master/verify-code/confirm`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${verifyToken}`,
        },
        body: JSON.stringify({code}),
    });
    if (!res.ok) throw new Error('인증 실패');
    return (await res.json()).result;
};