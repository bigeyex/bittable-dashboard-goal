import { GoalChartProps } from "."
import { getLongTextClass, isConfigLayout } from "../common"
import './bar.scss'

export default ({currentValueText, targetValueText, color, percentage, percentageText}:GoalChartProps) => {
    return <div className={'goalchartBarContainer' + (isConfigLayout() ? ' config' : '')}>
        <div className="goalchartBar">
            <div className={"textRegion" + getLongTextClass(currentValueText, targetValueText, percentageText)}>
                <div className="currentValue" style={{color: `${color}`}}>{currentValueText}</div>
                <div className="seperatorContainer">
                    <div className="vSeperator"></div>
                </div>
                <div className="targetValue">{targetValueText}</div>
                <div className="percentage">{percentageText}%</div>
            </div>
            <div className="chartBar">
                <div className="chartBarFilled" style={{width: `${percentage < 8 && percentage > 0 ? 8 : percentage}%`, backgroundColor: `${color}`}}></div>
            </div>
        </div>
    </div>
}