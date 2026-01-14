import React from 'react';
import styles from './styles.module.css';

const HomeSkeleton = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.skeletonHeader}></div>
      <div className={styles.skeletonButtons}>
        <div className={styles.skeletonButton}></div>
        <div className={styles.skeletonButton}></div>
      </div>
    </div>
  );
};

export default HomeSkeleton;