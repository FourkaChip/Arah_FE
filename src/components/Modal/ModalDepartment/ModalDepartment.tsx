"use client";
import { useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import ModalButton from "@/components/Modal/Buttons/ModalButton";
import './ModalDepartment.scss';
import { userRows} from "@/constants/dummydata/DummyMasterFile";
import { allDepartments} from "@/constants/dummydata/DummyMasterFile";
import { ModalDepartmentProps} from "@/types/modals";

export default function ModalDepartment({
  defaultStep = 'list',
  defaultUser = null,
  defaultChecked = [],
  onClose,
}: ModalDepartmentProps) {
  const [step, setStep] = useState<'list' | 'select'>(defaultStep);
  const [selectedUser, setSelectedUser] = useState<any>(defaultUser);
  const [checked, setChecked] = useState<string[]>(defaultChecked);

  const handleDepartmentClick = (user: any) => {
    setSelectedUser(user);
    setChecked([]); // Reset selected departments
    setStep('select');
  };

  const toggleDepartment = (dept: string) => {
    setChecked(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: '이름', flex: 1, resizable: false },
    { field: 'departments', headerName: '선택된 부서', flex: 2, resizable: false },
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

  return (
    <div className="modal-window department-modal">
      <div className="modal-dialog department-modal" style={{ width: 640, height: 574 }}>
        <button className="modal-close" onClick={onClose}>×</button>
        {step === 'list' ? (
          <>
            <h2 className="modal-title">관리자 부서 등록</h2>
            <p className="modal-description">관리자가 관리할 부서를 선택해 주세요.</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input className="department-search-input" placeholder="관리자로 등록할 사용자의 이메일을 입력해 주세요." style={{ flex: 1 }} />
              <button className="button is-dark">추가</button>
            </div>
            <div style={{ height: 320 }}>
              <DataGrid
                rows={userRows}
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
                  if (defaultStep === 'select') {
                    onClose?.();
                  } else {
                    setStep('list');
                  }
                }}
              />
              <ModalButton type="default" label="확인" onClick={function (): void {
                throw new Error('Function not implemented.');
              }} />
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title">관리자 부서 등록</h2>
              <span className="modal-description" style={{ fontWeight: 600 }}>
                관리자: {selectedUser.name}({selectedUser.departments.split(',')[0]})
              </span>
            </div>
            <p className="modal-description">
              관리자가 관리할 부서를 선택해 주세요.
            </p>
            <div style={{ flex: 1, marginTop: 16, height: 320 }}>
              <DataGrid
                rows={allDepartments.map((dept) => ({ id: dept, name: dept }))}
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
                        checked={checked.length === allDepartments.length}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setChecked(isChecked ? [...allDepartments] : []);
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
                  if (defaultStep === 'select') {
                    onClose?.();
                  } else {
                    setStep('list');
                  }
                }}
              />
              <ModalButton type="default" label="확인" onClick={function (): void {
                throw new Error('Function not implemented.');
              }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}