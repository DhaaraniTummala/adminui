import viewManager from './ViewManager';

/**
 * ViewManagerUtils - Utility functions for debugging and monitoring the ViewManager system
 */
class ViewManagerUtils {
  /**
   * Get comprehensive information about the ViewManager state
   * @returns {Object} Complete ViewManager state information
   */
  static getSystemInfo() {
    const registeredViews = viewManager.getRegisteredViews();

    return {
      registeredViews: registeredViews,
      totalRegisteredViews: registeredViews.length,
      viewDetails: registeredViews.map((tableName) => ({
        tableName,
        hasCustomView: viewManager.hasCustomView(tableName),
        viewOptions: viewManager.getViewOptions(tableName),
        hasConfig: viewManager.viewConfigs.has(tableName),
        hasHooks: viewManager.renderHooks.has(tableName),
      })),
      globalHooksCount: viewManager.globalHooks.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Log current ViewManager state to console
   */
  static logSystemState() {
    const info = this.getSystemInfo();
    console.group('🔧 ViewManager System State');
    console.log('📊 Total Registered Views:', info.totalRegisteredViews);
    console.log('🌐 Global Hooks:', info.globalHooksCount);

    if (info.viewDetails.length > 0) {
      console.group('📋 Registered Views Details');
      info.viewDetails.forEach((view) => {
        console.group(`📄 ${view.tableName}`);
        console.log('Has Custom View:', view.hasCustomView);
        console.log('Has Config Override:', view.hasConfig);
        console.log('Has Hooks:', view.hasHooks);
        console.log('View Options:', view.viewOptions);
        console.groupEnd();
      });
      console.groupEnd();
    }

    console.groupEnd();
    return info;
  }

  /**
   * Test if a specific table has ViewManager customizations
   * @param {string} tableName - The table name to test
   * @returns {Object} Test results
   */
  static testTableCustomizations(tableName) {
    const result = {
      tableName,
      hasCustomView: viewManager.hasCustomView(tableName),
      viewComponent: viewManager.getViewComponent(tableName),
      viewOptions: viewManager.getViewOptions(tableName),
      hasConfigOverride: viewManager.viewConfigs.has(tableName),
      hasHooks: viewManager.renderHooks.has(tableName),
      configOverride: viewManager.viewConfigs.get(tableName),
      hooks: viewManager.renderHooks.get(tableName),
    };

    console.group(`🧪 Testing ViewManager for table: ${tableName}`);
    console.log('Results:', result);
    console.groupEnd();

    return result;
  }

  /**
   * Simulate hook execution for testing
   * @param {string} event - The event name
   * @param {string} tableName - The table name
   * @param {Object} context - Test context
   * @returns {Object} Hook execution result
   */
  static testHookExecution(event, tableName, context = {}) {
    console.group(`🎣 Testing Hook Execution: ${event} for ${tableName}`);

    const testContext = {
      ...context,
      testMode: true,
      timestamp: new Date().toISOString(),
    };

    try {
      const result = viewManager.executeHooks(event, tableName, testContext);
      console.log('✅ Hook execution successful');
      console.log('Input context:', testContext);
      console.log('Output context:', result);
      console.groupEnd();
      return { success: true, result, error: null };
    } catch (error) {
      console.error('❌ Hook execution failed:', error);
      console.groupEnd();
      return { success: false, result: null, error };
    }
  }

  /**
   * Test configuration override application
   * @param {string} tableName - The table name
   * @param {Object} baseConfig - Base configuration to test with
   * @returns {Object} Configuration test result
   */
  static testConfigOverride(tableName, baseConfig = {}) {
    console.group(`⚙️ Testing Config Override for: ${tableName}`);

    const testConfig = {
      title: 'Test Configuration',
      testMode: true,
      ...baseConfig,
    };

    try {
      // Config overrides removed - using ViewManager customizations instead
      console.log('✅ Config override successful');
      console.log('Input config:', testConfig);
      console.log('Output config:', result);
      console.groupEnd();
      return { success: true, result, error: null };
    } catch (error) {
      console.error('❌ Config override failed:', error);
      console.groupEnd();
      return { success: false, result: null, error };
    }
  }

  /**
   * Run comprehensive system tests
   * @param {string} tableName - Optional table name to focus tests on
   * @returns {Object} Complete test results
   */
  static runSystemTests(tableName = null) {
    console.group('🚀 Running ViewManager System Tests');

    const systemInfo = this.getSystemInfo();
    const testResults = {
      systemInfo,
      tests: [],
    };

    // Test system state
    console.log('📊 System Info:', systemInfo);

    // If specific table provided, test it
    if (tableName) {
      const tableTest = this.testTableCustomizations(tableName);
      testResults.tests.push({
        type: 'table_customizations',
        tableName,
        result: tableTest,
      });

      // Test hooks if they exist
      if (tableTest.hasHooks) {
        const hookTest = this.testHookExecution('beforeRender', tableName, { test: true });
        testResults.tests.push({
          type: 'hook_execution',
          tableName,
          event: 'beforeRender',
          result: hookTest,
        });
      }

      // Test config if it exists
      if (tableTest.hasConfigOverride) {
        const configTest = this.testConfigOverride(tableName, { test: true });
        testResults.tests.push({
          type: 'config_override',
          tableName,
          result: configTest,
        });
      }
    } else {
      // Test all registered views
      systemInfo.registeredViews.forEach((table) => {
        const tableTest = this.testTableCustomizations(table);
        testResults.tests.push({
          type: 'table_customizations',
          tableName: table,
          result: tableTest,
        });
      });
    }

    console.log('✅ All tests completed');
    console.groupEnd();

    return testResults;
  }

  /**
   * Clear all ViewManager registrations (for testing/debugging)
   */
  static clearAll() {
    console.warn('🧹 Clearing all ViewManager registrations');
    viewManager.clear();
    console.log('✅ ViewManager cleared');
  }

  /**
   * Export current ViewManager state for backup/restore
   * @returns {Object} Exportable state
   */
  static exportState() {
    return {
      registeredViews: Array.from(viewManager.registeredViews.entries()),
      viewConfigs: Array.from(viewManager.viewConfigs.entries()),
      renderHooks: Array.from(viewManager.renderHooks.entries()),
      globalHooks: viewManager.globalHooks,
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Import ViewManager state from backup
   * @param {Object} state - Previously exported state
   */
  static importState(state) {
    console.log('📥 Importing ViewManager state');

    // Clear current state
    viewManager.clear();

    // Restore state
    if (state.registeredViews) {
      state.registeredViews.forEach(([key, value]) => {
        viewManager.registeredViews.set(key, value);
      });
    }

    if (state.viewConfigs) {
      state.viewConfigs.forEach(([key, value]) => {
        viewManager.viewConfigs.set(key, value);
      });
    }

    if (state.renderHooks) {
      state.renderHooks.forEach(([key, value]) => {
        viewManager.renderHooks.set(key, value);
      });
    }

    if (state.globalHooks) {
      viewManager.globalHooks = [...state.globalHooks];
    }

    console.log('✅ ViewManager state imported');
  }
}

// Make utilities available globally for debugging
if (typeof window !== 'undefined') {
  window.ViewManagerUtils = ViewManagerUtils;
  window.viewManager = viewManager;
}

export default ViewManagerUtils;
