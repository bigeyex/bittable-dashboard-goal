import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './index'
import { AppThunk } from './hook'

// Define a type for the slice state
export interface ConfigState {
    color: string
    currentValueAggMethod: string
    currentValueField: string
    dataRange: string
    dataSource: string
    numericAbbrKilos: boolean
    numericDigits: number
    targetValue: number
    unitPosition: string
    unitSign: string
}

export type ConfigPayload = Partial<ConfigState>

// Define the initial state using that type
const initialState: ConfigState = {
    color: "green",
    currentValueAggMethod: "sum",
    currentValueField: "count",
    dataRange: "{\"type\":\"ALL\"}",
    dataSource: "tblhv0t7hTlv21lq",
    numericAbbrKilos: false,
    numericDigits: 0,
    targetValue: 100,
    unitPosition: "left",
    unitSign: "$",
}

export const configStateSlice = createSlice({
  name: 'counter',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setConfigState: (state, action:PayloadAction<ConfigPayload>) => {
        state = {...state, ...action.payload}
    },
  }
})

export const { setConfigState } = configStateSlice.actions

export const setConfigAndUpdatePreviewData = (payload:ConfigPayload):AppThunk => (async (dispatch, getState) => {

})

export const saveConfig = (payload:ConfigPayload):AppThunk => (async (dispatch, getState) => {

})

export const loadConfig = (payload:ConfigPayload):AppThunk => (async (dispatch, getState) => {

})

export default configStateSlice.reducer