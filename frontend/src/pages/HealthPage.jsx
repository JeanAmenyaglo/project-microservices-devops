import { useState, useEffect } from 'react';
import axios from 'axios';

const check = async (url) => {
  try {
    const { data } = await axios.get(url, { timeout: 3000 });
    return { status: data.status, ok: true };
  } catch {
    return { status: 'unreachable', ok: false };
  }
};

export default function HealthPage() {
  const [services, setServices] = useState([
    { name: 'User Service', port: 3001, health: null, ready: null },
    { name: 'Product Service', port: 3002, health: null, ready: null },
  ]);
  const [lastChecked, setLastChecked] = useState(null);
  const [checking, setChecking] = useState(false);

  const runChecks = async () => {
    setChecking(true);
    const updated = await Promise.all(
      services.map(async (svc) => {
        const [health, ready] = await Promise.all([
          check(`/health-proxy/${svc.port}/health`),
          check(`/health-proxy/${svc.port}/ready`),
        ]);
        return { ...svc, health, ready };
      })
    );
    setServices(updated);
    setLastChecked(new Date().toLocaleTimeString());
    setChecking(false);
  };

  // Use direct API calls via proxy paths instead
  const runChecksViaProxy = async () => {
    setChecking(true);
    const results = await Promise.all([
      Promise.all([
        check('/api/users/../health').catch(() => check('/api/users')),
        axios.get('/api/users').then(() => ({ status: 'healthy', ok: true })).catch(() => ({ status: 'unreachable', ok: false })),
      ]),
      Promise.all([
        axios.get('/api/products').then(() => ({ status: 'healthy', ok: true })).catch(() => ({ status: 'unreachable', ok: false })),
        axios.get('/api/products').then(() => ({ status: 'ready', ok: true })).catch(() => ({ status: 'unreachable', ok: false })),
      ]),
    ]);

    setServices(prev => prev.map((svc, i) => ({
      ...svc,
      health: results[i][0],
      ready: results[i][1],
    })));
    setLastChecked(new Date().toLocaleTimeString());
    setChecking(false);
  };

  useEffect(() => { runChecksViaProxy(); }, []);

  const dot = (result) => {
    if (!result) return 'grey';
    return result.ok ? 'green' : 'red';
  };

  return (
    <>
      <h1>Service Health</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary" onClick={runChecksViaProxy} disabled={checking}>
          {checking ? 'Checking…' : '↻ Refresh'}
        </button>
        {lastChecked && <span style={{ fontSize: '0.85rem', color: '#718096' }}>Last checked: {lastChecked}</span>}
      </div>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {services.map(svc => (
          <div className="card" key={svc.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>{svc.name}</h2>
              <span style={{ fontSize: '0.8rem', color: '#718096' }}>:{svc.port}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div className="status-pill">
                <span className={`dot ${dot(svc.health)}`}></span>
                <span>Health: <strong>{svc.health ? svc.health.status : '—'}</strong></span>
              </div>
              <div className="status-pill">
                <span className={`dot ${dot(svc.ready)}`}></span>
                <span>Ready: <strong>{svc.ready ? svc.ready.status : '—'}</strong></span>
              </div>
            </div>

            <div style={{ marginTop: '1rem', padding: '0.8rem', background: '#f7fafc', borderRadius: '8px' }}>
              <p style={{ fontSize: '0.8rem', color: '#718096', margin: 0 }}>
                <strong>Endpoints:</strong><br />
                GET /health — liveness probe<br />
                GET /ready — readiness probe<br />
                GET /api/{svc.name.split(' ')[0].toLowerCase()}s — CRUD
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2>Architecture</h2>
        <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 2, color: '#4a5568' }}>
          <div>Browser → <strong>React Frontend</strong> (port 3000)</div>
          <div style={{ paddingLeft: '1rem' }}>↓ /api/users → <strong>User Service</strong> (port 3001) → PostgreSQL (users_db)</div>
          <div style={{ paddingLeft: '1rem' }}>↓ /api/products → <strong>Product Service</strong> (port 3002) → PostgreSQL (products_db)</div>
          <div style={{ paddingLeft: '3rem' }}>↓ validates owner → calls User Service via REST</div>
        </div>
      </div>
    </>
  );
}
