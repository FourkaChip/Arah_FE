// sessionStorage 내의 accessToken을 decode하는 유틸리티 함수입니다.
// JWT 토큰의 payload 전체를 반환하는 함수로 수정합니다.
export const decodeJwtRole = (token: string): Record<string, unknown> | null => {
    try {
        console.log('accessToken:', token);
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        console.log('decoded payload:', payload);
        console.log('company_id:', payload?.company_id);
        return payload;
    } catch {
        return null;
    }
};