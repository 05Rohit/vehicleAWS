import React from "react";
import MilestonePageStyle from "../../Css/homePageBanner.module.css"
const OurKeyStoneComponent = () => {
  return (
    <>
      <section className={MilestonePageStyle.mileStone_MainContainer} id="milestone">
        <div className={MilestonePageStyle.milestoneContainer}>
          <h2>Our key milestones</h2>
          <ul className={MilestonePageStyle.mileStone_contentBox}>
            <li className={MilestonePageStyle.mileStone_innerBoxes}>
              <p>
                <strong className={MilestonePageStyle.CountContent}>20</strong>Million+
              </p>
              <p>Kms and running</p>
            </li>
            <li className={MilestonePageStyle.mileStone_innerBoxes}>
              <p>
                <strong className={MilestonePageStyle.CountContent} >100</strong>Thousand+
              </p>
              <p>Customers served</p>
            </li>

            <li className={MilestonePageStyle.mileStone_innerBoxes}>
              <p>
                <strong className={MilestonePageStyle.CountContent}>4.5</strong>+
              </p>
              <p>Google rating</p>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
};

export default OurKeyStoneComponent;
