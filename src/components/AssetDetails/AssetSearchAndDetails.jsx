import React, { useCallback } from 'react';
import AssetDetailsDisplay from './AssetDetailsDisplay';

export default function AssetSearchAndDetails({
  searchQuery,
  setSearchQuery,
  suggestions,
  selectedAsset,
  setSelectedAsset,
  onSearchChange,
  onAssetSelect,
  placeholder = 'Search assets...',
}) {
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  const handleAssetSelection = useCallback(
    (asset) => {
      setSearchQuery(asset.AssetInfo || '');
      onAssetSelect(asset);
    },
    [setSearchQuery, onAssetSelect],
  );

  const handleRemoveAsset = useCallback(() => {
    setSelectedAsset(null);
  }, [setSelectedAsset]);

  return (
    <>
      <div style={{ marginBottom: '12px', position: 'relative' }}>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <img src="search-normal.png" alt="" className="h-3 w-3 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={onSearchChange}
            className="block w-full pl-8 pr-8 border border-gray-300 rounded-lg bg-white placeholder-gray-400    text-xs"
            style={{
              height: '32px',
              fontSize: '11px',
              paddingLeft: '28px',
              paddingRight: '28px',
            }}
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              ×
            </button>
          )}
        </div>
        {suggestions.length > 0 && (
          <div
            style={{
              marginTop: '8px',
              marginBottom: '12px',
              animation: 'slideDown 0.2s ease-out',
            }}
          >
            <ul
              style={{
                background: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                listStyle: 'none',
                margin: 0,
                padding: '6px 0',
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {suggestions.map((s, idx) => (
                <li
                  key={idx}
                  onClick={() => handleAssetSelection(s)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    color: 'rgba(0,0,0,0.85)',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                >
                  {s.AssetInfo}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <AssetDetailsDisplay
        selectedAsset={selectedAsset}
        onRemove={handleRemoveAsset}
        showRemoveButton={true}
      />
    </>
  );
}
