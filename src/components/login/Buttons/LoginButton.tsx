// 로그인 페이지용 버튼 컴포넌트입니다.
import '@/components/login/Buttons/LoginButton.scss'; // globals.scss에 있는 스타일 코드는 적용되지 않고, 해당 경로의 scss만 참조합니다.

interface LoginButtonProps {
    label: string;
    onClick: () => void;
}

export default function LoginButton({ label, onClick }: LoginButtonProps) {
    return (
        <button type="button" onClick={onClick} className="common-button-login">
            {label}
        </button>
    );
}