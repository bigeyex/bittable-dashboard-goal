import { useAppSelector } from "../../store/hook"
import Bar from './bar'

export interface GoalChartProps {
    currentValueText: string;
    targetValueText: string;
    color: string;
    percentage: number;
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
        let result = number.toLocaleString(undefined, {
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
    const props:GoalChartProps = {
        currentValueText: formatNumber(currentValue),
        targetValueText: formatNumber(Number(config.targetValue)),
        color: config.color,
        percentage: Math.round(currentValue / Number(config.targetValue))
    }

    return <Bar {...props}/>
}