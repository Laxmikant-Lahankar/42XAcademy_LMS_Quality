import { useState } from "react";

import Icon from "../Icon/Icon";
import "./DataTable.css";

// Responsive admin table with optional sorting and pagination.
// Laptop/tablet: a normal table. Phones (≤ 640px): each row becomes a stacked card with labels.
//
// columns: [{ key, header, render?: (row) => node, align?: "right",
//             sortValue?: (row) => string | number   ← makes the column sortable }]
// pageSize: rows per page (default 10). Pagination appears only when needed.
function DataTable({ columns, rows, caption, emptyState, pageSize = 10 }) {
  const [sort, setSort] = useState({ key: null, direction: "asc" });
  const [page, setPage] = useState(1);

  if (rows.length === 0) {
    return emptyState ?? null;
  }

  const sortColumn = columns.find((column) => column.key === sort.key && column.sortValue);
  const sortedRows = sortColumn
    ? [...rows].sort((a, b) => {
        const left = sortColumn.sortValue(a);
        const right = sortColumn.sortValue(b);
        const result =
          typeof left === "number" && typeof right === "number"
            ? left - right
            : String(left ?? "").localeCompare(String(right ?? ""), undefined, { numeric: true, sensitivity: "base" });
        return sort.direction === "asc" ? result : -result;
      })
    : rows;

  // Filters elsewhere can shrink the list, so keep the page within range.
  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const pageRows = sortedRows.slice(start, start + pageSize);

  function toggleSort(key) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
    setPage(1);
  }

  return (
    <div className="data-table-block">
      <div className="data-table-wrap">
        <table className="data-table">
          {caption && <caption className="visually-hidden">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((column) => {
                const isSorted = sort.key === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={column.align === "right" ? "is-right" : ""}
                    aria-sort={isSorted ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
                  >
                    {column.sortValue ? (
                      <button type="button" className="data-table-sort" onClick={() => toggleSort(column.key)}>
                        {column.header}
                        <Icon
                          name="chevron-down"
                          size={14}
                          className={`data-table-sort-icon ${isSorted ? "is-active" : ""} ${isSorted && sort.direction === "asc" ? "is-asc" : ""}`}
                        />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    data-label={column.header}
                    className={column.align === "right" ? "is-right" : ""}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <nav className="data-table-pager" aria-label={`${caption ?? "Table"} pages`}>
          <span className="data-table-pager-info">
            Showing {start + 1}–{start + pageRows.length} of {sortedRows.length}
          </span>
          <span className="data-table-pager-buttons">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <Icon name="chevron-left" size={15} /> Previous
            </button>
            <span className="data-table-pager-page">
              Page {currentPage} of {pageCount}
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              Next <Icon name="chevron-right" size={15} />
            </button>
          </span>
        </nav>
      )}
    </div>
  );
}

export default DataTable;
