// window 객체를 사용하는 클라이언트 전용 컴포넌트
"use client";
import FallingText from '../components/FallingText/FallingText';
import './not-found.scss';

interface NotFoundClientProps {
    text?: string;
}

export default function NotFoundClient({ text = "404 NOT FOUND. 존재하지 않는 페이지입니다." }: NotFoundClientProps) {
    return (
        <div className="not-found-wrapper">
            <div className="not-found-bg-text">
                {text.split('.')[0]}
            </div>

            <div className="not-found-instruction">
                화면을 클릭하거나 스페이스바를 눌러보세요
            </div>

            <div className="not-found-falling-container">
                <FallingText
                    text={text}
                    highlightWords={text.includes("404") ? ["404", "NOT", "FOUND"] : ["403", "Unauthorized"]}
                    trigger="click"
                    speed={2}
                    stagger={0.15}
                    fontSize="2rem"
                    color="#ffffff"
                    shadow={true}
                />
            </div>
            
            <div className="not-found-back-btn-container">
                <button
                    className="button is-primary not-found-btn"
                    onClick={() => window.history.back()}
                >
                    <i className="fa-solid fa-arrow-left">
                    </i>
                    돌아가기
                </button>
            </div>
        </div>
    );
}
