import { GoalChartProps } from "."
import { SemiCircularPart } from "./circularPart"
import { useResizeDetector } from 'react-resize-detector';

import './semiCircular.scss'
import { createRef, useEffect, useRef } from "react";
import ReactECharts from 'echarts-for-react';


export default ({currentValueText, targetValueText, color, percentage}:GoalChartProps) => {
    const chartRef = createRef<ReactECharts>()

    const { width, height, ref } = useResizeDetector({
        refreshMode: 'debounce',
        refreshRate: 1000,
        onResize: () => {
            chartRef.current?.getEchartsInstance().resize({width: width, height: height!*2})
        }
      });

    useEffect(() => {
        chartRef.current?.getEchartsInstance().resize()
        console.log('loaded')
    }, [])

    return <div className="goalchartSemiCircularContainer">
        <div className="semiCircle">
            <div className="textRegion">
                <div className="percentage">{percentage}%</div>
                <div className="detailNumbers">
                    <div className="currentValue" style={{color: `${color}`}}>{currentValueText}</div>
                    <div className="seperatorContainer">
                        <div className="vSeperator"></div>
                    </div>
                    <div className="targetValue">{targetValueText}</div>
                </div>
            </div>
            <div ref={ref} className="chartRegion">
                <SemiCircularPart ref={chartRef} className="circularPart" color={color} percentage={percentage}/>
            </div>
        </div>
    </div>
}