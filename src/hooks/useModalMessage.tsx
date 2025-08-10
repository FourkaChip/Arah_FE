import { useState } from 'react';

export const useModalMessage = () => {
    const [openSuccessModal, setOpenSuccessModal] = useState(false);
    const [successTitle, setSuccessTitle] = useState('');
    const [successDescription, setSuccessDescription] = useState('');
    const [openErrorModal, setOpenErrorModal] = useState(false);
    const [errorTitle, setErrorTitle] = useState('');
    const [errorDescription, setErrorDescription] = useState('');

    const showSuccess = (title: string, description?: string) => {
        setSuccessTitle(title || '성공');
        setSuccessDescription(description || '');
        setOpenSuccessModal(true);
    };

    const showError = (title: string, description?: string) => {
        setErrorTitle(title || '오류');
        setErrorDescription(description || '');
        setOpenErrorModal(true);
    };

    const closeSuccess = () => {
        setOpenSuccessModal(false);
        setSuccessTitle('');
        setSuccessDescription('');
    };

    const closeError = () => {
        setOpenErrorModal(false);
        setErrorTitle('');
        setErrorDescription('');
    };

    return {
        openSuccessModal,
        successTitle,
        successDescription,
        openErrorModal,
        errorTitle,
        errorDescription,
        showSuccess,
        showError,
        closeSuccess,
        closeError,
    };
};
