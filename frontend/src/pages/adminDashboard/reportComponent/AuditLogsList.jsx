import React, { useEffect, useState } from "react";
import styles from "../AuditPage.module.css";
import api from "../../../axiosInterceptors/AxiosSetup";
import { formatDate } from "../../../utils/formatDate";
import AuditFilterComponent from "./AuditFilterComponent";

const AuditLogsList = () => {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const onClose = () => {
    setOpen(false);
    setSelectedLog(null);
  };

  // ⭐ PAGINATION STATE
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  /* ================= FETCH LIST ================= */
  const handleGetAuditLogs = async (pageNumber = 1) => {
    try {
      const response = await api.get(
        `/getAuditLogs?page=${pageNumber}&limit=${limit}`,
        { withCredentials: true },
      );

      setData(response.data.data);
      setTotalPages(response.data.pagination.totalPages); // ⭐
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    }
  };

  // ⭐ REFETCH WHEN PAGE CHANGES
  useEffect(() => {
    handleGetAuditLogs(page);
  }, [page]);

  /* ================= FETCH SINGLE LOG ================= */
  const openDetails = async (id) => {
    try {
      const res = await api.get(`/auditlogsByID/${id}`, {
        withCredentials: true,
      });
      setSelectedLog(res.data.data);
      setOpen(true);
    } catch (error) {
      console.error("Error fetching audit selectedLog details:", error);
    }
  };
  const badgeClass = (action) => {
    if (action.includes("ADD")) return styles.badgeAdd;
    if (action.includes("UPDATE")) return styles.badgeUpdate;
    if (action.includes("DELETE")) return styles.badgeDelete;
    return "";
  };

  /* ---------------- FILTER + SEARCH ---------------- */
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filteredData, setFilteredData] = useState([]);
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const displayData = isFilterApplied ? filteredData : data;

  return (
    <>
      <div style={{ padding: "20px" }}>
        {/* ================= TABLE ================= */}
        <div className={styles.dashboardHeader}>
          <div className={styles.headerTitle}>
            <div className={styles.headerIcon}>📊</div>
            <div>
              <h4>Audit Log Dashboard</h4>
              <p>Track all system activities and changes</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.secondaryBtn}
              onClick={() => setFiltersOpen((p) => !p)}
            >
              ⚙️ Filters
            </button>
            {/* <button className={styles.primaryBtn}>📥 Export</button> */}
          </div>
        </div>
        {filtersOpen && (
          // <AuditFilterComponent auditData={data} onFilter={setFilteredData} />
          <AuditFilterComponent
            auditData={data}
            onFilter={(result) => {
              setFilteredData(result);
              setIsFilterApplied(true);
            }}
            onClear={() => {
              setFilteredData([]);
              setIsFilterApplied(false);
            }}
          />
        )}

        {/* ================= TABLE ================= */}
        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2>📋 Audit Trail</h2>
            {/* <input
                    className={styles.search}
                    placeholder="Search audit logs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  /> */}
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>Performed By</th>
                <th>User Type</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((log) => (
                <tr key={log.id} onClick={() => openDetails(log._id)}>
                  <td>
                    <span
                      className={`${styles.badge} ${badgeClass(log.action)}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td>{log.entityType}</td>
                  <td className={styles.entityId}>{log.entityId}</td>
                  <td>{log?.performedBy?.email}</td>
                  <td>
                    <span className={styles.userBadge}>
                      {log.performedBy?.userType}
                    </span>
                  </td>
                  <td className={styles.time}> {formatDate(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.paginationInfo}>
              Page {page} of {totalPages}
            </div>
            <div className={styles.paginationControls}>
              <button
                className={styles.paginationBtn}
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Prev
              </button>

              {/* Show page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`${styles.paginationBtn} ${page === pageNum ? styles.active : ""}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className={styles.paginationBtn}
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* ================= DETAILS MODAL ================= */}

        {open && selectedLog && (
          <div className={styles.overlay}>
            <div className={styles.container}>
              {/* Header */}
              <div className={styles.header}>
                <h1>
                  <span className={styles.headerIcon}>📋</span>
                  Audit Details
                </h1>
                <button className={styles.closeBtn} onClick={onClose}>
                  ✕
                </button>
              </div>

              <div className={styles.content}>
                {/* Primary Info */}
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>
                    🎯 Primary Information
                  </h3>

                  <div className={styles.infoGrid}>
                    <InfoCard label="Action">
                      <span className={`${styles.badge} ${styles.badgeAction}`}>
                        {selectedLog.action}
                      </span>
                    </InfoCard>

                    <InfoCard label="Entity Type">
                      <span className={`${styles.badge} ${styles.badgeEntity}`}>
                        {selectedLog.entityType}
                      </span>
                    </InfoCard>

                    <InfoCard label="Entity ID" full>
                      {selectedLog.entityId}
                    </InfoCard>
                  </div>
                </section>

                <Divider />

                {/* User Info */}
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>👤 User Information</h3>

                  <div className={styles.infoGrid}>
                    <InfoCard label="Performed By">
                      {selectedLog.performedBy?.email}
                    </InfoCard>

                    <InfoCard label="User Type">
                      <span className={`${styles.badge} ${styles.badgeAdmin}`}>
                        {selectedLog.performedBy?.userType}
                      </span>
                    </InfoCard>

                    <InfoCard label="IP Address">
                      {selectedLog.ipAddress || "N/A"}
                    </InfoCard>
                  </div>

                  <div className={styles.metaInfo}>
                    <MetaItem
                      icon="💻"
                      text={selectedLog.userAgent || "Unknown device"}
                    />
                  </div>
                </section>

                <Divider />

                {/* Old / New Values */}
                <section className={styles.section}>
                  <h3 className={styles.sectionTitle}>🔄 Changes Made</h3>

                  <div className={styles.compareGrid}>
                    <CodeBlock title="Old Value" data={selectedLog.oldValue} />
                    <CodeBlock title="New Value" data={selectedLog.newValue} />
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AuditLogsList;

/* ================= Small Components ================= */

const InfoCard = ({ label, children, full }) => (
  <div className={`${styles.infoCard} ${full ? styles.fullWidth : ""}`}>
    <div className={styles.infoLabel}>{label}</div>
    <div className={styles.infoValue}>{children}</div>
  </div>
);

const Divider = () => <div className={styles.divider} />;

const MetaItem = ({ icon, text }) => (
  <div className={styles.metaItem}>
    <span>{icon}</span>
    <span>{text}</span>
  </div>
);

const CodeBlock = ({ title, data }) => {
  const copy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span>{title}</span>
        <button onClick={copy}>Copy</button>
      </div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};
