import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'
import { AppThunk } from './hook'
import { dashboard, IDataCondition, ISeries, DashboardState } from '@lark-base-open/js-sdk'
import { setCurrentValueFromIData } from './chartData'

// Define a type for the slice state
export interface ConfigState {
    color: string
    currentValueAggMethod: string
    currentValueCalcMethod: string
    currentValueAggField: string
    dataRange: string
    dataSource: string
    chartType: string
    numericAbbrKilos: boolean
    numericDigits: number
    targetValue: string
    unitPosition: string
    unitSign: string
}

export interface ConfigSliceState {
  config: ConfigState
}

export type ConfigPayload = Partial<ConfigState>

// Define the initial state using that type
const initialState: ConfigSliceState = {
  config: {
    color: "rgb(255,198,12)",
    currentValueAggMethod: "sum",
    currentValueCalcMethod: "count",
    currentValueAggField: "",
    dataRange: "{\"type\":\"ALL\"}",
    dataSource: "",
    chartType: "bar",
    numericAbbrKilos: false,
    numericDigits: 0,
    targetValue: '100',
    unitPosition: "left",
    unitSign: "$",
  }
}

export const configSlice = createSlice({
  name: 'config',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setConfigState: (state, action:PayloadAction<ConfigPayload>) => {
        state.config = {...state.config, ...action.payload}
    },
  }
})

export const { setConfigState } = configSlice.actions

function dashboardDataConditionFromConfigState(state:ConfigState):IDataCondition {
    return {
      tableId: state.dataSource,
      dataRange: JSON.parse(state.dataRange),
      series: state.currentValueCalcMethod === 'count' ? 'COUNTA' : [{
        fieldId: state.currentValueAggField,
        rollup: state.currentValueAggMethod
      } as ISeries]
    }
}

export const updatePreviewData = (payload:ConfigPayload):AppThunk => (async (dispatch, getState) => {
  const dashboardDataCondition = dashboardDataConditionFromConfigState({...getState().config.config, ...payload})
  const previewData = await dashboard.getPreviewData(dashboardDataCondition)
  dispatch(setCurrentValueFromIData(previewData))
})

// 保存图表配置到多维表格，在确认配置时调用
export const saveConfig = (payload:ConfigPayload):AppThunk => (async (dispatch, getState) => {
  const configState = {...getState().config.config, ...payload}
  const dashboardDataCondition = dashboardDataConditionFromConfigState(configState)
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