// Centralized mapping of numeric table IDs to custom component names
// Add/maintain mappings here to avoid hardcoding in generic files

export const COMPONENT_MAP = Object.freeze({
  // Maiden_Task
  10715: 'ProjectTask',
  // Maiden_Project
  10719: 'Project',
  // NoFever_Activity
  10372: 'NoFeverActivity',
  // Asset
  10738: 'Asset',
  // AssetBreakDown
  10745: 'AssetBreakDown',
});

export function getComponentName(tableId) {
  if (!tableId && tableId !== 0) return null;
  const key = tableId.toString();
  return COMPONENT_MAP[key] || null;
}

// Centralized dynamic import loader for custom components
// Keeping import paths here isolates generic code from entity-specific details
export async function loadCustomizationModule(tableId) {
  const key = tableId?.toString?.() || '';
  switch (key) {
    case '10715':
      return import(/* webpackChunkName: "custom-ProjectTask" */ '../views/custom/ProjectTask.jsx');
    case '10719':
      return import(/* webpackChunkName: "custom-Project" */ '../views/custom/ProjectView.jsx');
    case '10372':
      return import(
        /* webpackChunkName: "custom-NoFeverActivity" */ '../views/custom/NoFeverActivity.jsx'
      );
    case '10738':
      return import(/* webpackChunkName: "custom-Asset" */ '../views/custom/Asset.jsx');
    case '10689':
      return import(
        /* webpackChunkName: "custom-UserManagement" */ '../views/custom/UserManagement.jsx'
      );
    case '10745':
      return import(
        /* webpackChunkName: "custom-AssetBreakDown" */ '../views/custom/AssetBreakDown.jsx'
      );
    default:
      return null;
  }
}
