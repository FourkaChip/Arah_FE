import {useState, useRef} from 'react';
import './ModalUpload.scss';
import ModalButton from "@/components/Modal/Buttons/ModalButton";
import {ModalUploadProps} from "@/types/modals";

export default function ModalUpload({
                                        onClose
                                    }: ModalUploadProps) {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [comment, setComment] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setUploadedFile(file);
        }
    };

    const handleDelete = () => {
        setUploadedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDownloadTemplate = () => {
        // TODO: template download API
    };

    const handleSubmit = () => {
        if (uploadedFile) {
        }
    };

    return (
        <div className="modal-window upload-modal">
            <button className="modal-close upload-modal" onClick={onClose}>×</button>
            <div className="modal-dialog upload-modal">
                <div className="modal-content">
                    <h2 className="modal-title">데이터셋 업로드</h2>
                    <button className="download-template-button" onClick={handleDownloadTemplate}>
                        양식 다운로드
                    </button>
                </div>

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
                        <img src="/upload-icon.svg" alt="upload"/>
                        <p>파일을 업로드하거나 여기로 끌어 놓으세요.</p>
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
                    <ModalButton type="default" label="등록" onClick={function (): void {
                        throw new Error('Function not implemented.');
                    }}/>
                </div>
            </div>
        </div>
    );
}