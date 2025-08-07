import {useState, useEffect, useRef} from "react";
import "./ModalCommit.scss";
import {fetchModifiedPart, fetchVersionHistory} from "@/api/admin/dataset/datasetFetch";
import ModalButton from "@/components/modal/Buttons/ModalButton";
import {ModalCommitProps} from "@/types/modals";


export default function ModalCommit({ onClose, docId, folderId }: ModalCommitProps) {
    const [modifiedContent, setModifiedContent] = useState<string>("");
    const [commitMessage, setCommitMessage] = useState<string>("변경사항이 없습니다.");
    const [loading, setLoading] = useState(false);

    const hasLoadedData = useRef(false);

    // 모달 열릴 때 body 스크롤을 막기 위한 useEffect입니다. 차후 코드 리팩토링 시 컴포넌트 분리 예정
    useEffect(() => {
        const scrollY = window.scrollY;

        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';

        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollY);
        };
    }, []);

    useEffect(() => {
        if (hasLoadedData.current || !docId || !folderId) {
            return;
        }

        const loadDocumentData = async () => {
            hasLoadedData.current = true;
            setLoading(true);

            try {

                const [modifiedData, versionHistory] = await Promise.all([
                    fetchModifiedPart(folderId, docId),
                    fetchVersionHistory(folderId)
                ]);

                setModifiedContent(modifiedData || "변경사항이 없습니다.");

                const currentDocument = versionHistory.find((doc: any) => doc.doc_id === docId);
                if (currentDocument && currentDocument.commit_message) {
                    setCommitMessage(currentDocument.commit_message);
                }

            } catch (error) {
                console.error('문서 데이터 로딩 실패:', error);
                setModifiedContent("변경사항을 불러오는데 실패했습니다.");
                hasLoadedData.current = false;
            } finally {
                setLoading(false);
            }
        };

        loadDocumentData();
    }, [docId, folderId]);

    const parseDiffContent = (content: string) => {
        if (!content) return { addedLines: [], removedLines: [] };

        const lines = content.split('\n');
        const addedLines: string[] = [];
        const removedLines: string[] = [];

        lines.forEach(line => {
            if (line.startsWith('+')) {
                addedLines.push(line.substring(1));
            } else if (line.startsWith('-')) {
                removedLines.push(line.substring(1));
            }
        });

        return { addedLines, removedLines };
    };

    const { addedLines, removedLines } = docId ? parseDiffContent(modifiedContent) : {
        addedLines: [
            "외부 저장매체 사용 시 사전 승인을 받아야 한다.",
            "점심시간은 12:00~13:00",
            "재택근무자는 매일 오전 10시까지 업무 시작 보고를 완료해야 함",
            "연차 신청은 최소 3일 전에 해야 한다.",
        ],
        removedLines: [
            "점심시간은 11:30~13:00",
            "연차 신청은 최소 7일 전에 해야 한다.",
            "유연근무제는 특별 승인된 팀에 한해 적용됨",
            "복장은 평일 모두 정장 착용을 원칙으로 한다.",
            "사내 시스템 로그인 시 OTP 인증을 필수로 한다.",
        ]
    };


    return (
        <div className="modal-window commit-modal">
            <div className="modal-dialog commit-modal">
                <button className="modal-close" onClick={onClose}>×</button>
                <h2 className="modal-title commit-modal">변경사항</h2>
                <p className="modal-subtitle commit-modal">데이터셋의 변경사항을 확인할 수 있습니다.</p>

                <div className="commit-message">
                    <span>직전 버전 기준 변경사항</span>
                </div>
                <div className="commit-content">{commitMessage}</div>

                <div className="commit-message">
                    <p><strong>현재 사용 중인 <b>버전</b></strong><span>과의 차이 비교</span></p>
                </div>

                <div className="diff-container">
                    {loading ? (
                        <div className="loading-message">
                            변경사항을 불러오는 중...
                        </div>
                    ) : (
                        <div className="diff-columns">
                            <div className="diff-column added-column">
                                <div className="diff-header added-header">
                                    <span className="diff-icon">+</span>
                                    추가된 내용
                                </div>
                                <div className="diff-content added-content">
                                    {addedLines.length === 0 ? (
                                        <div className="empty-message">추가된 내용이 없습니다</div>
                                    ) : (
                                        addedLines.map((line, index) => (
                                            <div key={index} className="diff-line">
                                                {line}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="diff-column removed-column">
                                <div className="diff-header removed-header">
                                    <span className="diff-icon">-</span>
                                    삭제된 내용
                                </div>
                                <div className="diff-content removed-content">
                                    {removedLines.length === 0 ? (
                                        <div className="empty-message">삭제된 내용이 없습니다</div>
                                    ) : (
                                        removedLines.map((line, index) => (
                                            <div key={index} className="diff-line">
                                                {line}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <ModalButton type="default" label="확인" onClick={onClose} />
                </div>
            </div>
        </div>
    );
}