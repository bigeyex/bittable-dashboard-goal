import { createSlice, current, PayloadAction } from '@reduxjs/toolkit'
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
  if (configState.currentValueType === 'useBittableData' && 'dataRange' in configState) {
    const currentValueDataCondition = currentValueDataConditionFromConfigState(configState)
    const currentValuePreview = await dashboard.getPreviewData(currentValueDataCondition)
    dispatch(setCurrentValue(valueFromIDATA(currentValuePreview)))
  }
  else {
    dispatch(setCurrentValue(Number(configState.currentValue)))
  }
  if (configState.targetValueType === 'useBittableData' && 'dataRange' in configState) {
    const targetValueDataCondition = targetValueDataConditionFromConfigState(configState)
    const targetValuePreview = await dashboard.getPreviewData(targetValueDataCondition)
    dispatch(setTargetValue(valueFromIDATA(targetValuePreview)))
  }
  else {
    dispatch(setTargetValue(Number(configState.targetValue)))
  }
})

export const refreshData = (payload:ConfigPayload):AppThunk => (async (dispatch, getState) => {
  const valueFromIDATA = (data:IData) => data.length >= 2 ? data[1][0].value as number : 0
  const configState = {...getState().config.config, ...payload}
  
  /* bittable only supports getData with 1 condition;
     and currentValue and targetValue may both use bitable data
     so saveConfig() with condition before getData() each time */
  if (configState.currentValueType === 'useBittableData' && 'dataRange' in configState) {
    const currentValueDataCondition = currentValueDataConditionFromConfigState(configState)
    console.log('save config with 1st condition', JSON.stringify(currentValueDataCondition))
    await dashboard.saveConfig({
      dataConditions: [currentValueDataCondition],
      customConfig: {
        'config': configState 
      }
    })
    const currentValuePreview = await dashboard.getData()
    console.log('fetched data', JSON.stringify(valueFromIDATA(currentValuePreview)))
    dispatch(setCurrentValue(valueFromIDATA(currentValuePreview)))
  }
  else {
    dispatch(setCurrentValue(Number(configState.currentValue)))
  }
  if (configState.targetValueType === 'useBittableData' && 'dataRange' in configState) {
    const targetValueDataCondition = targetValueDataConditionFromConfigState(configState)
    console.log('save config with 2nd condition', JSON.stringify(targetValueDataCondition))
    await dashboard.saveConfig({
      dataConditions: [targetValueDataCondition],
      customConfig: {
        'config': configState 
      }
    })
    const targetValuePreview = await dashboard.getData()
    console.log('fetched 2nd data', JSON.stringify(valueFromIDATA(targetValuePreview)))
    dispatch(setTargetValue(valueFromIDATA(targetValuePreview)))
  }
  else {
    dispatch(setTargetValue(Number(configState.targetValue)))
  }
})

// 保存图表配置到多维表格，在确认配置时调用
export const saveConfig = (payload:ConfigPayload):AppThunk => (async (dispatch, getState) => {
  const configState = {...getState().config.config, ...payload}
  const dashboardDataCondition = currentValueDataConditionFromConfigState(configState)
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
    const currentConfig = getState().config.config
    /* only setConfigState if config has changed.
       this is because in order to dashboard.getData() with multiple conditions, 
       it needs to saveConfig with each condition, which will trigger onConfigChange.
       To prevent flicking screen, check config change before setConfigState. */
    let hasChanged = false
    let key: keyof ConfigState
    for (key in configState) {
      if (!(key in currentConfig && currentConfig[key] == configState[key])) {
        hasChanged = true
        break
      }
    }
    if(hasChanged){
      dispatch(setConfigState(configState))
    }
    return configState
  }
  return initialState.config
})

export default configSlice.reducer