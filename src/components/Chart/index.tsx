import { useAppSelector } from "../../store/hook"
import { darkModeThemeColor, getLocalUnitAbbrRule } from "../common";
import Bar from './bar'
import Circular from "./circular";
import SemiCircular from './semiCircular'

export interface GoalChartProps {
    currentValueText: string;
    targetValueText: string;
    color: string;
    percentage: number;
    percentageText: string;
}

export default () => {
    const currentValue = useAppSelector(store => store.chartData.currentValue)
    const targetValue = useAppSelector(store => store.chartData.targetValue)
    const config = useAppSelector(store => store.config.config)
    
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
        color: darkModeThemeColor(config.color),
        percentage: percentage,
        percentageText: percentageText
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