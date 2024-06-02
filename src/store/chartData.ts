import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk } from './hook'
import { dashboard, IData } from '@lark-base-open/js-sdk'

export interface ChartDataState {
    currentValue: number
    targetValue: number
}

const initialState:ChartDataState = {
    currentValue: 0,
    targetValue: 100
}

export const chartDataSlice = createSlice({
    name: 'chartData',
    initialState,
    reducers: {
      setCurrentValue: (state, action:PayloadAction<number>) => {
        state.currentValue = action.payload
      },
      setTargetValue: (state, action:PayloadAction<number>) => {
        state.targetValue = action.payload
      },
    }
})

export const { setCurrentValue, setTargetValue } = chartDataSlice.actions

export default chartDataSlice.reducer