import { useAppSelector } from "../../store/hook"
import { darkModeThemeColor } from "../common";
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
    const config = useAppSelector(store => store.config.config)
    
    const formatNumber = (number:number) => {
        let numberResult = number
        let kiloMark = ''
        if (config.numericAbbrKilos && numberResult >= 1000000) {
            numberResult = numberResult / 1000000
            kiloMark = 'M'
        }
        else if (config.numericAbbrKilos && numberResult >= 1000) {
            numberResult = numberResult / 1000
            kiloMark = 'K'
        }
        let result = numberResult.toLocaleString(undefined, {
            maximumFractionDigits: config.numericDigits,
        });
        result = result + kiloMark
        if (config.unitPosition === 'left') {
            result = config.unitSign + result
        } 
        else {
            result = result + config.unitSign
        }
        return result
    }

    let percentage = config.targetValueAsDenominator ? 
        100 * Number(config.targetValue) / currentValue
        : 100 * currentValue / Number(config.targetValue)
    let percentageText = percentage.toFixed(0)
    if (config.percentageNumericDigits) {
        percentageText = percentage.toFixed(config.percentageNumericDigits)
    }
    if (percentage > 100) { percentage = 100 }
    if (percentage < 0) { percentage = 0 }

    const props:GoalChartProps = {
        currentValueText: formatNumber(currentValue),
        targetValueText: formatNumber(Number(config.targetValue)),
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