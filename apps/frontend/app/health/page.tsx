'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    database: boolean;
    redis: boolean;
    storage: boolean;
  };
}

export default function HealthPage() {
  const [restHealth, setRestHealth] = useState<HealthResponse | null>(null);
  const [wsHealth, setWsHealth] = useState<HealthResponse | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check REST health endpoint
    const checkRestHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        const data = await response.json();
        setRestHealth(data);
      } catch (error) {
        console.error('REST health check failed:', error);
        setRestHealth({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          services: { database: false, redis: false, storage: false },
        });
      }
    };

    // Check WebSocket health endpoint
    const checkWsHealth = () => {
      const wsUrl = API_BASE_URL.replace('http', 'ws');
      const ws = new WebSocket(`${wsUrl}/ws/health/`);
      
      ws.onopen = () => {
        setWsConnected(true);
        ws.send(JSON.stringify({ type: 'health_check' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'health') {
            setWsHealth(data.data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = () => {
        setWsConnected(false);
        setWsHealth({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          services: { database: false, redis: false, storage: false },
        });
      };

      ws.onclose = () => {
        setWsConnected(false);
      };

      return () => ws.close();
    };

    checkRestHealth();
    const cleanup = checkWsHealth();
    
    setLoading(false);

    return cleanup;
  }, []);

  const refreshHealth = () => {
    setLoading(true);
    window.location.reload();
  };

  const getStatusColor = (status: string) => {
    return status === 'healthy' ? 'text-green-600' : 'text-red-600';
  };

  const getServiceIcon = (status: boolean) => {
    return status ? '✅' : '❌';
  };

  return (
    <main className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Health Status</h1>
          <p className="text-gray-600">
            Monitor the health of all backend services
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* REST API Health */}
          <div className="border rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                REST API Health
                {restHealth && (
                  <span className={getStatusColor(restHealth.status)}>
                    {restHealth.status === 'healthy' ? '✅' : '❌'}
                  </span>
                )}
              </h2>
              <p className="text-gray-600 text-sm">
                HTTP endpoint health check
              </p>
            </div>
            <div>
              {loading ? (
                <p>Loading...</p>
              ) : restHealth ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Status:</strong>{' '}
                    <span className={getStatusColor(restHealth.status)}>
                      {restHealth.status}
                    </span>
                  </p>
                  <p className="text-sm">
                    <strong>Timestamp:</strong> {new Date(restHealth.timestamp).toLocaleString()}
                  </p>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Services:</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        {getServiceIcon(restHealth.services.database)} Database
                      </li>
                      <li className="flex items-center gap-2">
                        {getServiceIcon(restHealth.services.redis)} Redis
                      </li>
                      <li className="flex items-center gap-2">
                        {getServiceIcon(restHealth.services.storage)} Storage (MinIO)
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-red-600">Failed to fetch health data</p>
              )}
            </div>
          </div>

          {/* WebSocket Health */}
          <div className="border rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                WebSocket Health
                {wsHealth && (
                  <span className={getStatusColor(wsHealth.status)}>
                    {wsHealth.status === 'healthy' ? '✅' : '❌'}
                  </span>
                )}
                <span className={`text-xs ${wsConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {wsConnected ? '(Connected)' : '(Disconnected)'}
                </span>
              </h2>
              <p className="text-gray-600 text-sm">
                WebSocket connection health check
              </p>
            </div>
            <div>
              {loading ? (
                <p>Loading...</p>
              ) : wsHealth ? (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Status:</strong>{' '}
                    <span className={getStatusColor(wsHealth.status)}>
                      {wsHealth.status}
                    </span>
                  </p>
                  <p className="text-sm">
                    <strong>Timestamp:</strong> {new Date(wsHealth.timestamp).toLocaleString()}
                  </p>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Services:</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        {getServiceIcon(wsHealth.services.database)} Database
                      </li>
                      <li className="flex items-center gap-2">
                        {getServiceIcon(wsHealth.services.redis)} Redis
                      </li>
                      <li className="flex items-center gap-2">
                        {getServiceIcon(wsHealth.services.storage)} Storage (MinIO)
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-red-600">Failed to connect via WebSocket</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button 
            onClick={refreshHealth} 
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh Health Status'}
          </button>
        </div>
      </div>
    </main>
  );
}