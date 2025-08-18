import {useState, useEffect} from "react";
import ModalButton from "@/components/modal/Buttons/ModalButton";
import ModalDefault from "@/components/modal/ModalDefault/ModalDefault";
import "./ModalFAQ.scss";
import CustomDropDown from "@/components/customDropdown/CustomDropDown";
import {ModalFAQProps} from "@/types/modals";
import {fetchAdminFaqTagList} from "@/api/admin/faq/faqFetch";
import {useModalMessage} from "@/hooks/useModalMessage";

export default function ModalFAQ({
                                     loading,
                                     onClose,
                                     onSubmit,
                                     category,
                                     question: initQuestion,
                                     answer: initAnswer,
                                     companyId
                                 }: ModalFAQProps & { companyId: number }) {
    const [question, setQuestion] = useState(initQuestion ?? "");
    const [answer, setAnswer] = useState(initAnswer ?? "");
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState(category ?? "");
    const {
        openErrorModal,
        errorTitle,
        errorDescription,
        showError,
        closeError,
    } = useModalMessage();

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

    const isQuestionValid = question.length > 0 && question.length <= 200;
    const isAnswerValid = answer.length > 0 && answer.length <= 500;
    const isFormValid = isQuestionValid && isAnswerValid && !!selectedCategory;

    const handleSubmit = async () => {
        if (!selectedCategory) {
            showError("등록 실패", "카테고리를 선택해 주세요.");
            return;
        }
        if (!question) {
            showError("등록 실패", "질문을 등록해 주세요.");
            return;
        }
        if (!answer) {
            showError("등록 실패", "답변을 등록해 주세요.");
            return;
        }
        if (question.length > 200 || answer.length > 500) {
            showError("등록 실패", "글자 수를 초과하였습니다.");
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
        <>
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
                            <div style={{position: 'relative'}}>
                                <input
                                    className="input"
                                    placeholder="예상 질문을 입력해 주세요."
                                    value={question}
                                    maxLength={200}
                                    onChange={(e) => setQuestion(e.target.value.slice(0, 200))}
                                />
                                <span className="input-counter-outside">{question.length} / 200</span>
                            </div>
                        </div>

                        <div className="form-section">
                            <label>제공 답변</label>
                            <div style={{position: 'relative'}}>
                                <textarea
                                    className="textarea"
                                    placeholder="질문에 대한 답변을 등록해 주세요."
                                    value={answer}
                                    maxLength={500}
                                    onChange={(e) => setAnswer(e.target.value.slice(0, 500))}
                                    style={{height: 160}}
                                />
                                <span className="textarea-counter-outside">{answer.length} / 500</span>
                            </div>
                        </div>

                        <div className="modal-footer-faq">
                            <ModalButton type="cancel" label="취소" onClick={onClose} disabled={loading}/>
                            <ModalButton type="default" label="등록" onClick={handleSubmit}
                                         disabled={loading}/>
                        </div>
                    </div>
                </div>
            </div>
            {openErrorModal && (
                <ModalDefault
                    type="default"
                    label={errorTitle}
                    description={errorDescription}
                    onClose={closeError}
                />
            )}
        </>
    );
}