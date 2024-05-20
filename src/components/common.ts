import { DashboardState, dashboard, bitable } from "@lark-base-open/js-sdk";

export const isConfigLayout = () => {
    return dashboard.state === DashboardState.Config || dashboard.state === DashboardState.Create
}

export const themeColors = [
    'rgba(31, 35, 41, 1)', 'rgba(51, 109, 244, 1)', 'rgba(122, 53, 240, 1)',
    'rgba(53, 189, 75, 1)', 'rgba(45, 190, 171, 1)', 'rgba(255, 198, 10, 1)',
    'rgba(255, 129, 26, 1)', 'rgba(245, 74, 69, 1)'
]

export const getLongTextClass = (currentValueText:string, targetValueText:string, percentage:number, firstThreshold=19, secondThreshold=28) => {
  const fullTextLength = currentValueText.length + targetValueText.length + `${percentage}%`.length
    let longTextClass = ''
    if (fullTextLength > secondThreshold) {
        longTextClass = ' longLongText'
    }
    else if (fullTextLength > firstThreshold) {
        longTextClass = ' longText'
    }
    return longTextClass
}

import { useLayoutEffect } from "react";

function updateTheme(theme: string) {
  document.body.setAttribute('theme-mode', theme);
}

/** following dark mode theme */
export function useTheme() {
  useLayoutEffect(() => {
    bitable.bridge.getTheme().then((theme: string) => {
      updateTheme(theme.toLocaleLowerCase())
    })

    bitable.bridge.onThemeChange((e) => {
      updateTheme(e.data.theme.toLocaleLowerCase())
    })
  }, [])
}