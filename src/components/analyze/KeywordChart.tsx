// src/components/analyze/KeyWordChart.tsx
'use client';

import React from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import type { TooltipContentProps } from 'recharts/types/component/Tooltip';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useKeywordChart } from '@/hooks/useKeywordChart';
import { getKeywordColor, KEYWORD_CHART_CONFIG } from '@/constants/keywordConfig';
import './AnalyzeChart.scss';

const CustomTooltip = ({ active, payload, label }: TooltipContentProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const valNum = Number(payload[0]?.value ?? 0);
    return (
      <div className="tooltip">
        <p>{`${label}: ${valNum}건`}</p>
      </div>
    );
  }
  return null;
};

const KeywordChart: React.FC = () => {
  const {
    dateRange,
    keywordData,
    loading,
    error,
    companyCreatedAt,
    handleDateChange,
  } = useKeywordChart();

  const getCurrentDate = () => new Date().toISOString().split('T')[0];

  const renderEmptyState = () => {
    if (loading) {
      return (
        <div className="emptyState loading">
          로딩 중...
        </div>
      );
    }

    if (error) {
      return (
        <div className="emptyState error">
          {error}
        </div>
      );
    }

    if (keywordData.length === 0) {
      return (
        <div className="emptyState">
          데이터가 없습니다.
        </div>
      );
    }

    return null;
  };

  const renderChart = () => {
    if (loading || error || keywordData.length === 0) {
      return renderEmptyState();
    }

    return (
      <ResponsiveContainer width="100%" height={KEYWORD_CHART_CONFIG.height} className="chartContent">
        <BarChart 
          data={keywordData} 
          margin={KEYWORD_CHART_CONFIG.margin}
          barCategoryGap={KEYWORD_CHART_CONFIG.barCategoryGap}
        >
          <CartesianGrid 
            strokeDasharray={KEYWORD_CHART_CONFIG.gridConfig.strokeDasharray} 
            stroke={KEYWORD_CHART_CONFIG.gridConfig.stroke} 
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ 
              fontSize: KEYWORD_CHART_CONFIG.xAxisConfig.fontSize, 
              fill: KEYWORD_CHART_CONFIG.xAxisConfig.fill 
            }}
            angle={KEYWORD_CHART_CONFIG.xAxisConfig.angle}
            textAnchor="end"
            height={KEYWORD_CHART_CONFIG.xAxisConfig.height}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ 
              fontSize: KEYWORD_CHART_CONFIG.yAxisConfig.fontSize, 
              fill: KEYWORD_CHART_CONFIG.yAxisConfig.fill 
            }} 
          />
          <Tooltip content={(props) => <CustomTooltip {...props} />} />
          <Bar 
            dataKey="value" 
            radius={KEYWORD_CHART_CONFIG.barConfig.radius} 
            maxBarSize={KEYWORD_CHART_CONFIG.maxBarSize}
          >
            {keywordData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={getKeywordColor(idx)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderLegend = () => {
    if (loading || error || keywordData.length === 0) {
      return null;
    }

    return (
      <div className="legend">
        {keywordData.map((item, index) => (
          <div key={index} className="legendItem">
            <div className="legendColor" style={{ backgroundColor: getKeywordColor(index) }} />
            <span className="legendText">
              {item.name} {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="box chartContainer keywordChart">
      <div className="chartHeader">
        <h3 className="chartTitle">인기 키워드 TOP 10</h3>
        <div className="date-search-section">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="date-picker"
            min={companyCreatedAt || undefined}
            max={getCurrentDate()}
          />
          <span>~</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="date-picker"
            min={dateRange.startDate}
            max={getCurrentDate()}
          />
        </div>
      </div>

      <div className="chartWrapper">
        {renderChart()}
      </div>

      {renderLegend()}
    </div>
  );
};

export default KeywordChart;