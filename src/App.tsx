import './App.scss';
import { DashboardState, bitable, dashboard } from "@lark-base-open/js-sdk";
import GoalConfig from './components/GoalConfig';
import Chart from './components/Chart';
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hook';
import { ConfigPayload, loadConfig, updatePreviewData } from './store/config';
import { useTheme } from './components/common';
import { T } from './locales/i18n';

function isMobileLark() {
  const ua = window.navigator.userAgent;
  const isLark = /feishu/i.test(ua) || /lark/i.test(ua);
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(ua)
  return isLark && isMobile;
}

export default function App() {
  const dispatch = useAppDispatch()
  const config = useAppSelector(store => store.config.config)
  useTheme()

  const fetchInitData = useCallback(async() => {
    const configState = await dispatch<Promise<ConfigPayload>>(loadConfig())
    dispatch(updatePreviewData(configState))
  }, [])

  useEffect(() => {
    if (dashboard.state === DashboardState.View || dashboard.state === DashboardState.FullScreen) {
      fetchInitData()

      dashboard.onConfigChange(async (e) => {
        const configState = await dispatch<Promise<ConfigPayload>>(loadConfig())
        dispatch(updatePreviewData(configState))
      })

      setTimeout(() => {
        // 预留3s给浏览器进行渲染，3s后告知服务端可以进行截图了
        dashboard.setRendered();
    }, 2000);
    }  
    dashboard.onDataChange(async(e) => {
      const configState = await dispatch<Promise<ConfigPayload>>(loadConfig())
      dispatch(updatePreviewData(configState))
    })
  }, [])

  if (isMobileLark()) {
    return (
      <div className="goal-app">
        <div className="goal-chart">
          <div style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            <img width="120" height="120" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTE1LjkyNyA3MS43NzZjMC0uMzg5LS4wODctLjc4NS0uMjYzLTEuMTg1LS42NjMtMi4wOTItOC42MDUtNS41ODUtMTQuMTkxLTcuMjIzLjg4Ni4yNjctMS4wNDMtLjMwNSAwIDBsLTkuNDcyLTIuODYzdjkuMDg2Yy0uNzQtLjIwNi42NTUuMjA0IDAgMCA0Ljc5NiAxLjMzNyAxNi42NTQgNS41NTkgMTkuOTI3IDcuNjU1Ljk3Ny42MjYgMS43ODkgMS4yNSAyLjQwNyAxLjg1Ni42MjcuNjEyIDEuMDc1LTMuMjQyIDEuMzMyLTIuNjU1LjE3My40LjI2Mi43OTYuMjYyIDEuMTg0di01Ljg1NU00Ljc5IDIzLjYyNUMxMiAzNS45OTkgMzEuNTg1IDQwLjgzMiAzNS4zOTcgNDIuMTA4djkuNTUyQzMwLjM3NCA1MC4wNDYgNC43ODkgNDAuNTk0IDQuNzg5IDMzLjMzM3YtOS43MDh6IiBmaWxsPSIjMEMyOTZFIi8+PHBhdGggZD0iTTkzLjgwNyA0OC45NDFBMzUgMzUgMCAxMTY1LjA2NiAyMy4zN0w2MCA1OGwzMy44MDctOS4wNTl6IiBmaWxsPSIjRkZDNjBBIi8+PHBhdGggZD0iTTIzLjY1MyA4MC43NWMtLjc0Mi0uOTctMi4yNTYtMS4wMDYtMi45NzItLjA2OUw4LjMzMiA5Ni44MjhjLS44NjMgMS4xMy4wNiAyLjc0NyAxLjU2OSAyLjc0Nmw1LjM0OC0uMDAxdjcuODAxYTEuMTggMS4xOCAwIDAwMS4xODEgMS4xODFoMTEuNTA2Yy42NTIgMCAxLjE4MS0uNTI5IDEuMTgxLTEuMTgxdi03LjgwNWw1LjQ2Ni0uMDAyYzEuNDY3IDAgMi4yNzQtMS41NCAxLjQwNS0yLjY3N0wyMy42NTMgODAuNzV6IiBmaWxsPSIjMzM3MEZGIi8+PHBhdGggZD0iTTY1LjUwMyA1MS45NDhhLjUuNSAwIDAxLS4xNjItLjQ1bDQuOTkyLTMxLjk3NWEuNS41IDAgMDEuNTkxLS40MTMgMzUuODY3IDM1Ljg2NyAwIDAxMTYuNjYzIDguMTggMzUuMjg0IDM1LjI4NCAwIDAxMTAuMjM2IDE1LjM2NC41LjUgMCAwMS0uMzQuNjRMNjUuOTcgNTIuMDU3YS41LjUgMCAwMS0uNDY2LS4xMDl6bTMxLjIwMS05LjQ3NWEzNC4yOSAzNC4yOSAwIDAwLTkuNzc2LTE0LjQzIDM0Ljg1OCAzNC44NTggMCAwMC0xNS42ODgtNy44NDdsLTQuNzkxIDMwLjY5IDMwLjI1NS04LjQxM3oiIGZpbGw9IiMwQzI5NkUiLz48cGF0aCBkPSJNNTcuNDE1IDExMS4xNjV2LTkuMDg4YzE0LjU0Mi0uNTMyIDM2LjgwOS0zLjI4MyA0OC4xMzMtNy45MzN2OS40NTNjLTExLjA5IDQuMzg5LTMyLjg2NyA3LjE1Ni00OC4xMzMgNy41Njh6IiBmaWxsPSIjMzM3MEZGIi8+PHBhdGggZD0iTTQuNzkzIDMzLjQwNWMtLjAwNC4wNzUtLjAwNS4xNS0uMDA1LjIyNnYtOS44ODljMC02LjI4IDEwLjkyNi0xMC42MzcgMTguMjgzLTEzLjU3bC40My0uMTcyQzMwLjg1MiA3LjA2NSA0MyA0LjUgNTIgNHY5Yy0xMC41IDEtMjEgMy40Ni0yNy4zNTQgNS43NDQtNi4zNTMgMi4yODQtMTkuNTY2IDcuOTE0LTE5Ljg1NCAxNC42NnptNTYuNzEyIDUyLjQ1MmMxOS44NjItLjczOCA1NC4zNjItNS43NDcgNTQuNDI0LTE0LjE3MnY5Ljc5NmMwIDcuNzQtMzMuNDc1IDEyLjg5LTU0LjQyNCAxMy40NjV2LTkuMDg5eiIgZmlsbD0iIzAwRDZCOSIvPjwvc3ZnPg=="></img>
            <div style={{marginTop: 3}}>{T('unsupport')}</div>
          </div>
        </div>
      </div>
    )
  }

  
  return (
    <div className='goal-app'>
        <div className='goal-chart'>
          <Chart/>
        </div>
        {dashboard.state === DashboardState.Config || dashboard.state === DashboardState.Create ? (
          <div className='config-panel'>
            <GoalConfig/>
          </div>
            
        ) : null}
    </div>
  );
}