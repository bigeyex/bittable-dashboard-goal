import { GoalChartProps } from "."
import { CircularPart } from "./circularPart"
import { useResizeDetector } from 'react-resize-detector';

import './circular.scss'
import { createRef, useEffect, useRef } from "react";
import ReactECharts from 'echarts-for-react';
import { getLongTextClass, isConfigLayout } from "../common";
import { dashboard } from "@lark-base-open/js-sdk";


export default ({currentValueText, targetValueText, isDarkMode, color, percentage, percentageText, chartBgColor}:GoalChartProps) => {
    const chartRef = createRef<ReactECharts>()

    const { width, height, ref } = useResizeDetector({
        refreshMode: 'debounce',
        refreshRate: 1000,
        onResize: () => {
            chartRef.current?.getEchartsInstance().resize()
        }
      });

    useEffect(() => {
        chartRef.current?.getEchartsInstance().resize()
    }, [])

    return <div className={'goalchartCircularContainer' + (isConfigLayout() ? ' config' : '')}
                    style={{ background: chartBgColor }}>
        <div className="circle">
            <div className={"detailNumbers" + getLongTextClass(currentValueText, targetValueText, percentageText, 23)}>
                <div className="currentValue" style={{color: `${color}`}}>{currentValueText}</div>
                <div className="seperatorContainer">
                    <div className="vSeperator"></div>
                </div>
                <div className="targetValue">{targetValueText}</div>
            </div>
            <div ref={ref} className="chartRegion">
                <CircularPart ref={chartRef} className="circularPart" isDarkMode={isDarkMode} color={color} percentage={percentage}/>
                <div className={"percentage" + ((percentageText.length > 4) ? ' longText': '')}>{percentageText}%</div>
            </div>
        </div>
    </div>
}