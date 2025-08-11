'use client';
import React, {useMemo, useCallback, useRef, useEffect} from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import {toast} from 'react-hot-toast';
import './ChatbotSlider.scss';
import {SLIDER_CONFIG, COLORS} from '@/constants/sliderConfig';
import type {ChatbotSliderProps, MarkStyleType} from '@/types/slider';

export default function ChatbotSlider({
                                          value,
                                          onChange,
                                          onChangeComplete,
                                          label,
                                          leftLabel,
                                          rightLabel,
                                          tips,
                                      }: ChatbotSliderProps) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const toastIdRef = useRef<string | null>(null);

    const sliderStyles = useMemo(
        () => ({
            trackStyle: {backgroundColor: COLORS.PRIMARY, height: 8},
            handleStyle: {
                backgroundColor: COLORS.WHITE,
                border: `2px solid ${COLORS.PRIMARY}`,
                height: 24,
                width: 24,
                marginTop: -8,
                marginBottom: 10,
            },
            railStyle: {backgroundColor: COLORS.RAIL_GRAY, height: 8},
            dotStyle: {display: 'none'},
        }),
        []
    );

    const getMarkClassName = useCallback(
        (i: number, cur: number): MarkStyleType =>
            i === 0 ? 'zero-value' : i === cur ? 'current-value' : 'default-value',
        []
    );

    const marks = useMemo(() => {
        const o: Record<number, React.ReactNode> = {};
        for (let i = SLIDER_CONFIG.MIN_VALUE; i <= SLIDER_CONFIG.MAX_VALUE; i++) {
            o[i] = (
                <span className={getMarkClassName(i, value)} key={i}>
          {i}
        </span>
            );
        }
        return o;
    }, [value, getMarkClassName]);

    const handleChange = useCallback(
        (v: number | number[]) => {
            const num = typeof v === 'number' ? v : v[0];
            onChange(num === 0 ? SLIDER_CONFIG.SELECTABLE_MIN : num);
        },
        [onChange]
    );

    const handleAfter = useCallback(
        async (v: number | number[]) => {
            const num = typeof v === 'number' ? v : v[0];
            const final = num === 0 ? SLIDER_CONFIG.SELECTABLE_MIN : num;

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            }

            toastIdRef.current = toast.loading('저장 중입니다...', {
                duration: Infinity,
            });

            timeoutRef.current = setTimeout(async () => {
                try {
                    onChangeComplete(final);
                    if (toastIdRef.current) {
                        toast.dismiss(toastIdRef.current);
                    }
                    toast.success(`${label}이 저장되었습니다.`);
                } catch (err) {
                    if (toastIdRef.current) {
                        toast.dismiss(toastIdRef.current);
                    }
                    if ((err as any).message === 'NO_CHANGE') {
                        toast.success(`${label}이 이미 적용된 값입니다.`);
                    } else {
                        toast.error(`${label} 저장에 실패했습니다.`);
                    }
                } finally {
                    toastIdRef.current = null;
                }
            }, 2000);
        },
        [onChangeComplete, label]
    );

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (toastIdRef.current) {
                toast.dismiss(toastIdRef.current);
            }
        };
    }, []);

    return (
        <div className="slider-block">
            <h3 className="slider-title">{label}</h3>

            <div className="slider-tip-box-container">
                <div className="slider-tip-box">
                    <p className="slider-tip-label">사용 팁</p>
                    <div className="slider-tip-content">
                        {tips.map((tip, i) => (
                            <p key={i}>{tip}</p>
                        ))}
                    </div>
                </div>
            </div>

            <div className="slider-wrapper">
                <Slider
                    min={SLIDER_CONFIG.MIN_VALUE}
                    max={SLIDER_CONFIG.MAX_VALUE}
                    marks={marks}
                    step={SLIDER_CONFIG.STEP}
                    value={value}
                    onChange={handleChange}
                    onChangeComplete={handleAfter}
                    trackStyle={sliderStyles.trackStyle}
                    handleStyle={sliderStyles.handleStyle}
                    railStyle={sliderStyles.railStyle}
                    dotStyle={sliderStyles.dotStyle}
                />
            </div>

            <div className="slider-labels">
                <span>{leftLabel}</span>
                <span>{rightLabel}</span>
            </div>
        </div>
    );
}
