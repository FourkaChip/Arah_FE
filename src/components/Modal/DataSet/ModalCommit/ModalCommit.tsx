import "./ModalCommit.scss";
import ModalButton from "@/components/Modal/Buttons/ModalButton";

interface ModalCommitProps {
    onClose: () => void;
}

export default function ModalCommit({ onClose }: ModalCommitProps) {
    const commitMessage = "용어사전 관련 QnA 오탈자 수정 및 응답 문장 수정. sakfjkdsajfksdajfksjfkjsakjfksajfkjsdakfjdskafjkjdsakfjdskafjkdsajfksdajfksjfkjsakjfksajfkjsdakfjdskafjkdsajfksdajfksjfkjsakjfksajfkjsdakfjdskafjkdsajfksdajfksjfkjsakjfksajfkjsdakfjdskafjkdsajfksdajfksjfkjsakjfksajfkjsdakfjdskafjkdsajfksdajfksjfkjsakjfksajfkjsdakfjdskafjkdsajfksdajfksjfkjsakjfksajfkjsdakfjdskafjkdsajfksdajfksjfkjsakjfksajfkjsdakfd";

    const addedLines = [
        "외부 저장매체 사용 시 사전 승인을 받아야 한다.",
        "점심시간은 12:00~13:00",
        "재택근무자는 매일 오전 10시까지 업무 시작 보고를 완료해야 함",
        "연차 신청은 최소 3일 전에 해야 한다.",
    ];

    const removedLines = [
        "점심시간은 11:30~13:00",
        "연차 신청은 최소 7일 전에 해야 한다.",
        "유연근무제는 특별 승인된 팀에 한해 적용됨",
        "복장은 평일 모두 정장 착용을 원칙으로 한다.",
        "사내 시스템 로그인 시 OTP 인증을 필수로 한다.",
    ];

    return (
        <div className="modal-window commit-modal">
            <div className="modal-dialog commit-modal">
                <button className="modal-close" onClick={onClose}>×</button>
                <h2 className="modal-title commit-modal">변경사항</h2>
                <p className="modal-subtitle commit-modal">데이터셋의 변경사항을 확인할 수 있습니다.</p>

                <div className="commit-message">
                    <span>직전 버전 기준 커밋 메시지</span>
                </div>
                <div className="commit-content">{commitMessage}</div>

                <div className="commit-message">
                    <p><strong>현재 사용 중인 <b>버전</b></strong><span>과의 차이 비교</span></p>
                </div>

                <div className="diff-box">
                    {addedLines.map((line, idx) => (
                        <div className="diff-line added" key={`add-${idx}`}>+ {line}</div>
                    ))}
                    {removedLines.map((line, idx) => (
                        <div className="diff-line removed" key={`remove-${idx}`}>- {line}</div>
                    ))}
                </div>

                <div className="modal-footer">
                    <ModalButton type="default" label="확인" onClick={onClose} />
                </div>
            </div>
        </div>
    );
}