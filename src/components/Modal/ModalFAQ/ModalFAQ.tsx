import {useState} from "react";
import ModalButton from "@/components/Modal/Buttons/ModalButton";
import "./ModalFAQ.scss";
import CustomDropDown from "@/components/Dropdown/CustomDropdown/CustomDropDown";
import {ModalFAQProps} from "@/types/modals";

export default function ModalFAQ({onClose, onSubmit}: ModalFAQProps) {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [categories, setCategories] = useState(["회사 비전", "사업 정책", "인센티브", "복지제도"]);
    const [selectedCategory, setSelectedCategory] = useState("");

    const handleAddCategory = () => {
        const newCategory = prompt("새로운 태그를 입력하세요.");
        if (newCategory) setCategories([...categories, newCategory]);
    };

    const handleSubmit = () => {
        if (!selectedCategory || !question || !answer) {
            alert("모든 필드를 입력해 주세요.");
            return;
        }

        onSubmit({
            category: selectedCategory,
            question,
            answer,
        });
        onClose();
    };

    return (
        <div className="modal-overlay faq-modal">
            <div className="modal-window faq-modal">
                <div className="modal-dialog faq-modal">
                    <button className="modal-close" onClick={onClose}>×</button>
                    <h2 className="modal-title faq-modal">FAQ 등록</h2>
                    <p className="modal-subtitle faq-modal">신규 FAQ를 등록합니다.</p>

                    <div className="form-section">
                        <label className="faq-field-label">
                            <span>사용자 질문</span>
                            <CustomDropDown
                                value={selectedCategory}
                                options={categories}
                                onChange={setSelectedCategory}
                                onAddOption={handleAddCategory}
                            />
                        </label>
                        <input
                            className="input"
                            placeholder="예상 질문을 입력해 주세요."
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </div>

                    <div className="form-section">
                        <label>제공 답변</label>
                        <textarea
                            className="textarea"
                            placeholder="질문에 대한 답변을 등록해 주세요."
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            style={{height: 160}}
                        />
                    </div>

                    <div className="modal-footer">
                        <ModalButton type="cancel" label="취소" onClick={onClose}/>
                        <ModalButton type="default" label="등록" onClick={handleSubmit}/>
                    </div>
                </div>
            </div>
        </div>
    );
}