import * as echarts from 'echarts/core';
import {
  PieChart
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  // 数据集组件
  DatasetComponent,
  // 内置数据转换器组件 (filter, sort)
  TransformComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import type {
  // 系列类型的定义后缀都为 SeriesOption
  PieSeriesOption
} from 'echarts/charts';
import type {
  // 组件类型的定义后缀都为 ComponentOption
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  DatasetComponentOption
} from 'echarts/components';
import type {
  ComposeOption,
} from 'echarts/core';

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
type ECOption = ComposeOption<
  | PieSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
>;

import ReactECharts from 'echarts-for-react';
import { UseResizeDetectorReturn, useResizeDetector } from 'react-resize-detector';
import React, { forwardRef, useCallback, useRef } from 'react';


const greyColor = "rgba(231, 233, 239, 1)"
const makeCircularSeriesConfig = (color:string, startAngle:number, endAngle:number, borderRadius='3vmin') => ({
    color: [
        color,
    ],
    colorBy: 'series',
    type: 'pie',
    radius: ['76%', '100%'],
    startAngle: startAngle,
    endAngle: endAngle,
    stack: true,
    avoidLabelOverlap: false,
    silent: true,
    padAngle: 0,
    itemStyle: {
        borderRadius: borderRadius
    },
    labelLine: {
        show: false
    },
    data: [
        { value: 100 },
    ]
})

type CircularPartProps = {color:string, percentage:number, className?:string}
export const SemiCircularPart = forwardRef<ReactECharts, CircularPartProps>(({color, percentage, className}, ref) => {
    const option = {
        series: [
          makeCircularSeriesConfig(greyColor, 180, 0),
          makeCircularSeriesConfig(color, 180, Math.round(180-180*percentage/100)),
        ]
    }
    return <ReactECharts ref={ref} option={option} className={className} opts={{renderer: 'svg'}}/>
})

export const CircularPart = ({color, percentage, className}:CircularPartProps) => {
    const option = {
        series: [
            makeCircularSeriesConfig(greyColor, 180, -180, '6vmin'),
            makeCircularSeriesConfig(color, 180, Math.round(180-360*percentage/100), '6vmin'),
          ]
    }
    return <ReactECharts option={option} className={className} opts={{renderer: 'svg'}}/>
}