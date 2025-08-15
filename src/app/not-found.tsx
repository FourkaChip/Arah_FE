// 페이지가 존재하지 않는 라우트 경로에 대한 컴포넌트입니다.
import './not-found.scss';
import NotFoundClient from './not-found.client';


export default function NotFound() {
    return (
        <div className="not-found-container is-flex is-align-items-center is-justify-content-center">
                <NotFoundClient />
        </div>
    );
}
