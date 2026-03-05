import React, { useMemo, useState } from "react";
import { List } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";
import {
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import styles from "./VehicleTable.module.css";

const ROW_HEIGHT = 48;
const GROUP_HEIGHT = 44;

const VehicleTable = ({ vehicles = [] }) => {
  /* ✅ HOOKS ALWAYS FIRST */
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const rows = useMemo(() => {
    const result = [];

    vehicles.forEach((group) => {
      if (!group?._id) return;

      result.push({ type: "group", group });

      if (expandedGroups[group._id]) {
        (group.specificVehicleDetails || []).forEach((v) => {
          result.push({
            type: "vehicle",
            vehicle: v,
            group,
          });
        });
      }
    });

    return result;
  }, [vehicles, expandedGroups]);

  const getItemSize = (index) =>
    rows[index]?.type === "group" ? GROUP_HEIGHT : ROW_HEIGHT;

  const Row = ({ index, style }) => {
    const row = rows[index];
    if (!row) return null;

    if (row.type === "group") {
      const { group } = row;
      const isOpen = expandedGroups[group._id];

      return (
        <div style={style} className={styles.groupRow}>
          <div
            className={styles.groupHeader}
            onClick={() => toggleGroup(group._id)}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span>
              {group.vehicleType} • {group.model}
            </span>
          </div>
        </div>
      );
    }

    const { vehicle, group } = row;

    return (
      <div style={style} className={styles.tableRow}>
        <div className={styles.colVehicle}>{vehicle.vehicleNumber}</div>

        <div className={styles.colStatus}>
          {vehicle.vehicleStatus ? (
            <span className={styles.available}>
              <CheckCircle size={14} /> Available
            </span>
          ) : (
            <span className={styles.unavailable}>
              <XCircle size={14} /> Unavailable
            </span>
          )}
        </div>

        <div className={styles.colCreated}>
          {new Date(vehicle.createdAt || group.createdAt).toDateString()}
        </div>

        <div className={styles.colActions}>
          <Eye size={16} />
          <Edit size={16} />
          <Trash2 size={16} />
        </div>
      </div>
    );
  };

  /* ✅ CONDITIONAL RENDER AFTER HOOKS */
  if (!vehicles.length) {
    return <div className={styles.empty}>No vehicles found</div>;
  }

  return (
    <div className={styles.card}>
      <div className={styles.tableHeader}>
        <div>Vehicle</div>
        <div>Status</div>
        <div>Created</div>
        <div>Actions</div>
      </div>

      <div style={{ height: 500 }}>
        <AutoSizer>
          {({ width, height }) => (
            <List
              height={height}
              itemCount={rows.length}
              itemSize={getItemSize}
              width={width}
            >
              {Row}
            </List>
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

export default VehicleTable;
