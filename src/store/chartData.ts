import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppThunk } from './hook'
import { dashboard, IData } from '@lark-base-open/js-sdk'

export interface ChartDataState {
    currentValue: number
}

const initialState:ChartDataState = {
    currentValue: 0
}

export const chartDataSlice = createSlice({
    name: 'chartData',
    initialState,
    reducers: {
      setCurrentValueFromIData: (state, action:PayloadAction<IData>) => {
        // payload example: [[{value: "Bitable_Dashboard_Count", text: "Bitable_Dashboard_Count"}]
        // [{value: 10, text: "10"}]]
        if (action.payload.length >= 2 ) {
          state.currentValue = action.payload[1][0].value as number
        }
      },
    }
})

export const { setCurrentValueFromIData } = chartDataSlice.actions

export const loadChartData = ():AppThunk => (async (dispatch, getState) => {
    const dashboardData = await dashboard.getData() 
    dispatch(setCurrentValueFromIData(dashboardData))
})


export default chartDataSlice.reducer