'use client'
import React from 'react'
import styles from './styles.module.css'
import { useRouter } from 'next/navigation'

interface Props {
  text: string
  textColor?: string
  backgroundColor?: string
  backdropFilter?: string
  navigateTo?: string
  callMethod?: () => void
}

const Button = ({ text, textColor, backgroundColor, backdropFilter, navigateTo, callMethod }: Props) => {
  const router = useRouter()

  const handleClick = () => {
    if (callMethod) {
      callMethod()
    } else if (navigateTo) {
      router.push(navigateTo)
    }
  }

  return (
    <div
      className={styles.button}
      style={{ backgroundColor, color: textColor, backdropFilter }}
      onClick={handleClick}
    >
      {text}
    </div>
  )
}

export default Button
