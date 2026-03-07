import * as vscode from "vscode";
import { getArchitecture } from "../api/client";

export class CodeCanvasPanel {
  public static currentPanel: CodeCanvasPanel | undefined;

  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.ViewColumn.Beside
      : vscode.ViewColumn.One;

    if (CodeCanvasPanel.currentPanel) {
      CodeCanvasPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "autodevCodeCanvas",
      "AutoDev · Code Canvas",
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [extensionUri],
      }
    );

    CodeCanvasPanel.currentPanel = new CodeCanvasPanel(panel, extensionUri);
  }

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.webview.html = this._getHtml();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (msg) => {
        switch (msg.type) {
          case "ready":
            await this._loadData();
            break;

          case "openFile": {
            if (!msg.path) break;
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) break;
            try {
              const uri = vscode.Uri.joinPath(workspaceFolder.uri, msg.path);
              await vscode.window.showTextDocument(uri, {
                preview: true,
                viewColumn: vscode.ViewColumn.One,
              });
            } catch {
              vscode.window.showWarningMessage(
                `AutoDev: File not found in workspace: ${msg.path}`
              );
            }
            break;
          }

          case "showNodeDetail":
            vscode.commands.executeCommand(
              "autodev.showNodeDetail",
              msg.node
            );
            break;

          case "refresh":
            await this._loadData();
            break;
        }
      },
      null,
      this._disposables
    );
  }

  private async _loadData() {
    const repoId = vscode.workspace
      .getConfiguration("autodev")
      .get<string>("repoId");

    if (!repoId) {
      this._panel.webview.postMessage({
        type: "error",
        message:
          'No repository configured. Set "autodev.repoId" in VS Code settings (e.g. owner/repo).',
      });
      return;
    }

    const [owner, repo] = repoId.split("/");
    if (!owner || !repo) {
      this._panel.webview.postMessage({
        type: "error",
        message: 'Invalid repoId format. Expected "owner/repo".',
      });
      return;
    }

    this._panel.webview.postMessage({ type: "loading", repoId });

    try {
      const data = (await getArchitecture(owner, repo)) as {
        content?: unknown;
        nodes?: unknown;
      };
      const arch = (data.content ?? data) as {
        nodes: {
          id: string;
          label: string;
          type: string;
          description: string;
          files: string[];
        }[];
        edges: { source: string; target: string; label?: string }[];
        summary?: string;
        techStack?: Record<string, string>;
      };
      this._panel.webview.postMessage({
        type: "architecture",
        data: arch,
        repoId,
      });
    } catch {
      this._panel.webview.postMessage({
        type: "error",
        message:
          "Failed to load architecture data. Check that the AutoDev backend is running.",
      });
    }
  }

  public dispose() {
    CodeCanvasPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      this._disposables.pop()?.dispose();
    }
  }

  private _getHtml(): string {
    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AutoDev Code Canvas</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #0d0d0c;
  color: #d4cfc8;
  font-family: var(--vscode-editor-font-family, 'Consolas', monospace);
  overflow: hidden;
  height: 100vh;
  display: flex;
  flex-direction: column;
  user-select: none;
}

/* ── Toolbar ── */
#toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: 38px;
  background: #0a0a09;
  border-bottom: 1px solid #1e1c1a;
  flex-shrink: 0;
}
#toolbar-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5f5a55;
}
#repo-name {
  font-size: 11px;
  color: #d4cfc8;
  font-weight: 600;
}
.toolbar-sep { width: 1px; height: 16px; background: #252320; }
.tb-btn {
  background: none;
  border: 1px solid #252320;
  color: #5f5a55;
  padding: 3px 8px;
  font-size: 10px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.1s;
  white-space: nowrap;
}
.tb-btn:hover { background: #1a1918; color: #d4cfc8; border-color: #3d3b38; }
.tb-btn.active { background: #1a1918; color: #d4cfc8; border-color: #3d3b38; }
#toolbar-stats {
  margin-left: auto;
  display: flex;
  gap: 10px;
  font-size: 9px;
  color: #3d3b38;
}
.stat-chip { display: flex; align-items: center; gap: 4px; }

/* ── Canvas container ── */
#canvas-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  cursor: grab;
}
#canvas-container.dragging { cursor: grabbing; }

/* ── Canvas wrapper (panned + zoomed) ── */
#canvas-wrapper {
  position: absolute;
  transform-origin: 0 0;
}

/* ── SVG edges layer ── */
#edges-svg {
  position: absolute;
  top: 0; left: 0;
  pointer-events: none;
  overflow: visible;
}

/* ── Node cards ── */
#nodes-layer { position: absolute; top: 0; left: 0; }

.node-card {
  position: absolute;
  width: 210px;
  background: #141311;
  border: 1px solid #252320;
  border-left: 3px solid var(--node-accent, #5f5a55);
  transition: border-color 0.12s, box-shadow 0.12s, opacity 0.12s;
  cursor: pointer;
}
.node-card:hover { border-color: var(--node-accent, #5f5a55) !important; }
.node-card.selected {
  border-color: var(--node-accent, #5f5a55) !important;
  box-shadow: 0 0 28px var(--node-glow, transparent);
  z-index: 10;
}
.node-card.dimmed { opacity: 0.22; }

.node-header { padding: 8px 10px 6px; }
.node-type-badge {
  display: inline-block;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 1px 5px;
  background: var(--node-badge-bg, #252320);
  color: var(--node-accent, #5f5a55);
  margin-bottom: 4px;
}
.node-label {
  font-size: 11px;
  font-weight: 600;
  color: #d4cfc8;
  line-height: 1.3;
}
.node-desc {
  font-size: 9px;
  color: #4a4845;
  margin-top: 2px;
  line-height: 1.4;
}
.node-divider { height: 1px; background: #1e1c1a; margin: 0 10px; }

.node-files { padding: 5px 10px 6px; }
.node-file {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px 0;
  font-size: 9px;
  color: #5f5a55;
  cursor: pointer;
  transition: color 0.1s;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.node-file:hover { color: #d4cfc8; text-decoration: underline; }
.file-dot { width: 5px; height: 5px; flex-shrink: 0; }
.more-files { font-size: 8px; color: #3d3b38; margin-top: 2px; }

.node-footer {
  display: flex;
  gap: 0;
  border-top: 1px solid #1e1c1a;
}
.node-action-btn {
  flex: 1;
  padding: 5px 0;
  background: none;
  border: none;
  font-size: 9px;
  font-family: inherit;
  color: #4a4845;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  letter-spacing: 0.04em;
}
.node-action-btn:hover { background: #1a1918; color: #d4cfc8; }
.node-action-btn + .node-action-btn { border-left: 1px solid #1e1c1a; }

/* ── Group labels ── */
.group-label {
  position: absolute;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  pointer-events: none;
}

/* ── Overlay states ── */
#overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0d0d0c;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.3s;
}
#overlay.hidden { opacity: 0; pointer-events: none; }

.overlay-content { text-align: center; }
.eq-bars { display: flex; align-items: flex-end; gap: 3px; height: 32px; margin: 0 auto 12px; width: 40px; }
.eq-bar {
  flex: 1;
  background: var(--vscode-button-background, #5b8dd9);
  transform-origin: bottom;
  animation: eqAnim 0.9s ease-in-out infinite;
}
@keyframes eqAnim {
  0%, 100% { transform: scaleY(0.2); }
  50% { transform: scaleY(1); }
}
.overlay-text { font-size: 11px; color: #5f5a55; font-family: inherit; }
.overlay-sub { font-size: 10px; color: #3d3b38; margin-top: 6px; max-width: 300px; }

/* ── Legend ── */
#legend {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: #0a0a09;
  border: 1px solid #1e1c1a;
  padding: 7px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 8px;
  pointer-events: none;
}
.legend-row { display: flex; align-items: center; gap: 14px; }
.legend-item { display: flex; align-items: center; gap: 5px; color: #4a4845; }
.legend-dot { width: 8px; height: 8px; flex-shrink: 0; }
.legend-line { width: 18px; height: 2px; flex-shrink: 0; }
</style>
</head>
<body>

<!-- Toolbar -->
<div id="toolbar">
  <span id="toolbar-title">Code Canvas</span>
  <div class="toolbar-sep"></div>
  <span id="repo-name">Loading...</span>
  <div class="toolbar-sep"></div>
  <button class="tb-btn" onclick="fitView()" title="Fit all nodes in view">⊞ Fit View</button>
  <button class="tb-btn" onclick="zoomIn()" title="Zoom in">＋</button>
  <button class="tb-btn" onclick="zoomOut()" title="Zoom out">－</button>
  <button class="tb-btn" onclick="resetZoom()" title="Reset zoom to 100%">100%</button>
  <div class="toolbar-sep"></div>
  <button class="tb-btn" onclick="clearSelection()" title="Deselect">Deselect</button>
  <button class="tb-btn" onclick="sendRefresh()" title="Reload architecture data">↻ Refresh</button>
  <div id="toolbar-stats">
    <span class="stat-chip" id="stat-modules"></span>
    <span class="stat-chip" id="stat-files"></span>
    <span class="stat-chip" id="stat-edges"></span>
  </div>
</div>

<!-- Canvas -->
<div id="canvas-container">
  <div id="canvas-wrapper">
    <svg id="edges-svg"></svg>
    <div id="nodes-layer"></div>
  </div>
  <!-- Overlay (loading / error) -->
  <div id="overlay">
    <div class="overlay-content">
      <div class="eq-bars" id="eq-bars">
        <div class="eq-bar" style="animation-delay:0s; height:45%"></div>
        <div class="eq-bar" style="animation-delay:0.12s; height:75%"></div>
        <div class="eq-bar" style="animation-delay:0.24s; height:100%"></div>
        <div class="eq-bar" style="animation-delay:0.36s; height:75%"></div>
        <div class="eq-bar" style="animation-delay:0.48s; height:45%"></div>
      </div>
      <div class="overlay-text" id="overlay-text">Initialising...</div>
      <div class="overlay-sub" id="overlay-sub"></div>
    </div>
  </div>
  <!-- Legend -->
  <div id="legend" style="display:none">
    <div class="legend-row">
      <div class="legend-item"><div class="legend-dot" style="background:#f59e0b"></div>Entry</div>
      <div class="legend-item"><div class="legend-dot" style="background:#5b8dd9"></div>Module</div>
      <div class="legend-item"><div class="legend-dot" style="background:#10b981"></div>Service</div>
      <div class="legend-item"><div class="legend-dot" style="background:#8b5cf6"></div>Config</div>
      <div class="legend-item"><div class="legend-dot" style="background:#ec4899"></div>Database</div>
      <div class="legend-item"><div class="legend-dot" style="background:#ef4444"></div>External</div>
    </div>
    <div class="legend-row">
      <div class="legend-item"><div class="legend-line" style="background:rgba(91,141,217,0.7)"></div>calls</div>
      <div class="legend-item"><div class="legend-line" style="background:rgba(16,185,129,0.7)"></div>writes / reads</div>
      <div class="legend-item"><div class="legend-line" style="background:rgba(255,255,255,0.18)"></div>imports</div>
    </div>
  </div>
</div>

<script>
/* ── VS Code API ── */
const vscode = acquireVsCodeApi();

/* ── Layout constants ── */
const COL_PITCH = 290;
const NODE_W    = 210;
const HEADER_H  = 64;
const FILE_ROW_H = 16;
const FOOTER_H  = 28;
const ROW_GAP   = 22;
const MAX_FILES = 9;
const START_X   = 40;
const START_Y   = 44;

const COLUMN_ORDER = {
  entry: 0, config: 1, module: 2, service: 3, util: 4, database: 5, external: 6
};
const TYPE_COLORS = {
  entry:    '#f59e0b',
  module:   '#5b8dd9',
  service:  '#10b981',
  config:   '#8b5cf6',
  util:     '#6366f1',
  database: '#ec4899',
  external: '#ef4444',
};
const TYPE_LABELS = {
  entry: 'Entry Points', module: 'Modules', service: 'Services',
  config: 'Config', util: 'Utilities', database: 'Databases', external: 'External APIs',
};
const FILE_COLORS = {
  ts:'#5b8dd9', tsx:'#61DAFB', js:'#f0c040', jsx:'#f0c040',
  css:'#e879a0', scss:'#e879a0', json:'#f59e0b', md:'#8A8480',
  sql:'#ec4899', prisma:'#5664d2', py:'#3b82f6', sh:'#22c55e',
  yml:'#f59e0b', yaml:'#f59e0b', env:'#8b5cf6',
};
const EDGE_COLORS = {
  calls:    'rgba(91,141,217,0.65)',
  writes:   'rgba(16,185,129,0.6)',
  reads:    'rgba(16,185,129,0.45)',
  configures: 'rgba(139,92,246,0.4)',
  default:  'rgba(255,255,255,0.14)',
};

/* ── State ── */
var archData = null;
var nodePositions = {};   // { [nodeId]: { x, y, w, h } }
var selectedNodeId = null;
var connectedNodeIds = new Set();

/* ── Pan / Zoom ── */
var zoom = 0.85, panX = START_X, panY = START_Y;
var dragging = false, dragStartX = 0, dragStartY = 0, dragPanX = 0, dragPanY = 0;

var container = document.getElementById('canvas-container');
var wrapper   = document.getElementById('canvas-wrapper');
var edgesSvg  = document.getElementById('edges-svg');
var nodesLayer = document.getElementById('nodes-layer');

function applyTransform() {
  wrapper.style.transform = 'translate(' + panX + 'px,' + panY + 'px) scale(' + zoom + ')';
}

container.addEventListener('wheel', function(e) {
  e.preventDefault();
  var factor = e.deltaY > 0 ? 0.9 : 1.11;
  var newZoom = Math.max(0.08, Math.min(3, zoom * factor));
  var rect = container.getBoundingClientRect();
  var cx = e.clientX - rect.left;
  var cy = e.clientY - rect.top;
  panX = cx - (cx - panX) * (newZoom / zoom);
  panY = cy - (cy - panY) * (newZoom / zoom);
  zoom = newZoom;
  applyTransform();
}, { passive: false });

container.addEventListener('mousedown', function(e) {
  if (e.target === container || e.target === wrapper || e.target === edgesSvg) {
    dragging = true;
    dragStartX = e.clientX; dragStartY = e.clientY;
    dragPanX = panX; dragPanY = panY;
    container.classList.add('dragging');
  }
});
document.addEventListener('mousemove', function(e) {
  if (!dragging) return;
  panX = dragPanX + (e.clientX - dragStartX);
  panY = dragPanY + (e.clientY - dragStartY);
  applyTransform();
});
document.addEventListener('mouseup', function() {
  dragging = false;
  container.classList.remove('dragging');
});

function fitView() {
  if (!archData || Object.keys(nodePositions).length === 0) return;
  var xs = [], ys = [];
  Object.values(nodePositions).forEach(function(p) {
    xs.push(p.x, p.x + p.w);
    ys.push(p.y, p.y + p.h);
  });
  var minX = Math.min.apply(null, xs), maxX = Math.max.apply(null, xs);
  var minY = Math.min.apply(null, ys), maxY = Math.max.apply(null, ys);
  var padX = 60, padY = 40;
  var contentW = maxX - minX + padX * 2;
  var contentH = maxY - minY + padY * 2;
  var rect = container.getBoundingClientRect();
  var zx = rect.width / contentW, zy = rect.height / contentH;
  zoom = Math.min(zx, zy, 1) * 0.92;
  panX = -minX * zoom + padX * zoom + (rect.width - contentW * zoom) / 2;
  panY = -minY * zoom + padY * zoom + (rect.height - contentH * zoom) / 2;
  applyTransform();
}
function zoomIn()    { zoom = Math.min(zoom * 1.2, 3);   applyTransform(); }
function zoomOut()   { zoom = Math.max(zoom * 0.83, 0.08); applyTransform(); }
function resetZoom() { zoom = 1; panX = START_X; panY = START_Y; applyTransform(); }
function clearSelection() { selectedNodeId = null; connectedNodeIds = new Set(); applyHighlight(); }
function sendRefresh() { vscode.postMessage({ type: 'refresh' }); }

/* ── Helpers ── */
function esc(s) {
  var d = document.createElement('div'); d.textContent = String(s || ''); return d.innerHTML;
}
function fileName(p) { return (String(p)).split('/').pop() || p; }
function fileExt(p)  { return (String(p)).split('.').pop().toLowerCase() || ''; }
function fileColor(p){ return FILE_COLORS[fileExt(p)] || '#4a4845'; }
function edgeColor(l){ return EDGE_COLORS[l] || EDGE_COLORS.default; }

function nodeH(fileCount) {
  var vis = Math.min(fileCount, MAX_FILES);
  var extra = fileCount > MAX_FILES ? 18 : 0;
  return HEADER_H + vis * FILE_ROW_H + extra + FOOTER_H;
}

/* ── Layout computation ── */
function computeLayout(nodes) {
  var cols = {};
  nodes.forEach(function(n) {
    var c = (COLUMN_ORDER[n.type] !== undefined) ? COLUMN_ORDER[n.type] : 2;
    if (!cols[c]) cols[c] = [];
    cols[c].push(n);
  });
  var positions = {};
  Object.keys(cols).sort(function(a,b){ return a-b; }).forEach(function(col) {
    var y = START_Y;
    cols[col].forEach(function(n) {
      var h = nodeH(n.files ? n.files.length : 0);
      positions[n.id] = { x: col * COL_PITCH + START_X, y: y, w: NODE_W, h: h };
      y += h + ROW_GAP;
    });
  });
  return positions;
}

/* ── SVG Edges ── */
function buildEdgePath(src, tgt) {
  var x1 = src.x + src.w;
  var y1 = src.y + src.h / 2;
  var x2 = tgt.x;
  var y2 = tgt.y + tgt.h / 2;

  // If target is to the LEFT of source (feedback edge), route around
  if (x2 <= x1) {
    var midY = Math.min(src.y, tgt.y) - 30;
    var mx1 = x1 + 40, mx2 = x2 - 40;
    return 'M ' + x1 + ' ' + y1 +
           ' C ' + mx1 + ' ' + y1 + ', ' + mx1 + ' ' + midY + ', ' +
           ((x1 + x2) / 2) + ' ' + midY +
           ' C ' + mx2 + ' ' + midY + ', ' + mx2 + ' ' + y2 + ', ' + x2 + ' ' + y2;
  }

  var mx = (x1 + x2) / 2;
  return 'M ' + x1 + ' ' + y1 +
         ' C ' + mx + ' ' + y1 + ', ' + mx + ' ' + y2 + ', ' + x2 + ' ' + y2;
}

function renderEdges() {
  if (!archData) return;
  var defs = '<defs>';
  ['calls','writes','reads','configures','default'].forEach(function(lbl) {
    var col = edgeColor(lbl).replace(/rgba\(/, '').split(',');
    var fill = 'rgb(' + col[0] + ',' + col[1] + ',' + col[2] + ')';
    defs += '<marker id="arr-' + lbl + '" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">';
    defs += '<path d="M0 0 L8 4 L0 8 z" fill="' + fill + '" opacity="0.7"/>';
    defs += '</marker>';
  });
  defs += '</defs>';

  var paths = '';
  archData.edges.forEach(function(e, i) {
    var src = nodePositions[e.source];
    var tgt = nodePositions[e.target];
    if (!src || !tgt) return;

    var lbl = e.label || 'default';
    var markerLbl = EDGE_COLORS[lbl] ? lbl : 'default';
    var col = edgeColor(lbl);
    var w = (lbl === 'calls' || lbl === 'writes') ? 2 : 1.4;
    var isHl = !selectedNodeId ||
      (connectedNodeIds.has(e.source) && connectedNodeIds.has(e.target));
    var op = isHl ? 1 : 0.06;

    paths += '<path id="edge-' + i + '" d="' + buildEdgePath(src, tgt) + '"' +
      ' stroke="' + col + '"' +
      ' stroke-width="' + w + '"' +
      ' fill="none"' +
      ' opacity="' + op + '"' +
      ' marker-end="url(#arr-' + markerLbl + ')"' +
      '/>';
  });

  // Total canvas size for SVG viewport
  var maxX = 0, maxY = 0;
  Object.values(nodePositions).forEach(function(p) {
    maxX = Math.max(maxX, p.x + p.w + 80);
    maxY = Math.max(maxY, p.y + p.h + 80);
  });

  edgesSvg.setAttribute('width', maxX);
  edgesSvg.setAttribute('height', maxY);
  edgesSvg.innerHTML = defs + paths;
}

/* ── Node Cards ── */
function renderNodes() {
  if (!archData) return;
  nodesLayer.innerHTML = '';

  // Group labels
  var typeGroups = {};
  archData.nodes.forEach(function(n) {
    if (!typeGroups[n.type]) typeGroups[n.type] = [];
    typeGroups[n.type].push(n);
  });
  Object.keys(typeGroups).forEach(function(type) {
    var col = (COLUMN_ORDER[type] !== undefined) ? COLUMN_ORDER[type] : 2;
    var x = col * COL_PITCH + START_X;
    var color = TYPE_COLORS[type] || '#5f5a55';
    var lbl = document.createElement('div');
    lbl.className = 'group-label';
    lbl.style.cssText = 'left:' + x + 'px; top:' + (START_Y - 20) + 'px; color:' + color + '80;';
    lbl.textContent = (TYPE_LABELS[type] || type).toUpperCase();
    nodesLayer.appendChild(lbl);
  });

  // Node cards
  archData.nodes.forEach(function(n) {
    var pos = nodePositions[n.id];
    if (!pos) return;

    var accent = TYPE_COLORS[n.type] || '#5f5a55';
    var files  = n.files || [];
    var visible = files.slice(0, MAX_FILES);
    var hidden  = files.length - visible.length;

    var isHl  = !selectedNodeId || connectedNodeIds.has(n.id);
    var isSel = n.id === selectedNodeId;

    var div = document.createElement('div');
    div.className = 'node-card' + (isSel ? ' selected' : '') + (!isHl ? ' dimmed' : '');
    div.id = 'nc-' + n.id;
    div.style.cssText = [
      'left:' + pos.x + 'px',
      'top:' + pos.y + 'px',
      'width:' + NODE_W + 'px',
      '--node-accent:' + accent,
      '--node-glow:' + accent + '28',
      '--node-badge-bg:' + accent + '18',
    ].join(';');

    // Header
    var filesHtml = visible.map(function(f) {
      var safeF = f.replace(/'/g, "\\'");
      return '<div class="node-file" onclick="event.stopPropagation(); openFile(\'' + safeF + '\')">' +
        '<span class="file-dot" style="background:' + fileColor(f) + '"></span>' +
        esc(fileName(f)) +
        '</div>';
    }).join('');
    if (hidden > 0) {
      filesHtml += '<div class="more-files">+' + hidden + ' more</div>';
    }
    if (files.length === 0) {
      filesHtml = '<div class="node-file" style="font-style:italic;color:#3d3b38">external</div>';
    }

    div.innerHTML =
      '<div class="node-header">' +
        '<div class="node-type-badge">' + esc(n.type) + '</div>' +
        '<div class="node-label">' + esc(n.label) + '</div>' +
        (n.description ? '<div class="node-desc">' + esc(n.description) + '</div>' : '') +
      '</div>' +
      '<div class="node-divider"></div>' +
      '<div class="node-files">' + filesHtml + '</div>' +
      '<div class="node-footer">' +
        '<button class="node-action-btn" onclick="event.stopPropagation(); openFirstFile(\'' + n.id + '\')">⎇ Open Files</button>' +
        '<button class="node-action-btn" onclick="event.stopPropagation(); explainNode(\'' + n.id + '\')">✦ AI Explain</button>' +
      '</div>';

    div.addEventListener('click', function() { selectNode(n.id); });
    nodesLayer.appendChild(div);
  });
}

/* ── Interaction ── */
function selectNode(nodeId) {
  if (selectedNodeId === nodeId) {
    selectedNodeId = null;
    connectedNodeIds = new Set();
  } else {
    selectedNodeId = nodeId;
    connectedNodeIds = new Set([nodeId]);
    if (archData && archData.edges) {
      archData.edges.forEach(function(e) {
        if (e.source === nodeId) connectedNodeIds.add(e.target);
        if (e.target === nodeId) connectedNodeIds.add(e.source);
      });
    }
  }
  applyHighlight();
}

function applyHighlight() {
  if (!archData) return;
  archData.nodes.forEach(function(n) {
    var el = document.getElementById('nc-' + n.id);
    if (!el) return;
    var isHl  = !selectedNodeId || connectedNodeIds.has(n.id);
    var isSel = n.id === selectedNodeId;
    el.className = 'node-card' + (isSel ? ' selected' : '') + (!isHl ? ' dimmed' : '');
  });
  renderEdges(); // re-render edges with new highlight state
}

function openFile(path) {
  vscode.postMessage({ type: 'openFile', path: path });
}

function openFirstFile(nodeId) {
  if (!archData) return;
  var node = archData.nodes.find(function(n) { return n.id === nodeId; });
  if (!node || !node.files || node.files.length === 0) return;
  vscode.postMessage({ type: 'openFile', path: node.files[0] });
}

function explainNode(nodeId) {
  if (!archData) return;
  var node = archData.nodes.find(function(n) { return n.id === nodeId; });
  if (node) vscode.postMessage({ type: 'showNodeDetail', node: node });
}

/* ── Render full canvas ── */
function renderCanvas() {
  if (!archData) return;
  nodePositions = computeLayout(archData.nodes);
  renderNodes();
  renderEdges();
  updateStats();

  // Auto-fit on first load
  setTimeout(fitView, 80);

  document.getElementById('legend').style.display = 'flex';
  hideOverlay();
}

function updateStats() {
  var totalFiles = (archData.nodes || []).reduce(function(s, n) {
    return s + (n.files ? n.files.length : 0);
  }, 0);
  document.getElementById('stat-modules').textContent =
    (archData.nodes ? archData.nodes.length : 0) + ' modules';
  document.getElementById('stat-files').textContent = totalFiles + ' files';
  document.getElementById('stat-edges').textContent =
    (archData.edges ? archData.edges.length : 0) + ' edges';
}

/* ── Overlay management ── */
function showOverlay(text, sub, showSpinner) {
  var overlay = document.getElementById('overlay');
  overlay.classList.remove('hidden');
  document.getElementById('overlay-text').textContent = text;
  document.getElementById('overlay-sub').textContent = sub || '';
  document.getElementById('eq-bars').style.display = showSpinner ? 'flex' : 'none';
}

function hideOverlay() {
  document.getElementById('overlay').classList.add('hidden');
}

/* ── Message handler ── */
window.addEventListener('message', function(event) {
  var msg = event.data;

  if (msg.type === 'loading') {
    document.getElementById('repo-name').textContent = msg.repoId || '...';
    showOverlay('Building canvas...', 'Fetching architecture from backend', true);
  }

  if (msg.type === 'error') {
    showOverlay('Unable to load canvas', msg.message || 'Unknown error', false);
  }

  if (msg.type === 'architecture') {
    archData = msg.data;
    document.getElementById('repo-name').textContent = msg.repoId || '';
    renderCanvas();
  }
});

/* ── Boot ── */
showOverlay('Connecting...', '', true);
vscode.postMessage({ type: 'ready' });
applyTransform();
</script>
</body>
</html>`;
  }
}
