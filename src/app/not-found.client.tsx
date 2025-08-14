// window 객체를 사용하는 클라이언트 전용 컴포넌트
"use client";
import FallingText from '../components/FallingText/FallingText';

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
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '5rem',
                fontWeight: 'bold',
                color: 'rgba(255, 255, 255, 0.3)',
                zIndex: 0,
                userSelect: 'none',
                pointerEvents: 'none',
                whiteSpace: 'pre-line',
                textAlign: 'center'
            }}>
                {text.split('.')[0]}
            </div>

            <div style={{
                position: 'absolute',
                bottom: '100px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '1.2rem',
                zIndex: 2,
                textAlign: 'center'
            }}>
                스페이스바를 눌러보세요
            </div>

            <div style={{ 
                position: 'absolute',
                top: '100px',
                left: 0,
                width: '100%', 
                height: '80vh',
                zIndex: 1
            }}>
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
