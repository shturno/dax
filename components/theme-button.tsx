'use client'

import { changeThemeColor } from "@/lib/theme-utils"

export function ThemeButton() {
  return (
    <button onClick={() => changeThemeColor('primary-green')}>Verde</button>
  )
}
