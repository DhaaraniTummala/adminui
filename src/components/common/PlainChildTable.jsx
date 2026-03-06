import React, { useMemo } from 'react';

/**
 * PlainChildTable
 * Simple, read-only HTML table rendering matching AssetDetails.jsx (980-1045) style.
 * Expects columns [{ title, dataIndex }] and data array of objects.
 * Uses a scrollable container; no external table libraries.
 */
const PlainChildTable = ({
  columns = [],
  data = [],
  isFetching = false,
  combos = {},
  config,
  selectRow,
  showDeleteButton = true,
  showEditButton = true,
  drawerMode = false,
}) => {
  // Filter out ModifiedBy, ModifiedDate, and Action columns
  const filteredColumns = useMemo(() => {
    const filtered = (columns || []).filter(
      (col) =>
        col.dataIndex.toLowerCase() !== 'modifiedby' &&
        col.dataIndex.toLowerCase() !== 'modifieddate' &&
        col.dataIndex.toLowerCase() !== 'action',
    );
    
    // Adjust column widths for better layout
    return filtered.map((col) => {
      const key = (col.dataIndex || '').toLowerCase();
      
      // Set specific widths for different columns
      if (key === 'description') {
        return { ...col, width: 300 }; // Wider for description
      } else if (key === 'itemno') {
        return { ...col, width: 100 };
      } else if (key === 'jobdrawingnumber') {
        return { ...col, width: 150 };
      } else if (key === 'requireddate') {
        return { ...col, width: 130 };
      } else if (key === 'instock' || key === 'requiredqty' || key === 'yettoorder' || key === 'yettoreceive' || key === 'issueqty') {
        return { ...col, width: 100 }; // Smaller for numeric columns
      } else if (key === 'uomname') {
        return { ...col, width: 100 };
      }
      
      return { ...col, width: col.width || 120 }; // Default smaller width
    });
  }, [columns]);

  // Check if grid is editable (not readOnly)
  const isEditable = !config?.readOnly && !config?.isReadOnly;

  const totalMinWidth = useMemo(() => {
    const columnsWidth = (filteredColumns || []).reduce((sum, col) => sum + (col.width || 160), 0);
    return columnsWidth + 60; // Add 60px for Sr No column
  }, [filteredColumns]);

  const findUserName = (userId) => {
    if (!userId) return '';
    let listsToSearch = [];
    const direct = combos?.['User'] || combos?.['user'];
    if (Array.isArray(direct)) listsToSearch.push(direct);

    if (config && Array.isArray(config.comboTypes)) {
      for (const ct of config.comboTypes) {
        if (ct && ct.type && combos[ct.type]) {
          listsToSearch.push(combos[ct.type]);
        }
      }
    }

    if (listsToSearch.length === 0 && combos && typeof combos === 'object') {
      for (const key in combos) {
        if (Array.isArray(combos[key])) listsToSearch.push(combos[key]);
      }
    }

    for (const list of listsToSearch) {
      const match = list.find(
        (u) =>
          u.UserId === userId || u.Id === userId || u.value === userId || u.LookupId === userId,
      );
      if (match)
        return match.Name || match.DisplayValue || match.label || match.Value || String(userId);
    }
    return String(userId);
  };

  const formatDateTime = (value) => {
    if (!value) return '';
    try {
      let src = value;
      if (typeof src === 'string') {
        const isoNoZone = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?)$/;
        const hasZone = /[zZ]|[\+\-]\d{2}:?\d{2}$/;
        if (isoNoZone.test(src) && !hasZone.test(src)) {
          src = src + 'Z';
        }
      }
      const d = new Date(src);
      if (isNaN(d.getTime())) return String(value);
      const day = d.getDate().toString().padStart(2, '0');
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const mon = monthNames[d.getMonth()];
      const year = d.getFullYear();
      const time = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      return `${day}/${mon}/${year} ${time}`;
    } catch (e) {
      return String(value);
    }
  };

  return (
    <div
      style={{
        maxHeight: '500px',
        overflowY: 'auto',
        overflowX: 'scroll',
        border: '1px solid #E5E7EB',
        borderRadius: '6px',
        position: 'relative',
        scrollbarWidth: 'thin',
      }}
    >
      <table
        className="w-full text-[13px] text-[#444]"
        style={{ width: '100%', minWidth: totalMinWidth }}
      >
        <thead
          className={drawerMode ? 'bg-[#F3F4F6] border-b border-[#D1D5DB]' : 'bg-[#F9FAFB] border-b border-[#E5E7EB]'}
          style={{ position: 'sticky', top: 0, zIndex: 1 }}
        >
          <tr>
            {/* Sr No Column */}
            <th
              className={`py-3 px-4 text-left font-medium text-[11px] ${drawerMode ? 'text-[#374151]' : 'text-[#6B7280]'}`}
              style={{
                fontWeight: 600,
                whiteSpace: 'nowrap',
                width: 60,
                minWidth: 60,
              }}
            >
              Sr No
            </th>
            {filteredColumns.map((col) => (
              <th
                key={col.dataIndex}
                className={`py-3 px-4 text-left font-medium text-[11px] ${drawerMode ? 'text-[#374151]' : 'text-[#6B7280]'}`}
                style={{
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  width: col.width || 160,
                  minWidth: col.width || 160,
                }}
              >
                {col.title || col.dataIndex}
              </th>
            ))}
            {isEditable && (
              <th
                className={`py-3 px-4 text-left font-medium text-[11px] ${drawerMode ? 'text-[#374151]' : 'text-[#6B7280]'}`}
                style={{
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  width: showEditButton && showDeleteButton ? 140 : 80,
                  minWidth: showEditButton && showDeleteButton ? 140 : 80,
                }}
              >
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {isFetching ? (
            <tr>
              <td
                colSpan={(filteredColumns.length || 1) + 1 + (isEditable ? 1 : 0)}
                className="py-16 px-4 text-center text-[#9CA3AF] text-[11px]"
                style={{ verticalAlign: 'middle' }}
              >
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={(filteredColumns.length || 1) + 1 + (isEditable ? 1 : 0)}
                className="py-16 px-4 text-center text-[#9CA3AF] text-[11px]"
                style={{ verticalAlign: 'middle' }}
              >
                No Record
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.Id || rowIndex} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB]">
                {/* Sr No Cell */}
                <td
                  className="py-3 px-4 text-[11px] text-[#374151]"
                  style={{ whiteSpace: 'nowrap', width: 60, minWidth: 60 }}
                >
                  {rowIndex + 1}
                </td>
                {filteredColumns.map((col) => {
                  const key = (col.dataIndex || '').toLowerCase();
                  const raw = row[col.dataIndex];
                  let display = raw != null ? String(raw) : '';

                  if (key === 'requireddate' || col.title === 'Required Date') {
                    try {
                      const d = new Date(raw);
                      if (!isNaN(d.getTime())) {
                        const day = d.getDate().toString().padStart(2, '0');
                        const monthNames = [
                          'Jan',
                          'Feb',
                          'Mar',
                          'Apr',
                          'May',
                          'Jun',
                          'Jul',
                          'Aug',
                          'Sep',
                          'Oct',
                          'Nov',
                          'Dec',
                        ];
                        display = `${day}/${monthNames[d.getMonth()]}/${d.getFullYear()}`;
                      }
                    } catch (e) {}
                  } else if (key === 'createdby') {
                    const altFields = [
                      `${col.dataIndex}Name`,
                      `${col.dataIndex}_Name`,
                      `${col.dataIndex}_iden`,
                      `${col.dataIndex}DisplayValue`,
                    ];
                    const alt = altFields.find((f) => row[f] != null && row[f] !== '');
                    display = alt ? String(row[alt]) : findUserName(raw);
                  } else if (key.endsWith('date')) {
                    display = formatDateTime(raw);
                  }

                  return (
                    <td
                      key={col.dataIndex}
                      className="py-3 px-4"
                      style={{
                        whiteSpace: 'nowrap',
                        width: col.width || 160,
                        minWidth: col.width || 160,
                      }}
                    >
                      {display}
                    </td>
                  );
                })}
                {isEditable && (
                  <td
                    className="py-3 px-4"
                    style={{
                      whiteSpace: 'nowrap',
                      width: showEditButton && showDeleteButton ? 140 : 80,
                      minWidth: showEditButton && showDeleteButton ? 140 : 80,
                    }}
                  >
                    {showEditButton && (
                      <button
                        onClick={() => selectRow && selectRow(rowIndex, 'Edit')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          color: '#6366F1',
                          fontSize: '12px',
                          fontWeight: 500,
                          marginRight: showDeleteButton ? '8px' : '0',
                        }}
                        title="Edit"
                      >
                        Edit
                      </button>
                    )}
                    {showDeleteButton && (
                      <button
                        onClick={() => selectRow && selectRow(rowIndex, 'Delete')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          color: '#EF4444',
                          fontSize: '12px',
                          fontWeight: 500,
                        }}
                        title="Delete"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PlainChildTable;
