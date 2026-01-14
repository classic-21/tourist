import React from "react";
import styles from "./styles.module.css";

const MobileOnly = () => {
  return (
    <div>
      {/* Content for mobile users */}
      <div className={styles["mobile-view"]}>
        <h1>Welcome to the Mobile-Only Website</h1>
        <p>This site is optimized for mobile devices.</p>
      </div>

      {/* Message for desktop users */}
      <div className={styles["desktop-view"]}>
        <h1>Mobile Access Only</h1>
        <p>Please access this site using a mobile device.</p>
      </div>
    </div>
  );
};

export default MobileOnly;
