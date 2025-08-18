// sessionStorage 내의 accessToken을 decode하는 유틸리티 함수입니다.
// JWT 토큰의 payload 전체를 반환하는 함수로 수정합니다.
import { JwtPayload } from '@/types/auth';

export const decodeJwtRole = (token: string): JwtPayload | null => {
    try {
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        return payload as JwtPayload;
    } catch {
        return null;
    }
};
