import NotFoundClient from "@/app/not-found.client";
import '../../not-found.scss';

export default function UnauthorizedPage() {
    return (
        <div className="not-found-container is-flex is-align-items-center is-justify-content-center">
            <NotFoundClient text="403 Unauthorized. 접근 권한이 없습니다." />
        </div>
    );
}