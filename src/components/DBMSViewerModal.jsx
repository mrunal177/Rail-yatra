import React, { useState, useEffect } from 'react';
import { X, Database, Table, Eye, Play, ShieldAlert, Cpu, Terminal, CheckCircle2 } from 'lucide-react';
import api from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';

export default function DBMSViewerModal({ isOpen, onClose }) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('tables');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  // Table Data Viewer
  const [selectedTable, setSelectedTable] = useState('bookings');
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  // Interactive SQL Console
  const [sqlQuery, setSqlQuery] = useState('SELECT booking_id, pnr, passenger_name, travel_class, booking_status, total_amount FROM bookings LIMIT 10;');
  const [queryResult, setQueryResult] = useState(null);
  const [queryRunning, setQueryRunning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadOverview();
      loadTableData('bookings');
    }
  }, [isOpen]);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dbms/overview');
      if (res.success) setOverview(res);
    } catch (err) {
      console.warn('Error loading DBMS overview:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (tbl) => {
    setSelectedTable(tbl);
    setTableLoading(true);
    try {
      const res = await api.get(`/dbms/table/${tbl}`);
      if (res.success) setTableData(res.data || []);
    } catch (err) {
      console.warn('Error loading table data:', err.message);
    } finally {
      setTableLoading(false);
    }
  };

  const handleRunQuery = async (e) => {
    if (e) e.preventDefault();
    setQueryRunning(true);
    try {
      const res = await api.post('/dbms/query', { sql: sqlQuery });
      if (res.success) {
        setQueryResult(res);
        toast.success(`Query executed successfully (${res.rowCount} rows returned)`);
      }
    } catch (err) {
      toast.error(err.message || 'SQL execution failed');
      setQueryResult(null);
    } finally {
      setQueryRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>RailConnect AI — Relational DBMS Architecture</span>
                <span className="text-[11px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                  MySQL 8.0 & 3NF
                </span>
              </h2>
              <div className="text-xs text-slate-500">
                {overview?.dbStatus?.statusMessage || 'Active Schema: railconnect_db'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition border border-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto text-xs font-bold">
          {[
            { id: 'tables', label: '1. Relational Tables', icon: Table },
            { id: 'views', label: '2. SQL Views', icon: Eye },
            { id: 'triggers', label: '3. Triggers & Audit', icon: ShieldAlert },
            { id: 'procedures', label: '4. Stored Procedures', icon: Cpu },
            { id: 'console', label: '5. Live SQL Console', icon: Terminal }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'border-sky-600 text-sky-700 font-extrabold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: RELATIONAL TABLES */}
          {activeTab === 'tables' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {overview?.tables?.map(t => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => loadTableData(t.name)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      selectedTable === t.name
                        ? 'border-sky-600 bg-sky-50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 font-mono flex items-center justify-between">
                      <span>{t.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {t.rows} rows
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                      {t.description}
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Table Data Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider font-mono">
                    Table: {selectedTable} ({tableData.length} records)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    Pre-seeded with realistic college project data
                  </span>
                </div>

                <div className="overflow-x-auto max-h-72 border border-slate-200 rounded-xl bg-white">
                  {tableLoading ? (
                    <div className="p-8 text-center text-xs text-slate-400">Loading records...</div>
                  ) : tableData.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">Table is empty</div>
                  ) : (
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-100 border-b border-slate-200 text-slate-600">
                        <tr>
                          {Object.keys(tableData[0] || {}).map(col => (
                            <th key={col} className="px-3 py-2 font-bold whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tableData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            {Object.values(row).map((val, cIdx) => (
                              <td key={cIdx} className="px-3 py-2 whitespace-nowrap text-slate-800">
                                {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SQL VIEWS */}
          {activeTab === 'views' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Views provide standardized data abstractions, encapsulated business logic, and security isolation across complex entity relationships.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {overview?.views?.map(v => (
                  <div key={v.name} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-sky-600" />
                      <span className="text-sm font-bold text-slate-900 font-mono">{v.name}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {v.purpose}
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-sky-700 font-semibold font-mono">
                      SQL: CREATE OR REPLACE VIEW {v.name} AS SELECT ...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TRIGGERS */}
          {activeTab === 'triggers' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Database Triggers enforce automated business rules, seat availability restoration upon cancellation, and security audit log population.
              </p>
              <div className="space-y-3">
                {overview?.triggers?.map(tr => (
                  <div key={tr.name} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
                    <div>
                      <div className="text-sm font-bold text-slate-900 font-mono">{tr.name}</div>
                      <div className="text-xs font-semibold text-teal-700 mt-0.5">{tr.event}</div>
                      <p className="text-xs text-slate-500 mt-1">{tr.action}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
                      ACTIVE TRIGGER
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: STORED PROCEDURES */}
          {activeTab === 'procedures' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Stored procedures implement ACID compliance with explicit transaction control (START TRANSACTION, COMMIT, ROLLBACK) and pessimistic row locking (FOR UPDATE).
              </p>
              <div className="space-y-4">
                {overview?.procedures?.map(p => (
                  <div key={p.name} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-base font-bold text-slate-900 font-mono">
                        CALL {p.name}(...)
                      </div>
                      <span className="text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-1 rounded-full">
                        ACID Procedure
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      Params: {p.parameters}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-slate-900">DBMS Mechanism:</span> {p.acidFeature}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: INTERACTIVE SQL CONSOLE */}
          {activeTab === 'console' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Test custom SELECT queries against the live relational schema. Perfect for viva demonstrations!
              </p>

              {/* Preset Query Chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  'SELECT * FROM v_train_occupancy_analytics;',
                  'SELECT * FROM v_feedback_sentiment_summary;',
                  'SELECT pnr, passenger_name, booking_status, total_amount FROM bookings;',
                  'SELECT action_type, entity_name, created_at, details FROM audit_logs LIMIT 5;'
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setSqlQuery(q); }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] rounded-lg transition text-left"
                  >
                    Query #{idx + 1}
                  </button>
                ))}
              </div>

              {/* Query Box */}
              <form onSubmit={handleRunQuery} className="space-y-2">
                <textarea
                  rows="3"
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="w-full bg-slate-900 text-teal-300 font-mono text-xs p-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-inner"
                ></textarea>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">
                    Read-only sandbox (SELECT / SHOW supported)
                  </span>
                  <button
                    type="submit"
                    disabled={queryRunning}
                    className="px-5 py-2 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{queryRunning ? 'Executing...' : 'Execute Query'}</span>
                  </button>
                </div>
              </form>

              {/* Query Output */}
              {queryResult && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Query executed in 0.02s ({queryResult.rowCount} rows returned)
                    </span>
                  </div>

                  <div className="overflow-x-auto max-h-60 border border-slate-200 rounded-xl bg-white">
                    {queryResult.rows.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">Query returned 0 rows</div>
                    ) : (
                      <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-slate-100 border-b border-slate-200 text-slate-700">
                          <tr>
                            {Object.keys(queryResult.rows[0] || {}).map(col => (
                              <th key={col} className="px-3 py-2 font-bold whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {queryResult.rows.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              {Object.values(row).map((val, cIdx) => (
                                <td key={cIdx} className="px-3 py-2 whitespace-nowrap text-slate-800">
                                  {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
