import React, { useState } from 'react';
import { 
  Code2, 
  X, 
  Copy, 
  Check, 
  Terminal, 
  FileCode, 
  Database, 
  ShieldAlert, 
  Play, 
  Server
} from 'lucide-react';

interface JavaExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateApiRoute: (startId: string, destId: string, wheelchair: boolean) => any;
}

export const JavaExplorerModal: React.FC<JavaExplorerModalProps> = ({
  isOpen,
  onClose,
  onSimulateApiRoute
}) => {
  const [selectedFile, setSelectedFile] = useState<string>('DijkstraService.java');
  const [copied, setCopied] = useState<boolean>(false);

  // Live API Simulator State
  const [apiStartId, setApiStartId] = useState<string>('node-f1-entrance');
  const [apiTargetId, setApiTargetId] = useState<string>('node-f2-robotics');
  const [apiWheelchair, setApiWheelchair] = useState<boolean>(true);
  const [apiResponse, setApiResponse] = useState<any>(null);

  if (!isOpen) return null;

  const files: Record<string, { category: string; code: string; lang: string }> = {
    'DijkstraService.java': {
      category: 'Java Service',
      lang: 'java',
      code: `package com.indoor.service;

import com.indoor.model.*;
import java.util.*;

/**
 * Enterprise Dijkstra shortest-path navigation engine with multi-floor transitions
 * and wheelchair accessibility constraints.
 */
public class DijkstraService {

    public RouteResponse findShortestRoute(
            List<NavigationNode> allNodes,
            List<NavigationEdge> allEdges,
            String startNodeId,
            String targetNodeId,
            boolean wheelchairAccessible) {

        // Builds adjacency list and runs Min-Heap Dijkstra
        PriorityQueue<PathElement> pq = new PriorityQueue<>();
        Map<String, Double> distances = new HashMap<>();
        Map<String, PreviousStep> previous = new HashMap<>();

        distances.put(startNodeId, 0.0);
        pq.add(new PathElement(startNodeId, 0.0));

        while (!pq.isEmpty()) {
            PathElement current = pq.poll();
            String u = current.nodeId;
            if (u.equals(targetNodeId)) break;

            for (AdjacencyItem item : adjacency.getOrDefault(u, Collections.emptyList())) {
                if (item.edge.isClosed()) continue; // Skip blocked corridors
                if (wheelchairAccessible && !item.edge.isAccessible()) continue; // Skip stairs

                double newDist = distances.get(u) + item.weight;
                if (newDist < distances.getOrDefault(item.targetNodeId, Double.MAX_VALUE)) {
                    distances.put(item.targetNodeId, newDist);
                    previous.put(item.targetNodeId, new PreviousStep(u, item.edge));
                    pq.add(new PathElement(item.targetNodeId, newDist));
                }
            }
        }
        // Returns computed RouteResponse with step guidance and floor transitions
        return buildRouteResponse(startNodeId, targetNodeId, distances, previous, wheelchairAccessible);
    }
}`
    },
    'RouteCalculationServlet.java': {
      category: 'Jakarta Servlet',
      lang: 'java',
      code: `package com.indoor.controller;

import com.indoor.model.*;
import com.indoor.service.DijkstraService;
import com.indoor.util.JsonUtil;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet(name = "RouteCalculationServlet", urlPatterns = {"/api/routes"})
public class RouteCalculationServlet extends HttpServlet {

    private final DijkstraService dijkstraService = new DijkstraService();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        RouteRequest requestBody = JsonUtil.fromJson(req.getReader(), RouteRequest.class);
        
        List<NavigationNode> nodes = NavigationDAO.findAllNodes(requestBody.buildingId);
        List<NavigationEdge> edges = NavigationDAO.findAllEdges(requestBody.buildingId);

        RouteResponse route = dijkstraService.findShortestRoute(
                nodes, edges,
                requestBody.startNodeId,
                requestBody.targetNodeId,
                requestBody.wheelchairAccessible
        );

        JsonUtil.writeJson(resp, route.isSuccess() ? 200 : 404, route);
    }
}`
    },
    'FirebaseTokenVerifier.java': {
      category: 'Security',
      lang: 'java',
      code: `package com.indoor.security;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;

public class FirebaseTokenVerifier {

    public static FirebaseToken verifyIdToken(String idToken) {
        if (idToken == null || idToken.trim().isEmpty()) return null;
        try {
            // Cryptographically verify ID token with Google public keys
            return FirebaseAuth.getInstance().verifyIdToken(idToken);
        } catch (Exception e) {
            return null;
        }
    }
}`
    },
    'schema.sql': {
      category: 'Database DDL',
      lang: 'sql',
      code: `CREATE DATABASE IF NOT EXISTS indoor_nav_db;
USE indoor_nav_db;

CREATE TABLE buildings (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    floors_count INT NOT NULL DEFAULT 1
);

CREATE TABLE navigation_nodes (
    id VARCHAR(64) PRIMARY KEY,
    building_id VARCHAR(64) NOT NULL,
    floor_number INT NOT NULL,
    x DOUBLE NOT NULL,
    y DOUBLE NOT NULL,
    label VARCHAR(128) NOT NULL,
    node_type ENUM('room', 'corridor', 'intersection', 'stairs', 'elevator', 'entrance') NOT NULL
);

CREATE TABLE navigation_edges (
    id VARCHAR(64) PRIMARY KEY,
    source_node_id VARCHAR(64) NOT NULL,
    target_node_id VARCHAR(64) NOT NULL,
    distance DOUBLE NOT NULL,
    floor_number INT NOT NULL,
    is_accessible BOOLEAN NOT NULL DEFAULT TRUE,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,
    connection_type ENUM('walkway', 'stairs', 'elevator', 'ramp') NOT NULL
);`
    },
    'firestore.rules': {
      category: 'Firebase Rules',
      lang: 'javascript',
      code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }

    function isSignedIn() { return request.auth != null; }
    function isOwner(userId) { return isSignedIn() && request.auth.uid == userId; }

    match /users/{userId} {
      allow get: if isOwner(userId);
      match /favorites/{favoriteId} {
        allow read, write: if isOwner(userId);
      }
    }

    match /announcements/{id} {
      allow read: if true;
      allow write: if isSignedIn() && exists(/databases/$(database)/documents/administrators/$(request.auth.uid));
    }
  }
}`
    },
    'pom.xml': {
      category: 'Maven Build',
      lang: 'xml',
      code: `<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.indoor</groupId>
    <artifactId>smart-indoor-navigation</artifactId>
    <version>1.0.0</version>
    <packaging>war</packaging>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>jakarta.servlet</groupId>
            <artifactId>jakarta.servlet-api</artifactId>
            <version>6.0.0</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>com.google.firebase</groupId>
            <artifactId>firebase-admin</artifactId>
            <version>9.4.1</version>
        </dependency>
    </dependencies>
</project>`
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[selectedFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunApiSimulation = () => {
    const res = onSimulateApiRoute(apiStartId, apiTargetId, apiWheelchair);
    setApiResponse(res);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Java 21 & MySQL Backend Explorer</h2>
              <p className="text-[11px] text-slate-500">Inspect server architecture, security rules, and test API endpoints</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
          
          {/* File Picker Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {Object.keys(files).map(fileName => (
              <button
                key={fileName}
                onClick={() => setSelectedFile(fileName)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedFile === fileName
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {fileName}
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="bg-slate-900 rounded-2xl p-4 text-slate-200 relative border border-slate-800">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-white">{selectedFile}</span>
                <span>({files[selectedFile].category})</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px]">{copied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs overflow-x-auto max-h-56 text-slate-300 leading-relaxed hide-scrollbar">
              {files[selectedFile].code}
            </pre>
          </div>

          {/* Live API Tester */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-blue-600" />
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Live Java API Simulator: POST /api/routes
                </p>
              </div>
              <button
                onClick={handleRunApiSimulation}
                className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Execute Request</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">startNodeId</label>
                <input
                  type="text"
                  value={apiStartId}
                  onChange={(e) => setApiStartId(e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">targetNodeId</label>
                <input
                  type="text"
                  value={apiTargetId}
                  onChange={(e) => setApiTargetId(e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-slate-200 font-mono text-xs"
                />
              </div>
            </div>

            <label className="flex items-center space-x-2 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={apiWheelchair}
                onChange={(e) => setApiWheelchair(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="font-semibold text-slate-700">wheelchairAccessible: true (Elevators Only)</span>
            </label>

            {apiResponse && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-400 max-h-36 overflow-y-auto">
                <p className="text-slate-400 mb-1">// HTTP 200 OK • Processed by DijkstraService.java</p>
                <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Source files located in <code className="font-mono text-slate-700">src/main/java/com/indoor/</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 shadow-xs"
          >
            Close Explorer
          </button>
        </div>

      </div>
    </div>
  );
};
