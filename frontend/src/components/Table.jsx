import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

const Table = ({ columns, data, sortBy = '', sortOrder = '', onSort = null }) => {
  const handleHeaderClick = (column) => {
    if (!column.sortable || !onSort) return;
    
    let newOrder = 'asc';
    if (sortBy === column.key) {
      newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    onSort(column.key, newOrder);
  };

  const getSortIcon = (column) => {
    if (!column.sortable) return null;
    if (sortBy !== column.key) {
      return <ArrowUpDown size={14} className="sort-icon" style={{ opacity: 0.4 }} />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp size={14} className="sort-icon" style={{ color: 'var(--primary-color)' }} />
      : <ArrowDown size={14} className="sort-icon" style={{ color: 'var(--primary-color)' }} />;
  };

  return (
    <div className="table-container glass-panel" style={{ overflow: 'hidden' }}>
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleHeaderClick(col)}
                style={{ 
                  cursor: col.sortable ? 'pointer' : 'default',
                  padding: '1.1rem 1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>{col.label}</span>
                  {getSortIcon(col)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={row.id || index}>
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: '1rem 1.25rem' }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
