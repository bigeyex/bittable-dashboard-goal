import './App.css';
import { DashboardState, bitable, dashboard, ICategory, IConfig, IData, FieldType, ISeries, Rollup } from "@lark-base-open/js-sdk";

export default function App() {

  return (
    <div className='goal-app'>
        hello world!

        {dashboard.state === DashboardState.Config ? (
            'config?'
        ) : null}
    </div>
  );
}