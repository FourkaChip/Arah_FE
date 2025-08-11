import React from 'react';
import LoadingSpinner from './Spinner';

interface SpinnerOverlayProps {
    message: string;
    zIndex?: number;
}

const SpinnerOverlay: React.FC<SpinnerOverlayProps> = ({message, zIndex = 9999}) => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex
    }}>
        <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '2rem'
        }}>
            <LoadingSpinner/>
            <p style={{textAlign: 'center', marginTop: '1rem', fontSize: '14px', color: '#666'}}>
                {message}
            </p>
        </div>
    </div>
);

export default SpinnerOverlay;

