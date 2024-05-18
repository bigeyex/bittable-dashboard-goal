import { GoalChartProps } from "."
import { CircularPart } from "./circularPart"
import { useResizeDetector } from 'react-resize-detector';

import './circular.scss'
import { createRef, useEffect, useRef } from "react";
import ReactECharts from 'echarts-for-react';
import { isConfigLayout } from "../common";
import { dashboard } from "@lark-base-open/js-sdk";


export default ({currentValueText, targetValueText, color, percentage}:GoalChartProps) => {
    const chartRef = createRef<ReactECharts>()

    const { width, height, ref } = useResizeDetector({
        refreshMode: 'debounce',
        refreshRate: 1000,
        onResize: () => {
            chartRef.current?.getEchartsInstance().resize()
        }
      });

    const onRendered = () => {dashboard.setRendered()}
    useEffect(() => {
        chartRef.current?.getEchartsInstance().resize()
        chartRef.current?.getEchartsInstance().on('rendered', onRendered) // 当图表渲染完毕时，通知多维表格
        return () => {
            chartRef.current?.getEchartsInstance().off('rendered', onRendered)
        }
    }, [])

    return <div className={'goalchartCircularContainer' + (isConfigLayout() ? ' config' : '')}>
        <div className="circle">
            <div className="detailNumbers">
                <div className="currentValue" style={{color: `${color}`}}>{currentValueText}</div>
                <div className="seperatorContainer">
                    <div className="vSeperator"></div>
                </div>
                <div className="targetValue">{targetValueText}</div>
            </div>
            <div ref={ref} className="chartRegion">
                <CircularPart ref={chartRef} className="circularPart" color={color} percentage={percentage}/>
                <div className="percentage">{percentage}%</div>
            </div>
        </div>
    </div>
}