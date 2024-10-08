import { useAppSelector } from "../../store/hook"
import React, { useCallback, useEffect, useState } from 'react';
import { DashboardState, IDashboardTheme, ThemeModeType, bitable, dashboard } from "@lark-base-open/js-sdk";

import { getLocalUnitAbbrRule, themeColors, themeKeyLookup } from "../common";
import Bar from './bar'
import Circular from "./circular";
import SemiCircular from './semiCircular'

export interface GoalChartProps {
    currentValueText: string;
    targetValueText: string;
    color: string;
    percentage: number;
    percentageText: string;
    isDarkMode: boolean;
    chartBgColor: string;
}

export default () => {
    const currentValue = useAppSelector(store => store.chartData.currentValue)
    const targetValue = useAppSelector(store => store.chartData.targetValue)
    const config = useAppSelector(store => store.config.config)

    // dashboard theme system section
    const [themeConfig, setThemeConfig] = useState<IDashboardTheme>();
    const getThemeConfig = async () => {
        const theme = await dashboard.getTheme();
        setThemeConfig(theme);
    }
    useEffect(() => {
        getThemeConfig()
    }, [])
    dashboard.onThemeChange(res => {
        setThemeConfig(res.data);
    });
    const themedColor = themeConfig ? themeConfig.labelColorTokenList[themeKeyLookup[config.color]] : config.color;
    const chartBgColor = themeConfig ? themeConfig.chartBgColor : 'transparent';
    
    const formatNumber = (number:number) => {
        const abbrRuleSet = getLocalUnitAbbrRule()
        const rule = config.abbrRule in abbrRuleSet ? abbrRuleSet[config.abbrRule] : abbrRuleSet['none']
        let numberResult = number / rule.size
        let result = numberResult.toLocaleString(undefined, {
            maximumFractionDigits: config.numericDigits,
        });
        result = config.numberPrefix + result + rule.suffix + config.numberSuffix
        return result
    }

    let percentage = 100 * currentValue / targetValue
    let percentageText = percentage.toFixed(0)
    if (config.percentageNumericDigits) {
        percentageText = percentage.toFixed(config.percentageNumericDigits)
    }
    if (percentage > 100) { percentage = 100 }
    if (percentage < 0) { percentage = 0 }

    const props:GoalChartProps = {
        currentValueText: formatNumber(currentValue),
        targetValueText: formatNumber(targetValue),
        color: themedColor,
        isDarkMode: themeConfig?.theme == ThemeModeType.DARK,
        percentage: percentage,
        percentageText: percentageText,
        chartBgColor: chartBgColor,
    }

    if (config.chartType === 'semiCircular') {
        return <SemiCircular {...props} />
    }
    else if (config.chartType === 'circular') {
        return <Circular {...props} />
    }
    else {
        return <Bar {...props}/>
    }
}