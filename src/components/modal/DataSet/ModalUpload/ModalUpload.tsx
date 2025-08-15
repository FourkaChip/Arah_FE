import {useState, useRef, useEffect} from 'react';
import './ModalUpload.scss';
import ModalButton from "@/components/modal/Buttons/ModalButton";
import {ExtendedModalUploadProps, ModalUploadProps} from "@/types/modals";
import Image from "next/image";
import {useModalMessage} from "@/hooks/useModalMessage";



export default function ModalUpload({
    onClose,
    folderId,
    folderName,
    onSubmit
}: ExtendedModalUploadProps) {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { showSuccess } = useModalMessage(); // 추가

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setUploadedFile(file);
            setError(null);
        } else {
            setError('PDF 파일만 업로드 가능합니다.');
        }
    };

    const handleDelete = () => {
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async () => {
        if (!uploadedFile) {
            setError('파일을 선택해주세요.');
            return;
        }

        if (!comment.trim()) {
            setError('변경사항을 입력해주세요.');
            return;
        }

        if (!onSubmit) {
            setError('업로드 기능이 설정되지 않았습니다.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await onSubmit(uploadedFile, comment);
            // 업로드 성공 시 완료 메시지 모달 노출
            showSuccess("업로드 완료", "데이터셋이 성공적으로 업로드되었습니다.");
            onClose();
        } catch (error: any) {
            setError(error.message || '업로드에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-window upload-modal">
            <button className="modal-close upload-modal" onClick={onClose}>×</button>
            <div className="modal-dialog upload-modal">
                <div className="modal-content">
                    <h2 className="modal-title">데이터셋 업로드</h2>
                    {folderName && (
                        <p className="folder-info">폴더: {folderName}</p>
                    )}
                </div>

                {error && (
                    <div style={{
                        background: '#ffe6e6',
                        color: '#d63031',
                        padding: '10px',
                        borderRadius: '4px',
                        margin: '10px 0',
                        fontSize: '14px'
                    }}>
                        {error}
                    </div>
                )}

                {uploadedFile ? (
                    <>
                        <div className="upload-box">
                            <ul className="file-list">
                                <li className="file-item">
                                    <div className="file-info">
                                        <span className="file-name">{uploadedFile.name}</span>
                                        <span
                                            className="file-size">{(uploadedFile.size / (1024 * 1024)).toFixed(1)}MB</span>
                                    </div>
                                    <button className="button is-danger delete-button" onClick={handleDelete}>
                                        삭제
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <textarea
                            className="textarea"
                            placeholder="변경사항을 입력해 주세요."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            style={{marginTop: 12, height: 120}}
                        />
                    </>
                ) : (
                    <div className="drag-drop-box" onClick={() => fileInputRef.current?.click()}>
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        <p>파일을 업로드하거나 여기로 끌어 놓으세요.</p>
                        <p>(하나의 pdf 파일만 업로드 가능합니다.)</p>
                        <p>(업로드 가능한 파일의 최대 용량은 5MB입니다.)</p>
                    </div>
                )}

                <input
                    type="file"
                    accept="application/pdf"
                    className="upload-input"
                    ref={fileInputRef}
                    style={{display: 'none'}}
                    onChange={handleFileChange}
                />

                <div className="upload-modal-footer">
                    <ModalButton
                        type="cancel"
                        label="취소"
                        onClick={onClose}
                    />
                    <ModalButton
                        type="default"
                        label={loading ? "업로드 중..." : "등록"}
                        onClick={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
}