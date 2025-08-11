// 관리자 로그인 관련 API 함수들입니다.

let adminLoginCache: { [key: string]: any } = {};
let adminLoginPromises: { [key: string]: Promise<any> | null } = {};
let adminLoginCacheTime: { [key: string]: number } = {};
const ADMIN_LOGIN_CACHE_DURATION = 30 * 1000;

export const adminLogin = async (email: string, password: string) => {
    const cacheKey = `${email}:${password}`;
    const now = Date.now();

    if (adminLoginCache[cacheKey] &&
        (now - (adminLoginCacheTime[cacheKey] || 0)) < ADMIN_LOGIN_CACHE_DURATION) {
        return adminLoginCache[cacheKey];
    }

    if (adminLoginPromises[cacheKey]) {
        return adminLoginPromises[cacheKey];
    }

    adminLoginPromises[cacheKey] = (async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                const error = new Error(data.message || '로그인 실패');
                (error as any).response = { data };

                delete adminLoginCache[cacheKey];
                delete adminLoginCacheTime[cacheKey];
                throw error;
            }

            const json = await res.json();

            adminLoginCache[cacheKey] = json.result;
            adminLoginCacheTime[cacheKey] = Date.now();

            return json.result;
        } catch (error) {
            delete adminLoginCache[cacheKey];
            delete adminLoginCacheTime[cacheKey];
            throw error;
        } finally {
            delete adminLoginPromises[cacheKey];
        }
    })();

    return await adminLoginPromises[cacheKey];
};

export const clearAdminLoginCache = () => {
    adminLoginCache = {};
    adminLoginPromises = {};
    adminLoginCacheTime = {};
};
