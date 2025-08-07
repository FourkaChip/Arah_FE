// sessionStorage 내의 accessToken을 decode하는 유틸리티 함수입니다.
export const decodeJwtRole = (token: string): string | null => {
    try {
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        return payload.role || null;
    } catch (err) {
        console.error('Failed to decode token:', err);
        return null;
    }
};