import React from 'react'
import styles from './styles.module.css';

function LoadingIndicator() {
  return (
    <div className={styles.loadingContainer}>

    <div id={styles.loading}>
    </div>
    </div>
  )
}

export default LoadingIndicator