"use client";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ModalButton from "@/components/Modal/Buttons/ModalButton";
import './ModalDepartment.scss';
import { userRows} from "@/constants/dummydata/DummyMasterFile";
import { ModalDepartmentProps} from "@/types/modals";
import { fetchUserInfoByEmail, fetchDepartmentList, assignAdminRole } from "@/api/auth/master";
import { useQueryClient } from "@tanstack/react-query";

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
  const [users, setUsers] = useState<any[]>(userRows); // 기존 목록 + 추가된 사용자
  const [departmentList, setDepartmentList] = useState<{ departmentId: number; name: string }[]>([]);
  const queryClient = useQueryClient();

  const handleDepartmentClick = (user: any) => {
    setSelectedUser(user);
    setChecked(user.departments ? user.departments.split(',') : []);
    setStep('select');
  };

  const toggleDepartment = (dept: string) => {
    setChecked(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  // 이메일로 사용자 정보 조회 후 목록에 추가합니다.
  const fetchUserInfo = async (email: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const result = await fetchUserInfoByEmail(email);
      // 이미 목록에 있다면 추가하지 않고 에러 메시지를 띄웁니다.
      if (users.some(u => u.email === email)) {
        setErrorMsg('이미 목록에 있는 사용자입니다.');
      } else {
        setUsers([
          ...users,
          {
            id: email,
            name: result.name,
            departments: (result.amdinDepartments || []).join(','),
            email: email,
            userId: result.userId,
          }
        ]);
        setEmailInput('');
      }
    } catch (e: any) {
      setErrorMsg(e.message || '사용자 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 'select') {
      fetchDepartmentList()
        .then(setDepartmentList)
        .catch(() => setDepartmentList([]));
    }
  }, [step]);

  const handleConfirmDepartment = () => {
    if (!selectedUser) return;
    const selectedDeptNames = departmentList
      .filter(dept => checked.includes(dept.name))
      .map(dept => dept.name);

    setUsers(users =>
      users.map(u =>
        u.email === selectedUser.email
          ? { ...u, departments: selectedDeptNames.join(','), selectedDepartments: [...checked] }
          : u
      )
    );

    setStep('list');
    setSelectedUser(null);
    setChecked([]);
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: '이름', flex: 1, resizable: false },
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
        <a onClick={() => handleDepartmentClick(params.row)} style={{ color: '#3E63F1', cursor: 'pointer' }}>
          부서 설정
        </a>
      ),
      sortable: false,
      width: 100,
      resizable: false,
    },
  ];

  return typeof window !== 'undefined'
    ? createPortal(
        <div className="modal-window department-modal">
          <div className="modal-dialog department-modal" style={{ width: 640, height: 574 }}>
            <button className="modal-close" onClick={onClose}>×</button>
            {step === 'list' ? (
              <>
                <h2 className="modal-title-dept">관리자 부서 등록</h2>
                <p className="modal-description-dept">관리자가 관리할 부서를 선택해 주세요.</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <input
                    className="admin-search-input"
                    placeholder="관리자로 등록할 사용자의 이메일을 입력해 주세요."
                    style={{ flex: 1 }}
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    className="button is-dark"
                    onClick={() => fetchUserInfo(emailInput)}
                    disabled={loading || !emailInput}
                  >
                    {loading ? '조회 중...' : '추가'}
                  </button>
                </div>
                {errorMsg && <div style={{ color: 'red', marginBottom: 8 }}>{errorMsg}</div>}
                <div style={{ height: 320 }}>
                  <DataGrid
                    rows={users}
                    columns={columns}
                    hideFooter
                    disableColumnMenu
                    disableColumnResize
                  />
                </div>
                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'center', marginTop: 32, gap: 8 }}>
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
                          queryClient.invalidateQueries({ queryKey: ['adminList'] });
                          if (onClose) onClose();
                        } catch (e) {
                          // TODO: 에러 처리 필요시 추가
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 className="modal-title-dept">관리자 부서 등록</h2>
                  <span className="modal-description-dept" style={{ fontWeight: 600 }}>
                    관리자: {selectedUser.name}
                  </span>
                </div>
                <p className="modal-description-dept">
                  관리자가 관리할 부서를 선택해 주세요.
                </p>
                <div style={{ flex: 1, marginTop: 16, height: 320 }}>
                  <DataGrid
                    rows={departmentList.map((dept) => ({ id: dept.departmentId, name: dept.name }))}
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
                            style={{ width: 20, height: 20, accentColor: '#232D64', cursor: 'pointer' }}
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
                            style={{ width: 20, height: 20, accentColor: '#232D64', cursor: 'pointer' }}
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
                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'center', marginTop: 32, gap: 8 }}>
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