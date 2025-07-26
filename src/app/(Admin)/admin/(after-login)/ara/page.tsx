'use client';

import { useState } from 'react';
import ChatbotSlider from '@/components/Slider/ChatbotSlider';
import './Ara.scss';

export default function ChatbotSettingsPage() {
  const [similarity, setSimilarity] = useState(5);
  const [style, setStyle] = useState(5);

  return (
    <div className="chatbot-settings-page">
      <div className="container">
        <div className="admin-main-page-wrapper">
          <h1 className="admin-main-title">챗봇 설정</h1>
          <div className="admin-main-description">
            <p>챗봇의 연결 기준과 응답 스타일을 설정할 수 있습니다. 발화 유사도와 사고 스타일을 조절해 응답의 정밀도와 사고 표현을 자유롭게 조정하세요.</p>
            <p>모든 설정은 <span className="highlight">1~10</span> 사이 값으로 선택 가능합니다.</p>
          </div>
        </div>

        <ChatbotSlider
          value={similarity}
          onChange={setSimilarity}
          label="발화 유사도 설정"
          leftLabel="포괄적 대응"
          rightLabel="정확한 대응"
          tip="느슨한 매칭이 필요할 땐 기준을 낮춰서 다양한 표현을 포용하세요.,정밀한 매칭이 필요할 땐 기준을 높여서 정확한 응답을 이끌어낼 수 있어요."
        />

        <ChatbotSlider
          value={style}
          onChange={setStyle}
          label="사고 스타일 설정"
          leftLabel="형식적 사고"
          rightLabel="창의적 사고"
          tip="사무적인 답변이 필요할 땐 기준을 낮춰서 형식적으로 대화할 수 있어요.,다양한 관점의 답변을 원한다면 기준을 높여서 창의적으로 대화할 수 있어요."
        />
      </div>
    </div>
  );
}