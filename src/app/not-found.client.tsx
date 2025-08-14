// window 객체를 사용하는 클라이언트 전용 컴포넌트
"use client";
import FallingText from './FallingText';

interface NotFoundClientProps {
    text?: string;
}

export default function NotFoundClient({ text = "404 NOT FOUND. 존재하지 않는 페이지입니다." }: NotFoundClientProps) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* 전체 화면을 차지하는 FallingText */}
            <div style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%', 
                height: '80vh',
                zIndex: 1
            }}>
                <FallingText
                    text={text} // props로 받은 텍스트 사용
                    highlightWords={text.includes("404") ? ["404", "NOT", "FOUND"] : ["403", "Unauthorized"]} // 동적 하이라이트
                    speed={2}              // 떨어지는 속도
                    stagger={0.15}         // 글자 간 딜레이
                    fontSize="2rem"        // 폰트 크기
                    color="#ffffff"        // 텍스트 색상
                    shadow={true}          // 그림자 효과 여부
                />
            </div>
            
            {/* 버튼을 왼쪽 최상단에 배치 */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                zIndex: 2
            }}>
                <button
                    className="button is-primary not-found-btn"
                    onClick={() => window.history.back()}
                >
                    <i className="fa-solid fa-arrow-left" style={{ marginRight: '10px' }}>
                    </i>
                    돌아가기
                </button>
            </div>
        </div>
    );
}
