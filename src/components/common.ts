import { DashboardState, dashboard, bitable } from "@lark-base-open/js-sdk";

export let isDarkMode = false;

export const isConfigLayout = () => {
    return dashboard.state === DashboardState.Config || dashboard.state === DashboardState.Create
}

export const themeColors = [
    'rgba(31, 35, 41, 1)', 'rgba(51, 109, 244, 1)', 'rgba(122, 53, 240, 1)',
    'rgba(53, 189, 75, 1)', 'rgba(45, 190, 171, 1)', 'rgba(255, 198, 10, 1)',
    'rgba(255, 129, 26, 1)', 'rgba(245, 74, 69, 1)'
]

export const darkModeThemeColor = (color: string) => {
  const lookup:{[key:string]: string} = {
    'rgba(31, 35, 41, 1)': '#EBEBEB',
    'rgba(51, 109, 244, 1)': 'rgba(76, 136, 255, 1)',
    'rgba(122, 53, 240, 1)': 'rgba(184, 143, 254, 1)',
    'rgba(53, 189, 75, 1)': 'rgba(81, 186, 67, 1)',
    'rgba(45, 190, 171, 1)': 'rgba(23, 207, 181, 1)',
    'rgba(255, 198, 10, 1)': 'rgba(251, 203, 70, 1)',
    'rgba(255, 129, 26, 1)': 'rgba(248, 158, 68, 1)',
    'rgba(245, 74, 69, 1)': 'rgba(240, 91, 86, 1)',
  }
  if (!isDarkMode) return color
  if (color in lookup) {
    return lookup[color]
  }
  else {
    return color
  }
}

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
      isDarkMode = theme.toLocaleLowerCase() === 'dark'
    })

    bitable.bridge.onThemeChange((e) => {
      updateTheme(e.data.theme.toLocaleLowerCase())
      isDarkMode = e.data.theme.toLocaleLowerCase() === 'dark'
    })
  }, [])
}

export function onDrakModeChange(callback:() => void) {
  useLayoutEffect(() => {
    bitable.bridge.onThemeChange((e) => {
      callback()
    })
  }, [])
}