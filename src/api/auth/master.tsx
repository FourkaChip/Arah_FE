// 마스터 로그인 관련 API 함수들입니다.

// 마스터 로그인 함수입니다.
import {useAuthStore} from "@/store/auth.store";
import {getRefreshToken} from "@/utils/tokenStorage";

// 모든 API Fetching 함수에서 공통으로 사용될 JWT 인증 함수입니다.
const authorizedFetch = async (
  input: RequestInfo,
  init: RequestInit = {},
): Promise<Response> => {
  let token = useAuthStore.getState().accessToken;
  if (!token) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/auth/reissue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        const newToken = data.accessToken || (data.result && data.result.accessToken);
        if (newToken) {
          useAuthStore.getState().setAccessToken(newToken);
          token = newToken;
        } else {
          throw new Error('accessToken 재발급 실패');
        }
      } else {
        throw new Error('accessToken 재발급 실패');
      }
    }
  }

  return fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
};

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

// 관리자 목록 조회 API 함수입니다.
export const fetchAdminList = async () => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/admins`);
    if (!res.ok) throw new Error('관리자 목록 조회 실패');
    const json = await res.json();
    return json.result;
};

// 관리자 부서 등록(업데이트) API 함수입니다.
export const assignAdminRole = async (payload: { departmentIds: number[]; userId: number }[]) => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/master/admin/departments`, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('관리자 부서 등록 실패');
    return res.json();
};

// 관리자 권한 해제 API 함수입니다.
export const removeAdminRole = async (email: string) => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/admins/remove`, {
        method: 'PATCH',
        body: JSON.stringify({email}),
    });
    if (!res.ok) throw new Error('관리자 권한 해제 실패');
    return res.json();
};

// 이메일 기반 사용자 정보 조회 함수입니다.
export const fetchUserInfoByEmail = async (email: string) => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/info/${email}`, {
        method: 'GET',
    });
    if (!res.ok) throw new Error('사용자 정보를 불러올 수 없습니다.');
    const data = await res.json();
    if (!data.result) throw new Error('사용자 정보가 없습니다.');
    return data.result;
};

// 부서 리스트 조회 함수입니다.
export const fetchDepartmentList = async () => {
    const res = await authorizedFetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/departments/list`, {
        method: 'GET',
    });
    if (!res.ok) throw new Error('부서 리스트 조회 실패');
    const data = await res.json();
    if (!data.result) throw new Error('부서 리스트가 없습니다.');
    return data.result; // [{ departmentId, name }]
};
