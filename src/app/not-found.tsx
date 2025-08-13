// 페이지가 존재하지 않는 라우트 경로에 대한 컴포넌트입니다.
import './not-found.scss';
import NotFoundClient from './not-found.client';


export default function NotFound() {
    return (
        <div className="not-found-container is-flex is-align-items-center is-justify-content-center">
            {/* <div className="box has-text-centered" style={{ minWidth: 340, maxWidth: 420 }}>
                <h1 className="not-found-title title is-1 has-text-primary">404 NOT FOUND</h1>
                <h2 className="not-found-desc subtitle is-5">존재하지 않는 페이지입니다.</h2> */}



                <NotFoundClient />
            {/* </div> */}
        </div>
    );
}
