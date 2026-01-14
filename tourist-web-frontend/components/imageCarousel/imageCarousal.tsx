
import React from 'react'
import styles from './style.module.css'

const ImageCarousal = () => {
  return (
    <div className={styles.imageCarousal}>
        
        <div className={styles.imageContainer}>
            
        </div>
        <ul className={styles.carousalDots}>
            <li className={`${styles.carousalDot} ${styles["carousalDot--active"]}`}></li>
            <li className={`${styles.carousalDot}`}></li>
            <li className={`${styles.carousalDot}`}></li>
            <li className={`${styles.carousalDot}`}></li>
        </ul>
    </div>
  )
}

export default ImageCarousal