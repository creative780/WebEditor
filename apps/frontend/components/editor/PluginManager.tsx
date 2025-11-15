'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Download,
  Trash2,
  Power,
  PowerOff,
  Settings,
  Activity,
  X,
  Star,
  Filter,
  Check,
  AlertCircle,
  Clock,
  Zap,
  Info,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { pluginManager, Plugin, PluginManifest } from '../../lib/plugins';
import { pluginValidator, permissionManager, auditLogger, rateLimiter } from '../../lib/pluginSecurity';

type View = 'list' | 'marketplace' | 'details' | 'settings' | 'activity';

export function PluginManager() {
  const [view, setView] = useState<View>('list');
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [marketplacePlugins, setMarketplacePlugins] = useState<PluginManifest[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  // Load installed plugins
  useEffect(() => {
    loadPlugins();
  }, []);

  // Listen for plugin notifications
  useEffect(() => {
    const handleNotification = (e: CustomEvent) => {
      const { message, type, pluginId } = e.detail;
      showNotification(`${pluginId}: ${message}`, type as 'success' | 'error' | 'info');
    };

    window.addEventListener('plugin-notification', handleNotification as EventListener);
    return () => window.removeEventListener('plugin-notification', handleNotification as EventListener);
  }, []);

  const loadPlugins = () => {
    const installed = pluginManager.getPlugins();
    setPlugins(installed);
  };

  const loadMarketplace = async () => {
    setLoading(true);
    setError(null);
    try {
      const plugins = await pluginManager.fetchMarketplacePlugins({
        category: filterCategory !== 'all' ? filterCategory : undefined,
        search: searchQuery || undefined,
      });
      setMarketplacePlugins(plugins);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async (manifest: PluginManifest) => {
    setLoading(true);
    setError(null);
    try {
      // Validate manifest
      const validation = pluginValidator.validateManifest(manifest);
      if (!validation.valid) {
        throw new Error(`Invalid plugin manifest: ${validation.issues.join(', ')}`);
      }

      await pluginManager.installFromMarketplace(manifest.id);
      auditLogger.log({
        pluginId: manifest.id,
        action: 'install',
        details: { name: manifest.name, version: manifest.version },
      });
      showNotification(`Plugin "${manifest.name}" installed successfully`, 'success');
      loadPlugins();
      setView('list');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Installation failed';
      setError(errorMessage);
      auditLogger.log({
        pluginId: manifest.id,
        action: 'error',
        details: { error: errorMessage },
      });
      showNotification(`Failed to install plugin: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUninstall = async (pluginId: string) => {
    if (!confirm(`Are you sure you want to uninstall "${pluginManager.getPlugin(pluginId)?.name}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await pluginManager.uninstall(pluginId);
      auditLogger.log({
        pluginId,
        action: 'uninstall',
      });
      showNotification('Plugin uninstalled successfully', 'success');
      loadPlugins();
      setSelectedPlugin(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Uninstallation failed';
      setError(errorMessage);
      showNotification(`Failed to uninstall: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (pluginId: string, enabled: boolean) => {
    try {
      if (enabled) {
        pluginManager.enable(pluginId);
        auditLogger.log({
          pluginId,
          action: 'enable',
        });
      } else {
        pluginManager.disable(pluginId);
        auditLogger.log({
          pluginId,
          action: 'disable',
        });
      }
      loadPlugins();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle plugin');
    }
  };

  const handleExecute = async (pluginId: string) => {
    if (!rateLimiter.isAllowed(pluginId)) {
      showNotification('Rate limit exceeded. Please wait before executing again.', 'error');
      return;
    }

    setLoading(true);
    try {
      await pluginManager.execute(pluginId);
      showNotification('Plugin executed successfully', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Execution failed';
      setError(errorMessage);
      auditLogger.log({
        pluginId,
        action: 'error',
        details: { error: errorMessage },
      });
      showNotification(`Execution failed: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMarketplace = marketplacePlugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="plugin-manager h-full flex flex-col">
      {/* Header */}
      <div className="plugin-manager-header p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-red-700" />
          <h2 className="text-lg font-semibold text-gray-900">Plugins</h2>
        </div>
        <button
          onClick={() => setView('list')}
          className="btn btn-ghost btn-sm"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="plugin-manager-nav flex border-b border-gray-200">
        {[
          { id: 'list' as View, label: 'Installed', icon: Package },
          { id: 'marketplace' as View, label: 'Marketplace', icon: Download },
          { id: 'activity' as View, label: 'Activity', icon: Activity },
          { id: 'settings' as View, label: 'Settings', icon: Settings },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              setView(id);
              if (id === 'marketplace') {
                loadMarketplace();
              }
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              view === id
                ? 'text-red-700 border-b-2 border-red-700 bg-red-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="plugin-manager-content flex-1 overflow-y-auto">
        {view === 'list' && (
          <PluginListView
            plugins={filteredPlugins}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelectPlugin={(plugin) => {
              setSelectedPlugin(plugin);
              setView('details');
            }}
            onToggle={handleToggle}
            onExecute={handleExecute}
            onUninstall={handleUninstall}
            loading={loading}
          />
        )}

        {view === 'marketplace' && (
          <MarketplaceView
            plugins={filteredMarketplace}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filterCategory={filterCategory}
            onFilterChange={setFilterCategory}
            onSelectPlugin={(manifest) => {
              setSelectedPlugin(pluginManager.getPlugin(manifest.id) || null);
              setView('details');
            }}
            onInstall={handleInstall}
            onRefresh={loadMarketplace}
            loading={loading}
            error={error}
          />
        )}

        {view === 'details' && selectedPlugin && (
          <PluginDetailsView
            plugin={selectedPlugin}
            onClose={() => {
              setSelectedPlugin(null);
              setView('list');
            }}
            onToggle={handleToggle}
            onExecute={handleExecute}
            onUninstall={handleUninstall}
          />
        )}

        {view === 'activity' && (
          <ActivityLogView />
        )}

        {view === 'settings' && (
          <SettingsView />
        )}
      </div>

      {/* Notifications */}
      <div className="plugin-manager-notifications fixed bottom-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm min-w-[300px] ${
              notification.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : notification.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Plugin List View
// ============================================================================

interface PluginListViewProps {
  plugins: Plugin[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectPlugin: (plugin: Plugin) => void;
  onToggle: (pluginId: string, enabled: boolean) => void;
  onExecute: (pluginId: string) => void;
  onUninstall: (pluginId: string) => void;
  loading: boolean;
}

function PluginListView({
  plugins,
  searchQuery,
  onSearchChange,
  onSelectPlugin,
  onToggle,
  onExecute,
  onUninstall,
  loading,
}: PluginListViewProps) {
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p>Loading plugins...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search installed plugins..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Plugin List */}
      {plugins.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No plugins installed</p>
          <p className="text-sm">Browse the marketplace to find plugins</p>
        </div>
      ) : (
        <div className="space-y-2">
          {plugins.map(plugin => {
            const metrics = pluginManager.getMetrics(plugin.id);
            return (
              <div
                key={plugin.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => onSelectPlugin(plugin)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{plugin.name}</h3>
                      {plugin.enabled ? (
                        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                          Enabled
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{plugin.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>v{plugin.version}</span>
                      <span>by {plugin.author}</span>
                      {metrics && (
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {metrics.executionCount} executions
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(plugin.id, !plugin.enabled);
                      }}
                      className="btn btn-ghost btn-sm"
                      title={plugin.enabled ? 'Disable' : 'Enable'}
                    >
                      {plugin.enabled ? (
                        <PowerOff className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Power className="w-4 h-4 text-green-600" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExecute(plugin.id);
                      }}
                      className="btn btn-ghost btn-sm"
                      title="Execute"
                    >
                      <Zap className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Marketplace View
// ============================================================================

interface MarketplaceViewProps {
  plugins: PluginManifest[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterCategory: string;
  onFilterChange: (category: string) => void;
  onSelectPlugin: (manifest: PluginManifest) => void;
  onInstall: (manifest: PluginManifest) => void;
  onRefresh: () => void;
  loading: boolean;
  error: string | null;
}

function MarketplaceView({
  plugins,
  searchQuery,
  onSearchChange,
  filterCategory,
  onFilterChange,
  onSelectPlugin,
  onInstall,
  onRefresh,
  loading,
  error,
}: MarketplaceViewProps) {
  const categories = ['all', 'tools', 'effects', 'automation', 'export', 'import'];

  return (
    <div className="p-4">
      {/* Search and Filter */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search marketplace..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onFilterChange(category)}
              className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
                filterCategory === category
                  ? 'bg-red-100 text-red-700 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
          <button
            onClick={onRefresh}
            className="ml-auto btn btn-ghost btn-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {/* Plugin Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading marketplace...</p>
        </div>
      ) : plugins.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No plugins found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plugins.map(plugin => {
            const isInstalled = pluginManager.getPlugin(plugin.id) !== undefined;
            return (
              <div
                key={plugin.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{plugin.name}</h3>
                  {isInstalled && (
                    <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                      Installed
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{plugin.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>v{plugin.version}</span>
                    <span>by {plugin.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectPlugin(plugin)}
                      className="btn btn-ghost btn-sm text-xs"
                    >
                      <Info className="w-3 h-3 mr-1" />
                      Details
                    </button>
                    {!isInstalled && (
                      <button
                        onClick={() => onInstall(plugin)}
                        className="btn btn-sm bg-red-600 text-white hover:bg-red-700 text-xs"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Install
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Plugin Details View
// ============================================================================

interface PluginDetailsViewProps {
  plugin: Plugin;
  onClose: () => void;
  onToggle: (pluginId: string, enabled: boolean) => void;
  onExecute: (pluginId: string) => void;
  onUninstall: (pluginId: string) => void;
}

function PluginDetailsView({
  plugin,
  onClose,
  onToggle,
  onExecute,
  onUninstall,
}: PluginDetailsViewProps) {
  const metrics = pluginManager.getMetrics(plugin.id);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{plugin.name}</h2>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>v{plugin.version}</span>
            <span>•</span>
            <span>by {plugin.author}</span>
            {plugin.license && (
              <>
                <span>•</span>
                <span>License: {plugin.license}</span>
              </>
            )}
          </div>
        </div>
        <button onClick={onClose} className="btn btn-ghost btn-sm">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Description */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-sm text-gray-600">{plugin.description}</p>
        </div>

        {/* Permissions */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Permissions</h3>
          <div className="flex flex-wrap gap-2">
            {plugin.permissions.map(perm => (
              <div
                key={perm}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                {permissionManager.getPermissionDescription(perm)}
              </div>
            ))}
          </div>
        </div>

        {/* Metrics */}
        {metrics && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-600 mb-1">Executions</div>
                <div className="text-lg font-semibold">{metrics.executionCount}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-600 mb-1">Avg. Time</div>
                <div className="text-lg font-semibold">{metrics.averageExecutionTime.toFixed(2)}ms</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-600 mb-1">Last Execution</div>
                <div className="text-lg font-semibold">{metrics.lastExecutionTime.toFixed(2)}ms</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-600 mb-1">Errors</div>
                <div className="text-lg font-semibold text-red-600">{metrics.errorCount}</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => onToggle(plugin.id, !plugin.enabled)}
            className={`btn ${plugin.enabled ? 'btn-ghost' : 'bg-green-600 text-white hover:bg-green-700'}`}
          >
            {plugin.enabled ? (
              <>
                <PowerOff className="w-4 h-4 mr-2" />
                Disable
              </>
            ) : (
              <>
                <Power className="w-4 h-4 mr-2" />
                Enable
              </>
            )}
          </button>
          <button
            onClick={() => onExecute(plugin.id)}
            className="btn bg-blue-600 text-white hover:bg-blue-700"
          >
            <Zap className="w-4 h-4 mr-2" />
            Execute
          </button>
          <button
            onClick={() => onUninstall(plugin.id)}
            className="btn btn-ghost text-red-600 hover:bg-red-50 ml-auto"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Uninstall
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Activity Log View
// ============================================================================

function ActivityLogView() {
  const logs = auditLogger.getRecentLogs(50);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h2>
      {logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No activity recorded</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <div
              key={log.id}
              className="p-3 border border-gray-200 rounded-lg flex items-start justify-between"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{log.pluginId}</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    log.action === 'install' || log.action === 'enable' ? 'bg-green-100 text-green-700' :
                    log.action === 'uninstall' || log.action === 'disable' ? 'bg-gray-100 text-gray-700' :
                    log.action === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {log.action}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                {log.details && (
                  <div className="text-xs text-gray-600 mt-1">
                    {JSON.stringify(log.details, null, 2)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Settings View
// ============================================================================

function SettingsView() {
  const remainingRequests = rateLimiter.getRemaining('default');

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Plugin Settings</h2>
      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Rate Limiting</h3>
          <p className="text-sm text-gray-600 mb-2">
            Plugins are rate-limited to prevent abuse and ensure system stability.
          </p>
          <div className="text-sm text-gray-700">
            Remaining requests: <span className="font-semibold">{remainingRequests}</span>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
          <p className="text-sm text-gray-600 mb-2">
            All plugins are validated and executed in a sandboxed environment.
          </p>
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Check className="w-4 h-4" />
            <span>Security validation enabled</span>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Audit Logging</h3>
          <p className="text-sm text-gray-600 mb-2">
            All plugin actions are logged for security and debugging purposes.
          </p>
          <button
            onClick={() => {
              const logs = auditLogger.exportLogs();
              const blob = new Blob([logs], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `plugin-audit-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="btn btn-sm btn-ghost"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </button>
        </div>
      </div>
    </div>
  );
}

