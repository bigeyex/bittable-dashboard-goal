import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'
import { AppThunk } from './hook'
import { dashboard, IDataCondition, ISeries, DashboardState, IData } from '@lark-base-open/js-sdk'
import { setCurrentValue, setTargetValue } from './chartData'

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

function currentValueDataConditionFromConfigState(state:ConfigState):IDataCondition {
    return {
      tableId: state.dataSource,
      dataRange: JSON.parse(state.dataRange),
      series: state.currentValueCalcMethod === 'count' ? 'COUNTA' : [{
        fieldId: state.currentValueAggField,
        rollup: state.currentValueAggMethod
      } as ISeries]
    }
}

function targetValueDataConditionFromConfigState(state:ConfigState):IDataCondition {
  return {
    tableId: state.dataSource,
    dataRange: JSON.parse(state.dataRange),
    series: state.targetValueCalcMethod === 'count' ? 'COUNTA' : [{
      fieldId: state.targetValueAggField,
      rollup: state.targetValueAggMethod
    } as ISeries]
  }
}

export const updatePreviewData = (payload:ConfigPayload):AppThunk => (async (dispatch, getState) => {
  const valueFromIDATA = (data:IData) => data.length >= 2 ? data[1][0].value as number : 0
  const configState = payload as ConfigState
  // 因为多维表格API限制，如果有两组条件，虽然可以使用getPreviewData获得数据，但只有编辑权限才能使用图表，
  // 且监测更新会受限。所以这里做兼容，如果只有一组条件，(在非编辑情况下)就用getData()；否则使用getPreviewData
  const useGetPreviewData = dashboard.state === DashboardState.Config || dashboard.state === DashboardState.Create ||
      (configState.currentValueType === 'useBittableData' && configState.targetValueType === 'useBittableData');
  console.log('use preview data: ', useGetPreviewData)
  console.log(configState)
  if (configState.currentValueType === 'useBittableData' && 'dataRange' in configState) {
    if (useGetPreviewData) {
      const currentValueDataCondition = currentValueDataConditionFromConfigState(configState)
      const currentValuePreview = await dashboard.getPreviewData(currentValueDataCondition)
      dispatch(setCurrentValue(valueFromIDATA(currentValuePreview)))
    }
    else {
      const currentValue = await dashboard.getData()
      dispatch(setCurrentValue(valueFromIDATA(currentValue)))
    }
  }
  else {  // 当前值是一个固定值
    dispatch(setCurrentValue(Number(configState.currentValue)))
  }
  if (configState.targetValueType === 'useBittableData' && 'dataRange' in configState) {
    if (useGetPreviewData) {
      const targetValueDataCondition = targetValueDataConditionFromConfigState(configState)
      const targetValuePreview = await dashboard.getPreviewData(targetValueDataCondition)
      dispatch(setTargetValue(valueFromIDATA(targetValuePreview)))
    }
    else {
      const targetValue = await dashboard.getData()
      dispatch(setTargetValue(valueFromIDATA(targetValue)))
    }
  }
  else {
    dispatch(setTargetValue(Number(configState.targetValue)))
  }
})

// 保存图表配置到多维表格，在确认配置时调用
export const saveConfig = (payload:ConfigPayload):AppThunk => (async (dispatch, getState) => {
  const configState = {...getState().config.config, ...payload}
  const dashboardDataCondition = configState.currentValueType === 'useBittableData' ? 
    currentValueDataConditionFromConfigState(configState) :
    targetValueDataConditionFromConfigState(configState)  
    
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