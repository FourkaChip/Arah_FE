import NotFoundClient from "@/app/not-found.client";
import '../../not-found.scss';

export default function UnauthorizedPage() {
    return (
        <div className="not-found-container is-flex is-align-items-center is-justify-content-center">
            <div className="box has-text-centered" style={{minWidth: 340, maxWidth: 420}}>
                <h1 className="not-found-title title is-3 has-text-primary">403 Unauthorized</h1>
                <h2 className="not-found-desc subtitle is-5">접근 권한이 없습니다.</h2>
                <NotFoundClient/>
            </div>
        </div>
    );
}