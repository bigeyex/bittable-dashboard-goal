import { GoalChartProps } from "."
import './bar.scss'

export default ({currentValueText, targetValueText, color, percentage}:GoalChartProps) => {
    return <div className="goalchartBarContainer">
        <div className="goalchartBar">
            <div className="textRegion">
                <div className="currentValue" style={{color: `${color}`}}>{currentValueText}</div>
                <div className="seperatorContainer">
                    <div className="vSeperator"></div>
                </div>
                <div className="targetValue">{targetValueText}</div>
                <div className="percentage">{percentage}%</div>
            </div>
            <div className="chartBar">
                <div className="chartBarFilled" style={{width: `${percentage}%`, backgroundColor: `${color}`}}></div>
            </div>
        </div>
    </div>
}