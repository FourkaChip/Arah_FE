import { useState } from 'react';

export const useModalMessage = () => {
    const [openSuccessModal, setOpenSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [openErrorModal, setOpenErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setOpenSuccessModal(true);
    };

    const showError = (message: string) => {
        setErrorMessage(message);
        setOpenErrorModal(true);
    };

    const closeSuccess = () => {
        setOpenSuccessModal(false);
        setSuccessMessage('');
    };

    const closeError = () => {
        setOpenErrorModal(false);
        setErrorMessage('');
    };

    return {
        openSuccessModal,
        successMessage,
        openErrorModal,
        errorMessage,
        showSuccess,
        showError,
        closeSuccess,
        closeError,
    };
};

