import React from 'react';

export default function AssetDetailsDisplay({
    assetDetails,
    selectedRowData,
    selectedAsset,
    showRemoveButton = false,
    onRemove,
    variant = 'compact', // 'compact' or 'detailed'
    columns = 2, // Number of columns for detailed variant (2 for drawer, 4 for full page)
}) {
    // Parse asset data from AssetJson if not directly provided
    let parsedAsset = selectedAsset;

    if (!parsedAsset) {
        const rawData = assetDetails || selectedRowData || {};

        // Try to parse AssetJson first
        if (rawData.AssetJson) {
            try {
                const arr = JSON.parse(rawData.AssetJson);
                if (Array.isArray(arr) && arr.length > 0) {
                    parsedAsset = arr[0];
                }
            } catch (err) {
                console.warn('Error parsing AssetJson:', err);
            }
        }

        // If AssetJson parsing failed or doesn't exist, use rawData directly
        if (!parsedAsset) {
            parsedAsset = rawData;
        }
    }

    const asset = parsedAsset || {};

    if (!asset || Object.keys(asset).length === 0) return null;

    // Compact variant - for Add Complaint / Work Order forms
    if (variant === 'compact') {
        return (
            <div
                style={{
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    padding: '16px',
                    marginTop: '12px',
                    background: '#fafafa',
                    borderRadius: `5px 5px 0px 0px`,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <span
                        style={{
                            background: '#6b4eff',
                            color: '#fff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                        }}
                    >
                        {asset.EquipmentId || 'N/A'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: '11px',
                                color: asset.Status === 'Active' ? 'green' : '#666',
                                fontWeight: 500,
                            }}
                        >
                            ● {asset.Status || 'Active'}
                        </span>
                        {showRemoveButton && onRemove && (
                            <button
                                onClick={onRemove}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                🗑
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ borderBottom: '2px solid #f0f0f0', margin: '12px 0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: '12px' }}>
                    {[
                        { label: 'Asset Name', value: asset.AssetName },
                        { label: 'Product Serial Number', value: asset.ProductSerialNumber },
                        { label: 'Asset Category', value: asset.AssetCategory },
                        { label: 'Type', value: asset.Asset },
                        { label: 'Section', value: asset.Section },
                        { label: 'Location', value: asset.Location },
                    ].map(({ label, value }, index) => (
                        <div key={index}>
                            <p style={{ fontSize: '11px', color: '#8c8c8c', margin: 0 }}>{label}</p>
                            <p style={{ fontSize: '11px', margin: 0, fontWeight: 500 }}>{value || 'N/A'}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Detailed variant - for Complaint View Mode with purple header
    return (
        <div style={{ marginBottom: '16px' }}>
            {/* Purple Header */}
            <div
                style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgb(105, 65, 198)',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderRadius: `5px 5px 0px 0px`,
                }}
            >
                <h3
                    style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#FFF',
                    }}
                >
                    Asset Details
                </h3>
            </div>

            {/* Content Grid - Dynamic columns based on prop */}
            <div
                style={{
                    padding: '16px',
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderTop: 'none',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: '16px',
                }}
            >
                {[
                    { label: 'Equipment Id', value: asset.EquipmentId },
                    { label: 'Asset Name', value: asset.AssetName },
                    { label: 'Category', value: asset.AssetCategory },
                    { label: 'Section', value: asset.Section },
                    { label: 'Location', value: asset.Location },
                    { label: 'Status', value: asset.Status },
                ].map(({ label, value }, index) => (
                    <div key={index}>
                        <p style={{ fontSize: '11px', color: '#475467', margin: '0 0 4px 0' }}>{label}</p>
                        <p style={{ fontSize: '11px', fontWeight: 600, margin: 0 }}>{value || 'N/A'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
