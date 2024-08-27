import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'
import { AppThunk } from './hook'
import { dashboard, IDataCondition, ISeries, DashboardState, IData } from '@lark-base-open/js-sdk'
import { setCurrentValue, setTargetValue } from './chartData'
import { isGetDataLimited } from '../components/common'

// Define a type for the slice state
export interface ConfigState {
    color: string
    currentValueType: string // customValue | useBittableData
    currentValue: string
    currentValueAggMethod: string
    currentValueCalcMethod: string
    currentValueAggField: string
    targetValueType: string
    targetValue: string
    targetValueAggMethod: string
    targetValueCalcMethod: string
    targetValueAggField: string
    dataRange: string
    dataSource: string
    chartType: string
    numericAbbrKilos: boolean
    numericDigits: number
    
    unitPosition: string
    abbrRule: string
    numberPrefix: string
    numberSuffix: string
    percentageNumericDigits: number
    targetValueAsDenominator: boolean
}

export interface ConfigSliceState {
  config: ConfigState
}

export type ConfigPayload = Partial<ConfigState>

// Define the initial state using that type
const initialState: ConfigSliceState = {
  config: {
    color: "rgb(255,198,12)",
    currentValueType: 'useBittableData',
    currentValue: '0',
    currentValueAggMethod: "sum",
    currentValueCalcMethod: "count",
    currentValueAggField: "",
    dataRange: "{\"type\":\"ALL\"}",
    dataSource: "",
    chartType: "bar",
    numericAbbrKilos: false,
    targetValueAsDenominator: false,
    numericDigits: 0,
    targetValueType: 'customValue',
    targetValue: '100',
    targetValueAggMethod: "sum",
    targetValueCalcMethod: "count",
    targetValueAggField: "",
    unitPosition: "left",
    abbrRule: "none",
    numberPrefix: "",
    numberSuffix: "",
    percentageNumericDigits: 0,
  }
}

export const configSlice = createSlice({
  name: 'config',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setConfigState: (state, action:PayloadAction<ConfigPayload>) => {
        // fix an issue, when input field is empty, the key will be omitted in semi Form's onChange event
        action.payload.numberPrefix = 'numberPrefix' in action.payload ? action.payload.numberPrefix : ''
        action.payload.numberSuffix = 'numberSuffix' in action.payload ? action.payload.numberSuffix : ''
        state.config = {...state.config, ...action.payload}
    },
  }
})

export const { setConfigState } = configSlice.actions

function dataConditionFromConfigState(state:ConfigState):IDataCondition {
    let series = []
    let countMode = false;
    if (state.currentValueType === 'useBittableData') {
      if (state.currentValueCalcMethod === 'count') {
        countMode = true
      }
      else {
        series.push({
          fieldId: state.currentValueAggField,
          rollup: state.currentValueAggMethod
        } as ISeries)
      }
    }
    if (state.targetValueType === 'useBittableData') {
      if (state.targetValueCalcMethod === 'count') {
        countMode = true
      }
      else {
        series.push({
          fieldId: state.targetValueAggField,
          rollup: state.targetValueAggMethod
        } as ISeries)
      }
    }
    return {
      tableId: state.dataSource,
      dataRange: JSON.parse(state.dataRange),
      series: countMode ? 'COUNTA' : series
    }
}

export const updatePreviewData = (payload:ConfigPayload):AppThunk => (async (dispatch, getState) => {
  const configState = payload as ConfigState
  const singleValueFromIDATA = (data:IData) => data.length >= 2 ? data[1][0].value as number : 0

  let idata:IData = []
  let currentValue = Number(configState.currentValue) // 如不取自多维表格，直接用配置里的值
  let targetValue = Number(configState.targetValue)
  
  if ( (configState.currentValueType === 'useBittableData' || configState.targetValueType === 'useBittableData') && 'dataRange' in configState) {
    
    if (isGetDataLimited(configState)) {
      const currentValueDataCondition = dataConditionFromConfigState({...configState, targetValueType: 'customValue'})
      const currentValuePreview = await dashboard.getPreviewData(currentValueDataCondition)
      currentValue = singleValueFromIDATA(currentValuePreview)
      const targetValueDataCondition = dataConditionFromConfigState({...configState, currentValueType: 'customValue'})
      const targetValuePreview = await dashboard.getPreviewData(targetValueDataCondition)
      targetValue = singleValueFromIDATA(targetValuePreview)
    }
    else{
      const dataCondition = dataConditionFromConfigState(configState)
      if (dashboard.state === DashboardState.Config || dashboard.state === DashboardState.Create) {
        idata = await dashboard.getPreviewData(dataCondition)
      }
      else {
        idata = await dashboard.getData()
      } 
    }
    
  }
  
  if (!isGetDataLimited(configState) && idata.length >= 2) {  // 根据当前值和目标值是否取自多维表格，api返回的idata可能有1个或2个值，这里做一个分配
    if (idata[1].length >= 2) {
      currentValue = idata[1][0].value as number
      targetValue = idata[1][1].value as number
    }
    else {
      if (configState.currentValueType === 'useBittableData') {
        currentValue = idata[1][0].value as number
      }
      else {
        targetValue = idata[1][0].value as number
      }
    }
  }

  dispatch(setCurrentValue(currentValue))
  dispatch(setTargetValue(targetValue))

})

// 保存图表配置到多维表格，在确认配置时调用
export const saveConfig = (payload:ConfigPayload):AppThunk => (async (dispatch, getState) => {
  const configState = {...getState().config.config, ...payload}
  const dashboardDataCondition = dataConditionFromConfigState(configState)
    
  dashboard.saveConfig({
    dataConditions: [dashboardDataCondition],
    customConfig: {
      'config': configState 
    }
  })
})

// 从多维表格中读取图表配置
export const loadConfig = ():AppThunk<Promise<ConfigPayload>> => (async (dispatch, getState):Promise<ConfigPayload> => {
  if (dashboard.state === DashboardState.Create) {
    return initialState.config
  }
  const dashboardConfig = await dashboard.getConfig()
  if (dashboardConfig.customConfig && 'config' in dashboardConfig.customConfig) {
    const configState = dashboardConfig.customConfig['config'] as ConfigState
    dispatch(setConfigState(configState))
    return configState
  }
  return initialState.config
})

export default configSlice.reducer