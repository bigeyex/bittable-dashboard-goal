import './App.css';
import { DashboardState, bitable, dashboard } from "@lark-base-open/js-sdk";
import GoalConfig from './components/GoalConfig';

export default function App() {
  console.log('dashboard state', dashboard.state, DashboardState.Config)
  return (
    <div className='goal-app'>
        <div className='goal-chart'>
        hello world!
        </div>
        {dashboard.state === DashboardState.Config || DashboardState.Create ? (
          <div className='config-panel'>
            <GoalConfig/>
          </div>
            
        ) : null}
    </div>
  );
}