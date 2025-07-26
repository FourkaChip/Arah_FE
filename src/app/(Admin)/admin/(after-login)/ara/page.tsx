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
            <p>입력 문장과 미리 등록된 문장의 연결 조건을 얼마나 정밀하게 볼지를 설정할 수 있습니다.</p>
            <p>설정값이 높을수록 문장의 흐름과 표현이 거의 일치할 때만 연결되며, 낮을수록 유사한 말투나 단어만으로도 연결됩니다.</p>
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