import React, { useState } from 'react';
import { GraphEdge, LocationItem, CampusAnnouncement } from '../types/navigation';
import { 
  ShieldCheck, 
  X, 
  AlertTriangle, 
  Plus, 
  Layers, 
  Radio, 
  Send, 
  Check, 
  Activity,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  edges: GraphEdge[];
  onToggleEdgeClosure: (edgeId: string, isClosed: boolean, reason?: string) => void;
  announcements: CampusAnnouncement[];
  onPublishAnnouncement: (ann: Omit<CampusAnnouncement, 'id' | 'timestamp' | 'active'>) => void;
  totalNodes: number;
  totalLocations: number;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  edges,
  onToggleEdgeClosure,
  announcements,
  onPublishAnnouncement,
  totalNodes,
  totalLocations
}) => {
  const [activeTab, setActiveTab] = useState<'closures' | 'announcements' | 'stats'>('closures');
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'info' | 'warning' | 'alert'>('warning');

  if (!isOpen) return null;

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    onPublishAnnouncement({
      title: annTitle,
      content: annContent,
      priority: annPriority,
      buildingId: 'b-tech'
    });
    setAnnTitle('');
    setAnnContent('');
    setActiveTab('announcements');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Admin Console</h2>
              <p className="text-[11px] text-slate-500">Live corridor status & campus broadcasts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-4 pt-2 bg-white space-x-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('closures')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'closures'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Corridor Closures ({edges.filter(e => e.isClosed).length} Closed)
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'announcements'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Announcements ({announcements.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2.5 border-b-2 transition-colors ${
              activeTab === 'stats'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Graph Statistics
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: CORRIDOR CLOSURES */}
          {activeTab === 'closures' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Toggling a corridor closed updates the Java Dijkstra routing engine in real-time. Any active routes crossing that section will automatically reroute around it.
                </p>
              </div>

              <div className="space-y-2">
                {edges.map(edge => (
                  <div
                    key={edge.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
                      edge.isClosed ? 'bg-red-50/70 border-red-200' : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {edge.sourceNodeId.replace('node-', '')} ↔ {edge.targetNodeId.replace('node-', '')}
                        </span>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                          Floor {edge.floorNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Type: {edge.connectionType} • Distance: {edge.distance}m • {edge.isAccessible ? 'Accessible' : 'Stairs Only'}
                      </p>
                      {edge.isClosed && (
                        <p className="text-[10px] text-red-600 font-bold mt-1">
                          ⚠️ BLOCKED: {edge.closureReason || 'Maintenance in progress'}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onToggleEdgeClosure(edge.id, !edge.isClosed, 'Maintenance / Cleaning')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        edge.isClosed
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {edge.isClosed ? 'Reopen' : 'Close Edge'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              <form onSubmit={handlePublish} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Broadcast Campus Notice</p>
                <div>
                  <input
                    type="text"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="Announcement headline (e.g. West Wing Cleaning)"
                    className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <textarea
                    value={annContent}
                    onChange={(e) => setAnnContent(e.target.value)}
                    placeholder="Provide details and instructions for students, visitors and staff..."
                    rows={2}
                    className="w-full text-xs p-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs">
                    <label className="text-[11px] font-semibold text-slate-500">Priority:</label>
                    <select
                      value={annPriority}
                      onChange={(e) => setAnnPriority(e.target.value as any)}
                      className="text-xs bg-white border border-slate-200 rounded-lg p-1"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="alert">Alert</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publish</span>
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Notices</p>
                {announcements.map(ann => (
                  <div key={ann.id} className="p-3 bg-white rounded-2xl border border-slate-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{ann.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        ann.priority === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {ann.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{ann.content}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{ann.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GRAPH STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Graph Vertices</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{totalNodes}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Entrances, rooms & corridor nodes</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Walkway Edges</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{edges.length}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Corridors, elevators & stairs</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total POIs</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{totalLocations}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Rooms, labs & facilities</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Database Engine</p>
                  <p className="text-base font-bold text-blue-600 mt-1">MySQL 8.0</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">JDBC & HikariCP Pool</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors shadow-xs"
          >
            Close Console
          </button>
        </div>

      </div>
    </div>
  );
};
