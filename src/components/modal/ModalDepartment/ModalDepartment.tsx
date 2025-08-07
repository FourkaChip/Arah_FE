"use client";
import {useState, useEffect, useCallback, useMemo, useRef} from 'react';
import {createPortal} from 'react-dom';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import ModalButton from "@/components/modal/Buttons/ModalButton";
import './ModalDepartment.scss';
import {userRows} from "@/constants/dummydata/DummyMasterFile";
import {ModalDepartmentProps} from "@/types/modals";
import {fetchUserInfoByEmail, fetchCurrentUserInfo} from "@/api/auth/master";
import {fetchDepartmentList} from "@/api/master/deptFetch";
import {useQueryClient} from "@tanstack/react-query";
import {assignAdminRole} from "@/api/master/adminFetch";

export default function ModalDepartment({
                                            defaultStep = 'list',
                                            defaultUser = null,
                                            defaultChecked = [],
                                            onClose,
                                        }: ModalDepartmentProps) {
    const [step, setStep] = useState<'list' | 'select'>(defaultStep);
    const [selectedUser, setSelectedUser] = useState<any>(defaultUser);
    const [checked, setChecked] = useState<string[]>(defaultChecked);
    const [emailInput, setEmailInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [users, setUsers] = useState<any[]>(userRows);
    const [departmentList, setDepartmentList] = useState<{ departmentId: number; name: string }[]>([]);
    const [currentUserCompanyId, setCurrentUserCompanyId] = useState<number | null>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const queryClient = useQueryClient();

    const initializedFromDefaultUser = useRef(false);

    // useCallback으로 함수들을 메모이제이션하여 불필요한 리렌더링 방지
    const handleErrorMessage = useCallback((message: string, error?: unknown) => {
        setErrorMsg(message);
    }, []);

    const handleDepartmentClick = useCallback((user: any) => {
        setSelectedUser(user);
        setChecked(user.departments ? user.departments.split(',') : []);
        setStep('select');
    }, []);

    const toggleDepartment = useCallback((dept: string) => {
        setChecked(prev =>
            prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
        );
    }, []);

    // fetchUserInfo 함수도 useCallback으로 최적화
    const fetchUserInfo = useCallback(async (email: string) => {
        if (currentUserCompanyId === null) {
            handleErrorMessage('회사 정보를 가져올 수 없습니다. 다시 로그인해 주세요.');
            return;
        }

        setLoading(true);
        setErrorMsg('');
        try {
            const result = await fetchUserInfoByEmail(email, currentUserCompanyId);

            if (result.role !== 'USER') {
                handleErrorMessage('이미 관리자이거나 마스터인 사용자는 추가할 수 없습니다.');
                return;
            }

            if (users.some(u => u.email === email)) {
                handleErrorMessage('이미 목록에 있는 사용자입니다.');
            } else {
                setUsers(prevUsers => [
                    ...prevUsers,
                    {
                        id: email,
                        name: result.name,
                        departments: (result.AdminDepartments || []).join(','),
                        email: email,
                        userId: result.userId,
                        companyId: result.companyId
                    }
                ]);
                setEmailInput('');
            }
        } catch (e: any) {
            handleErrorMessage(e.message || '사용자 정보를 불러올 수 없습니다.', e);
        } finally {
            setLoading(false);
        }
    }, [currentUserCompanyId, users, handleErrorMessage]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && emailInput && !loading && currentUserCompanyId !== null) {
            fetchUserInfo(emailInput);
        }
    }, [emailInput, loading, currentUserCompanyId, fetchUserInfo]);

    useEffect(() => {
        if (defaultUser && !initializedFromDefaultUser.current) {
            initializedFromDefaultUser.current = true;

            setSelectedUser(defaultUser);
            setChecked(
                Array.isArray(defaultUser.adminDepartments)
                    ? defaultUser.adminDepartments
                    : []
            );
            setStep('select');
            setInitialLoading(false);
        } else if (!defaultUser) {
            const loadCurrentUserInfo = async () => {
                setInitialLoading(true);
                try {
                    const userInfo = await fetchCurrentUserInfo();
                    if (userInfo && userInfo.companyId !== undefined) {
                        setCurrentUserCompanyId(userInfo.companyId);
                    } else {
                        handleErrorMessage('현재 로그인한 사용자의 회사 정보를 가져올 수 없습니다.');
                    }
                } catch (error) {
                    handleErrorMessage('사용자 정보를 불러오는데 실패했습니다.', error);
                } finally {
                    setInitialLoading(false);
                }
            };
            loadCurrentUserInfo();
        }
    }, [defaultUser, handleErrorMessage]);

    // 부서 목록 로드를 별도 useEffect로 분리
    useEffect(() => {
        if (step === 'select') {
            fetchDepartmentList()
                .then(setDepartmentList)
                .catch(() => setDepartmentList([]));
        }
    }, [step]);

    const handleConfirmDepartment = useCallback(async () => {
        if (!selectedUser) return;

        const selectedDeptNames = departmentList
            .filter(dept => checked.includes(dept.name))
            .map(dept => dept.name);

        if (defaultUser) {
            try {
                const payload = [
                    {
                        departmentIds: departmentList
                            .filter(dept => checked.includes(dept.name))
                            .map(dept => dept.departmentId),
                        userId: selectedUser.userId,
                    }
                ];
                await assignAdminRole(payload);
                queryClient.invalidateQueries({queryKey: ['adminList']});
                if (onClose) onClose();
            } catch (e) {
                alert("관리자 부서 등록에 실패했습니다. 다시 시도해 주세요.");
            }
            return;
        }

        setUsers(prevUsers =>
            prevUsers.map(u =>
                u.email === selectedUser.email
                    ? {...u, departments: selectedDeptNames.join(','), selectedDepartments: [...checked]}
                    : u
            )
        );

        setStep('list');
        setSelectedUser(null);
        setChecked([]);
    }, [selectedUser, departmentList, checked, defaultUser, queryClient, onClose]);

    const columns: GridColDef[] = useMemo(() => [
        {field: 'name', headerName: '이름', flex: 1, resizable: false},
        {
            field: 'departments',
            headerName: '선택된 부서',
            flex: 2,
            resizable: false,
            renderCell: (params) => (
                <span>
                    {params.row.selectedDepartments && params.row.selectedDepartments.length > 0
                        ? params.row.selectedDepartments.join(', ')
                        : params.row.departments}
                </span>
            )
        },
        {
            field: 'action',
            headerName: '',
            renderCell: (params) => (
                <a onClick={() => handleDepartmentClick(params.row)} style={{color: '#3E63F1', cursor: 'pointer'}}>
                    부서 설정
                </a>
            ),
            sortable: false,
            width: 100,
            resizable: false,
        },
    ], [handleDepartmentClick]);

    return typeof window !== 'undefined'
        ? createPortal(
            <div className="modal-window department-modal">
                <div className="modal-dialog department-modal" style={{width: 640, height: 574}}>
                    <button className="modal-close" onClick={onClose}>×</button>
                    {initialLoading ? (
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                            <p>로딩 중...</p>
                        </div>
                    ) : step === 'list' ? (
                        <>
                            <h2 className="modal-title-dept">관리자 부서 등록</h2>
                            <p className="modal-description-dept">관리자가 관리할 부서를 선택해 주세요.</p>
                            <div style={{display: 'flex', gap: 8, marginBottom: 16}}>
                                <input
                                    className="admin-search-input"
                                    placeholder="관리자로 등록할 사용자의 이메일을 입력해 주세요."
                                    style={{flex: 1}}
                                    value={emailInput}
                                    onChange={e => setEmailInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={loading || currentUserCompanyId === null}
                                />
                                <button
                                    className="button is-dark"
                                    onClick={() => fetchUserInfo(emailInput)}
                                    disabled={loading || !emailInput || currentUserCompanyId === null}
                                >
                                    {loading ? '조회 중...' : '추가'}
                                </button>
                            </div>
                            {errorMsg && <div style={{color: 'red', marginBottom: 8}}>{errorMsg}</div>}
                            <div style={{height: 320}}>
                                <DataGrid
                                    rows={users}
                                    columns={columns}
                                    hideFooter
                                    disableColumnMenu
                                    disableColumnResize
                                />
                            </div>
                            <div className="modal-footer"
                                 style={{display: 'flex', justifyContent: 'center', marginTop: 32, gap: 8}}>
                                <ModalButton
                                    type="cancel"
                                    label="취소"
                                    onClick={() => {
                                        if (onClose) onClose();
                                    }}
                                />
                                <ModalButton
                                    type="default"
                                    label="확인"
                                    onClick={async () => {
                                        const payload = users
                                            .filter(u => u.selectedDepartments && u.selectedDepartments.length > 0)
                                            .map(u => ({
                                                departmentIds: departmentList
                                                    .filter(dept => u.selectedDepartments.includes(dept.name))
                                                    .map(dept => dept.departmentId),
                                                userId: u.userId,
                                            }));
                                        if (payload.length > 0) {
                                            try {
                                                await assignAdminRole(payload);
                                                queryClient.invalidateQueries({queryKey: ['adminList']});
                                                if (onClose) onClose();
                                            } catch (e) {
                                                alert("관리자 부서 등록에 실패했습니다. 다시 시도해 주세요.");
                                            }
                                        } else {
                                            if (onClose) onClose();
                                        }
                                    }}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <h2 className="modal-title-dept">관리자 부서 등록</h2>
                                <span className="modal-description-dept" style={{fontWeight: 600}}>
                                    관리자: {selectedUser?.name}
                                </span>
                            </div>
                            <p className="modal-description-dept">
                                관리자가 관리할 부서를 선택해 주세요.
                            </p>
                            <div style={{flex: 1, marginTop: 16, height: 320}}>
                                <DataGrid
                                    rows={departmentList.map((dept) => ({id: dept.departmentId, name: dept.name}))}
                                    columns={[
                                        {
                                            field: 'name',
                                            headerName: '부서명',
                                            flex: 1,
                                        },
                                        {
                                            field: 'checked',
                                            headerName: '',
                                            renderHeader: () => (
                                                <input
                                                    type="checkbox"
                                                    className="department-checkbox-input"
                                                    style={{
                                                        width: 20,
                                                        height: 20,
                                                        accentColor: '#232D64',
                                                        cursor: 'pointer'
                                                    }}
                                                    checked={checked.length === departmentList.length}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        setChecked(isChecked ? departmentList.map(d => d.name) : []);
                                                    }}
                                                />
                                            ),
                                            renderCell: (params) => (
                                                <input
                                                    type="checkbox"
                                                    className="department-checkbox-input"
                                                    style={{
                                                        width: 20,
                                                        height: 20,
                                                        accentColor: '#232D64',
                                                        cursor: 'pointer'
                                                    }}
                                                    checked={checked.includes(params.row.name)}
                                                    onChange={() => toggleDepartment(params.row.name)}
                                                />
                                            ),
                                            sortable: false,
                                            width: 80,
                                        },
                                    ]}
                                    hideFooter
                                    disableColumnMenu
                                    disableColumnResize
                                    disableColumnSelector
                                />
                            </div>
                            <div className="modal-footer"
                                 style={{display: 'flex', justifyContent: 'center', marginTop: 32, gap: 8}}>
                                <ModalButton
                                    type="cancel"
                                    label="취소"
                                    onClick={() => {
                                        setStep('list');
                                        setSelectedUser(null);
                                        setChecked([]);
                                    }}
                                />
                                <ModalButton
                                    type="default"
                                    label="확인"
                                    onClick={handleConfirmDepartment}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>,
            document.body
        )
        : null;
}