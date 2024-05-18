import { DashboardState, dashboard } from "@lark-base-open/js-sdk";

export const isConfigLayout = () => {
    return dashboard.state === DashboardState.Config || dashboard.state === DashboardState.Create
}

export const themeColors = [
    'rgba(31, 35, 41, 1)', 'rgba(51, 109, 244, 1)', 'rgba(122, 53, 240, 1)',
    'rgba(53, 189, 75, 1)', 'rgba(45, 190, 171, 1)', 'rgba(255, 198, 10, 1)',
    'rgba(255, 129, 26, 1)', 'rgba(245, 74, 69, 1)'
]