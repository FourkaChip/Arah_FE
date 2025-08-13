import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    sassOptions: {
        includePaths: [path.join(process.cwd(), 'node_modules')],
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/admin/login', // 최초 접속 시 로그인 페이지로 리다이렉트하도록 설정.
                permanent: false,
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: '/api/ai/:path*',
                destination: 'http://localhost:8001/api/ai/:path*', // AI 서버 프록시
            },
        ];
    },
};

export default nextConfig;
