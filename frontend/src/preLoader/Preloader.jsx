import React from "react";
import styles from "./Preloader.module.css";

const Preloader = () => {
  return (
    <div className={styles.loaderWrapper}>
      {/* Animated Background */}
      <div className={styles.bgAnimation}>
        <div className={styles.bgCircle}></div>
        <div className={styles.bgCircle}></div>
        <div className={styles.bgCircle}></div>
      </div>

      {/* Floating Orbs */}
      <div className={styles.orb}></div>
      <div className={styles.orb}></div>
      <div className={styles.orb}></div>
      <div className={styles.orb}></div>

      {/* Main Loader */}
      <div className={styles.loaderContainer}>
        <h1 className={styles.loaderTitle}>Bike Rental</h1>

        <div className={styles.bikeScene}>
          {/* Speed Lines */}
          <div className={styles.speedLine}></div>
          <div className={styles.speedLine}></div>
          <div className={styles.speedLine}></div>

          {/* Bike */}
          <div className={styles.bike}>
            <div className={`${styles.wheel} ${styles.back}`}>
              <div className={styles.spoke}></div>
              <div className={styles.spoke}></div>
              <div className={styles.spoke}></div>
            </div>
            <div className={`${styles.wheel} ${styles.front}`}>
              <div className={styles.spoke}></div>
              <div className={styles.spoke}></div>
              <div className={styles.spoke}></div>
            </div>

            <div className={`${styles.frame} ${styles.frame1}`}></div>
            <div className={`${styles.frame} ${styles.frame2}`}></div>
            <div className={`${styles.frame} ${styles.frame3}`}></div>
            <div className={`${styles.frame} ${styles.frame4}`}></div>

            <div className={styles.handlebar}></div>
            <div className={styles.seat}></div>
          </div>

          {/* Glowing Road */}
          <div className={styles.road}></div>
        </div>

        <div className={styles.loadingText}>LOADING</div>

        <div className={styles.progressContainer}>
          <div className={styles.progressBar}></div>
        </div>

        <div className={styles.percentage}>Please wait...</div>
      </div>
    </div>
  );
};

export default Preloader;
