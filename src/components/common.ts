import { DashboardState, dashboard } from "@lark-base-open/js-sdk";

export const isConfigLayout = () => {
    return dashboard.state === DashboardState.Config || dashboard.state === DashboardState.Create
}