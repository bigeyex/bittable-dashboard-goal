import { useAppSelector } from "../../store/hook"


export default () => {
    const currentValue = useAppSelector(store => store.chartData.currentValue)
    const targetValue = useAppSelector(store => store.config.targetValue)
    

    return <div>
        targetValue: {targetValue}, currentValue: {currentValue}
    </div>
}