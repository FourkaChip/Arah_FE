import {useState, useEffect} from "react";
import ModalButton from "@/components/modal/Buttons/ModalButton";
import "./ModalFAQ.scss";
import CustomDropDown from "@/components/customDropdown/CustomDropDown";
import {ModalFAQProps} from "@/types/modals";
import {fetchAdminFaqTagList} from "@/api/admin/faq/faqFetch";

export default function ModalFAQ({onClose, onSubmit, category, question: initQuestion, answer: initAnswer, companyId}: ModalFAQProps & { companyId: number }) {
    const [question, setQuestion] = useState(initQuestion ?? "");
    const [answer, setAnswer] = useState(initAnswer ?? "");
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState(category ?? "");

    useEffect(() => {
        setQuestion(initQuestion ?? "");
        setAnswer(initAnswer ?? "");
        setSelectedCategory(category ?? "");
    }, [initQuestion, initAnswer, category]);

    useEffect(() => {
        fetchAdminFaqTagList()
            .then((tags) => {
                const tagNames = tags.map((tag: any) => tag.name);
                setCategories(tagNames);
                if (!selectedCategory && tagNames.length > 0) {
                    setSelectedCategory(tagNames[0]);
                }
            });
    }, [companyId]);

    const handleSubmit = async () => {
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

                    <div className="form-section faq-modal">
                        <label className="faq-field-label">
                            <span>사용자 질문</span>
                            <CustomDropDown
                                value={selectedCategory}
                                options={categories}
                                onChange={setSelectedCategory}
                                companyId={companyId}
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