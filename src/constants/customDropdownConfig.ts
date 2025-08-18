export const DROPDOWN_ACTIONS = {
    ADD: "add",
    EDIT: "edit"
} as const;

export const DROPDOWN_LABELS = {
    ADD_TAG: "➕ 태그 추가",
    EDIT_TAG: "태그 편집",
    SELECT_TAG: "태그 선택"
} as const;

export const MODAL_MESSAGES = {
    TAG_FETCH_ERROR: {
        title: "오류",
        description: "태그 목록을 불러오는데 실패했습니다."
    },
    TAG_ADD_ERROR: {
        title: "오류", 
        description: "태그 등록에 실패했습니다."
    },
    TAG_DELETE_ERROR: {
        title: "삭제 실패",
        description: "태그 삭제에 실패했습니다."
    },
    TAG_INPUT_MODAL: {
        title: "태그 추가",
        description: "새로운 태그 이름을 입력해 주세요."
    }
} as const;

export const DELETE_BUTTON_SYMBOL = "✕";
