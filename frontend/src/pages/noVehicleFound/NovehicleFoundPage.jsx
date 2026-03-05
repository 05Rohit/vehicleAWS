import React from "react";
import {
  Car,
  Plus,
} from "lucide-react";
import styles from "./noVehiclePage.module.css";

export default function NovehicleFoundPage() {
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className={styles.page}>
      {/* Main */}
      <main className={styles.main}>
        <div className={styles.emptyState}>
          <div className={styles.carCircle}>
            <Car size={64} />
          </div>

          <h2>No Vehicles Found</h2>
          <p>
            {/* {searchQuery
              ? "No vehicles match your search."
              : "Start by adding your first vehicle."} */}
              No vehicles match your search
          </p>

          <button className={styles.addBtn}>
            <Plus /> Add Your First Vehicle
          </button>

          {/* <div className={styles.features}>
            <div className={styles.featureCard}>
              <MapPin />
              <h4>GPS Tracking</h4>
              <span>Real-time location</span>
            </div>

            <div className={styles.featureCard}>
              <Settings />
              <h4>Easy Management</h4>
              <span>Simple controls</span>
            </div>
          </div> */}
        </div>
      </main>
    </div>
  );
}
