// 데이터셋 관련 API 연결 함수들입니다.

import {authorizedFetch} from "@/api/auth/authorizedFetch";

// PDF 파일 업로드용 함수입니다.
export const fetchUploadPdf = async (
    file: File,
    title: string,
    version: string,
    folder_id: number,
    commit_message: string
) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('version', version);
    formData.append('folder_id', folder_id.toString());
    formData.append('commit_message', commit_message);

    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/documents/pdf/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );
    if (!res.ok) throw new Error('PDF 업로드 실패');
    const data = await res.json();
    return data.result;
};

// PDF 파일 정보 수정용 함수입니다.
export const fetchUpdatePdf = async (doc_id: number, title: string) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/documents/pdf/update`,
        {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({doc_id, title}),
        }
    );
    if (!res.ok) throw new Error('PDF 정보 수정 실패');
    const data = await res.json();
    return data.result;
};

// 회사별 폴더 목록 조회용 함수입니다. (folder_id 불필요)
export const fetchFoldersByCompany = async () => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/folders`,
        {
            method: 'GET',
            cache: 'no-store',
        }
    );
    if (!res.ok) throw new Error('폴더 목록 조회 실패');
    const data = await res.json();
    return data.result;
};

// 폴더 버전 히스토리 조회용 함수입니다. (여기서 folder_id 사용)
export const fetchVersionHistory = async (folder_id: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/documents/version-history/${folder_id}`,
        {
            method: 'GET',
            cache: 'no-store',
        }
    );
    if (!res.ok) throw new Error('버전 히스토리 조회 실패');
    const data = await res.json();
    return data.result;
};

// PDF 파일 삭제용 함수입니다.
export const fetchDeletePdf = async (doc_id: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/documents/pdf/delete`,
        {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({doc_id}),
        }
    );
    if (!res.ok) throw new Error('PDF 삭제 실패');
    const data = await res.json();
    return data.result;
};

// 메인 문서 변경용 함수입니다.
export const fetchChangeMainDocument = async (doc_id: number, folder_id: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/documents/change/main`,
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({doc_id, folder_id}),
        }
    );
    if (!res.ok) throw new Error('메인 문서 변경 실패');
    const data = await res.json();
    return data.result;
};

// 문서 변경사항 비교 조회용 함수입니다.
export const fetchModifiedPart = async (doc_id: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/documents/modified-part/${doc_id}`,
        {
            method: 'GET',
            cache: 'no-store',
        }
    );
    if (!res.ok) throw new Error('변경사항 조회 실패');
    const data = await res.json();
    return data.result;
};

// 폴더 생성용 함수입니다.
export const fetchCreateFolder = async (name: string, company_id: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/folders/upload`,
        {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name, company_id}),
        }
    );
    if (!res.ok) throw new Error('폴더 생성 실패');
    const data = await res.json();
    return data.result;
};

// 폴더 삭제용 함수입니다.
export const fetchDeleteFolder = async (folder_id: number) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/folders/delete`,
        {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({folder_id}),
        }
    );
    if (!res.ok) throw new Error('폴더 삭제 실패');
    const data = await res.json();
    return data.result;
};

// 폴더 이름 수정용 함수입니다.
export const fetchUpdateFolder = async (folder_id: number, name: string) => {
    const res = await authorizedFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/folders/update`,
        {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({folder_id, name}),
        }
    );
    if (!res.ok) throw new Error('폴더 이름 수정 실패');
    const data = await res.json();
    return data.result;
};
