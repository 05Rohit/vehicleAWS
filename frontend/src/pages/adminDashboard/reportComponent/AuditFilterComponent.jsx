import React, { useState, useMemo, useCallback, useEffect } from "react";
import Style from "../AuditPage.module.css"

const INITIAL_FILTERS = {
  action: "",
  entity: "",
  user: "",
  userType: "",
  fromDate: "",
  toDate: "",
};

const LABEL_MAP = {
  action: "Action",
  entity: "Entity",
  user: "User",
  userType: "User Type",
  fromDate: "From",
  toDate: "To",
};

const AuditFilterComponent = ({ auditData = [], onFilter }) => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);

  // Controlled input handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Filter logic (memoized)
  // const filteredData = useMemo(() => {
  //   return auditData.filter((item) => {
  //     if (filters.action && item.action !== filters.action) return false;
  //     if (filters.entity && item.entity !== filters.entity) return false;
  //     if (
  //       filters.user &&
  //       !item.user.toLowerCase().includes(filters.user.toLowerCase())
  //     )
  //       return false;
  //     if (filters.userType && item.userType !== filters.userType) return false;
  //     if (
  //       filters.fromDate &&
  //       new Date(item.timestamp) < new Date(filters.fromDate)
  //     )
  //       return false;
  //     if (
  //       filters.toDate &&
  //       new Date(item.timestamp) > new Date(filters.toDate + "T23:59:59")
  //     )
  //       return false;

  //     return true;
  //   });
  // }, [filters, auditData]);

  

  const filteredData = useMemo(() => {
  return auditData.filter((item) => {
    if (filters.action && item.action !== filters.action) return false;

    if (
      filters.entity &&
      item.entityType !== filters.entity
    )
      return false;

    if (
      filters.user &&
      !item.performedBy?.email
        ?.toLowerCase()
        .includes(filters.user.toLowerCase())
    )
      return false;

    if (
      filters.userType &&
      item.performedBy?.userType !== filters.userType
    )
      return false;

    if (
      filters.fromDate &&
      new Date(item.createdAt) < new Date(filters.fromDate)
    )
      return false;

    if (
      filters.toDate &&
      new Date(item.createdAt) >
        new Date(filters.toDate + "T23:59:59")
    )
      return false;

    return true;
  });
}, [filters, auditData]);


  // Apply filters (explicit action)
  const applyFilters = useCallback(() => {
    onFilter(filteredData);
  }, [filteredData, onFilter]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    onFilter(auditData);
  }, [auditData, onFilter]);

  // Remove single filter chip
  const removeFilter = useCallback((key) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
  }, []);

  // Auto-apply when filters change (optional but correct UX)
  useEffect(() => {
    onFilter(filteredData);
  }, [filteredData, onFilter]);

  const activeFilters = useMemo(
    () => Object.entries(filters).filter(([, value]) => value),
    [filters],
  );

  return (
    <div className={`${Style.filter_panel} ${Style.active}`}>
      <div className={Style.filter_header}>
        <h3>🔍 Advanced Filters</h3>
        <span style={{ fontSize: "0.875rem" }}>
          {activeFilters.length} Active
        </span>
      </div>

      <div className={Style.filter_content}>
        <div className={Style.filter_grid}>
          <select
            className={Style.filter_select}
            name="action"
            value={filters.action}
            onChange={handleChange}
          >
            <option value="">All Actions</option>
            <option value="ADD_VEHICLE">Add Vehicle</option>
            <option value="UPDATE_VEHICLE">Update Vehicle</option>
            <option value="DELETE_VEHICLE">Delete Vehicle</option>
          </select>

          <select
            className={Style.filter_select}
            name="entity"
            value={filters.entity}
            onChange={handleChange}
          >
            <option value="">All Entities</option>
            <option value="VEHICLE">Vehicle</option>
            <option value="VEHICLE_GROUP">Vehicle Group</option>
          </select>

          <input
            className={Style.filter_input}
            name="user"
            value={filters.user}
            onChange={handleChange}
            placeholder="Enter email"
          />

          <select
            className={Style.filter_select}
            name="userType"
            value={filters.userType}
            onChange={handleChange}
          >
            <option value="">All Types</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          <input
            type="date"
            className={Style.filter_input}
            name="fromDate"
            value={filters.fromDate}
            onChange={handleChange}
          />

          <input
            type="date"
            className={Style.filter_input}
            name="toDate"
            value={filters.toDate}
            onChange={handleChange}
          />
        </div>

        {activeFilters.length > 0 && (
          <div className={Style.active_filters}>
            {activeFilters.map(([key, value]) => (
              <div className={Style.filter_chip} key={key}>
                <strong>{LABEL_MAP[key]}:</strong> {value}
                <button onClick={() => removeFilter(key)}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div className={Style.filter_actions}>
          <button className={Style.btn_apply} onClick={applyFilters}>
            ✓ Apply Filters
          </button>
          <button className={Style.btn_clear} onClick={clearFilters}>
            ✕ Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditFilterComponent;
