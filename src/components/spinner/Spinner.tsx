// 스피너 gif 컴포넌트입니다.
import React from 'react';

const LoadingSpinner = () => (
    <div style={{textAlign: 'center', padding: '2rem'}}>
        <img src="/spinner.gif" alt="Loading..." width={48} height={48}/>
    </div>
);

export default LoadingSpinner;