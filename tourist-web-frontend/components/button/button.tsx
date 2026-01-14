'use client'
import React from 'react'
import styles from './styles.module.css'
import { useRouter } from 'next/navigation'

interface Props{
    text:string,
    textColor?:string,
    backgroundColor?:string,
    backdropFilter?:string,
    navigateTo?: string,
    callMethod?:()=>void
}

const Button = ({text,textColor,backgroundColor,backdropFilter,navigateTo}:Props) => {
    
    const router = useRouter()

    return (

    <div className={`${styles.button}`}
    style={{backgroundColor,color:`${textColor}`,backdropFilter}}
    onClick={()=> navigateTo && router.push(navigateTo)}
    >
        {text}
    
    </div>
  )
}

export default Button