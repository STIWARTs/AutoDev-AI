import * as vscode from "vscode";
import { getArchitecture } from "../api/client";

export class CodebaseExplorerProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlContent();
    this._loadArchitecture();

    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case "openFile": {
          if (!message.path) break;
          const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
          if (!workspaceFolder) break;
          try {
            const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, message.path);
            await vscode.window.showTextDocument(fileUri);
          } catch {
            vscode.window.showWarningMessage(`File not found in workspace: ${message.path}`);
          }
          break;
        }
        case "showNodeDetail":
          vscode.commands.executeCommand("autodev.showNodeDetail", message.node);
          break;
        case "askQuestion":
          vscode.commands.executeCommand("autodev.askQuestion");
          break;
        case "startWalkthrough":
          vscode.commands.executeCommand("autodev.startWalkthrough");
          break;
        case "refresh":
          this._loadArchitecture();
          break;
      }
    });
  }

  private async _loadArchitecture() {
    const repoId = vscode.workspace
      .getConfiguration("autodev")
      .get<string>("repoId");

    if (!repoId || !this._view) return;

    const [owner, repo] = repoId.split("/");
    if (!owner || !repo) return;

    this._view.webview.postMessage({ type: "loading" });

    try {
      const data = await getArchitecture(owner, repo) as {
        content?: {
          nodes: { id: string; label: string; type: string; description: string; files: string[] }[];
          edges?: { source: string; target: string; label?: string }[];
          techStack: Record<string, string>;
          summary: string;
          entryPoints?: string[];
          keyPatterns?: string[];
        };
        nodes?: { id: string; label: string; type: string; description: string; files: string[] }[];
        edges?: { source: string; target: string; label?: string }[];
        techStack?: Record<string, string>;
        summary?: string;
        entryPoints?: string[];
        keyPatterns?: string[];
      };
      const archMap = data.content ?? data;
      this._view.webview.postMessage({ type: "architecture", data: archMap });
    } catch {
      this._view.webview.postMessage({ type: "error", message: "Failed to load architecture. Is the backend running?" });
    }
  }

  private _getHtmlContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutoDev Explorer</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      padding: 0;
      margin: 0;
      overflow-x: hidden;
    }

    /* ── Header ── */
    .header {
      padding: 12px 14px 8px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .header h2 {
      font-size: 13px;
      margin: 0 0 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-pill {
      display: inline-block;
      padding: 3px 10px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
    }
    .summary-text {
      font-size: 11px;
      opacity: 0.75;
      line-height: 1.4;
      margin: 8px 0 0;
    }

    /* ── Tech Stack ── */
    .tech-section {
      padding: 8px 14px;
      border-bottom: 1px solid var(--vscode-panel-border);
      display: none;
    }
    .section-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      opacity: 0.5;
      margin-bottom: 6px;
    }
    .tech-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .tech-tag {
      font-size: 10px;
      padding: 2px 7px;
      border-radius: 3px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
    }

    /* ── Architecture Map ── */
    .map-section { padding: 10px 14px; }

    /* Flow diagram */
    .flow-diagram { position: relative; }
    .flow-layer {
      margin-bottom: 4px;
      position: relative;
    }
    .layer-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      opacity: 0.35;
      margin-bottom: 4px;
      padding-left: 2px;
    }
    .layer-nodes {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 2px;
    }

    /* Connector arrows between layers */
    .flow-connector {
      display: flex;
      justify-content: center;
      padding: 2px 0;
      opacity: 0.25;
    }
    .flow-connector svg { display: block; }

    /* Node card */
    .node-card {
      flex: 1;
      min-width: 100px;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 8px 10px;
      cursor: pointer;
      transition: all 0.15s ease;
      position: relative;
      overflow: hidden;
    }
    .node-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; bottom: 0;
      width: 3px;
      border-radius: 6px 0 0 6px;
    }
    .node-card:hover {
      border-color: var(--vscode-focusBorder);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .node-card.expanded {
      border-color: var(--vscode-focusBorder);
      background: var(--vscode-editor-inactiveSelectionBackground);
    }
    .node-card-header {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .node-icon {
      width: 22px;
      height: 22px;
      border-radius: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      flex-shrink: 0;
      color: white;
      font-weight: bold;
    }
    .node-info { flex: 1; min-width: 0; }
    .node-name {
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .node-type-label {
      font-size: 9px;
      opacity: 0.5;
      text-transform: uppercase;
    }
    .node-expand-icon {
      font-size: 10px;
      opacity: 0.4;
      transition: transform 0.2s;
    }
    .node-card.expanded .node-expand-icon {
      transform: rotate(90deg);
    }

    /* Expanded detail */
    .node-detail {
      display: none;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--vscode-panel-border);
    }
    .node-card.expanded .node-detail { display: block; }
    .node-desc {
      font-size: 11px;
      line-height: 1.4;
      opacity: 0.8;
      margin-bottom: 8px;
    }
    .node-files-title {
      font-size: 9px;
      text-transform: uppercase;
      opacity: 0.45;
      margin-bottom: 4px;
    }
    .node-file {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      padding: 2px 6px;
      margin-bottom: 2px;
      border-radius: 3px;
      cursor: pointer;
      font-family: var(--vscode-editor-font-family);
      color: var(--vscode-textLink-foreground);
    }
    .node-file:hover {
      background: var(--vscode-list-hoverBackground);
      text-decoration: underline;
    }
    .node-connections {
      margin-top: 6px;
    }
    .node-conn {
      font-size: 10px;
      opacity: 0.6;
      padding: 1px 0;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .conn-arrow { font-size: 9px; opacity: 0.4; }
    .conn-label {
      font-size: 9px;
      opacity: 0.4;
      font-style: italic;
    }
    .node-detail-btn {
      display: block;
      width: 100%;
      margin-top: 8px;
      padding: 4px 8px;
      font-size: 10px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 3px;
      cursor: pointer;
      text-align: center;
    }
    .node-detail-btn:hover {
      background: var(--vscode-button-hoverBackground);
    }

    /* Key Patterns */
    .patterns-section {
      padding: 8px 14px;
      border-top: 1px solid var(--vscode-panel-border);
      display: none;
    }
    .pattern-tag {
      display: inline-block;
      font-size: 10px;
      padding: 2px 8px;
      border-radius: 10px;
      border: 1px solid var(--vscode-panel-border);
      margin: 2px;
      opacity: 0.7;
    }

    /* ── Quick Actions ── */
    .actions-section {
      padding: 10px 14px;
      border-top: 1px solid var(--vscode-panel-border);
    }
    .action-btn {
      width: 100%;
      padding: 7px 10px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .action-btn:hover { background: var(--vscode-button-hoverBackground); }
    .action-btn.secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .action-btn.secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }

    /* ── States ── */
    .loading-state {
      text-align: center;
      padding: 40px 16px;
      opacity: 0.6;
    }
    .loading-spinner {
      width: 24px; height: 24px;
      border: 2px solid var(--vscode-panel-border);
      border-top-color: var(--vscode-button-background);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 10px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state {
      text-align: center;
      padding: 40px 16px;
      opacity: 0.5;
      font-size: 12px;
    }
    .error-state {
      padding: 12px;
      background: var(--vscode-inputValidation-errorBackground);
      border: 1px solid var(--vscode-inputValidation-errorBorder);
      border-radius: 4px;
      font-size: 11px;
      margin: 12px 14px;
    }

    /* Type colors */
    .type-entry { background: #f59e0b; }
    .type-module { background: #3b82f6; }
    .type-service { background: #10b981; }
    .type-config { background: #8b5cf6; }
    .type-util { background: #6366f1; }
    .type-database { background: #ec4899; }
    .type-external { background: #ef4444; }
    .border-entry::before { background: #f59e0b; }
    .border-module::before { background: #3b82f6; }
    .border-service::before { background: #10b981; }
    .border-config::before { background: #8b5cf6; }
    .border-util::before { background: #6366f1; }
    .border-database::before { background: #ec4899; }
    .border-external::before { background: #ef4444; }

    /* Legend */
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid var(--vscode-panel-border);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 9px;
      opacity: 0.5;
    }
    .legend-dot {
      width: 8px; height: 8px;
      border-radius: 2px;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <h2>AutoDev Explorer</h2>
    <span class="status-pill" id="status-pill">Connect a repo to get started</span>
    <div class="summary-text" id="summary-text" style="display:none"></div>
  </div>

  <!-- Tech Stack -->
  <div class="tech-section" id="tech-section">
    <div class="section-label">Tech Stack</div>
    <div class="tech-tags" id="tech-tags"></div>
  </div>

  <!-- Architecture Map -->
  <div class="map-section" id="map-section">
    <div class="section-label">Architecture Map</div>
    <div id="map-content">
      <div class="empty-state" id="empty-msg">No repo analyzed yet</div>
    </div>
  </div>

  <!-- Key Patterns -->
  <div class="patterns-section" id="patterns-section">
    <div class="section-label">Key Patterns</div>
    <div id="patterns-tags"></div>
  </div>

  <!-- Quick Actions -->
  <div class="actions-section">
    <button class="action-btn" onclick="askQuestion()">
      <span>💬</span> Ask About This Codebase
    </button>
    <button class="action-btn secondary" onclick="refreshData()">
      <span>🔄</span> Refresh Architecture
    </button>
    <button class="action-btn secondary" onclick="startWalkthrough()">
      <span>🚀</span> Start a Walkthrough
    </button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    var archData = null;
    var expandedNodeId = null;

    const typeIcons = {
      entry: '⚡', module: '📦', service: '⚙️',
      config: '🔧', util: '🔨', database: '🗄️', external: '🌐'
    };

    const layerOrder = ['entry', 'module', 'service', 'util', 'database', 'external', 'config'];
    const layerLabels = {
      entry: 'Entry Points',
      module: 'Core Modules',
      service: 'Services',
      util: 'Utilities',
      database: 'Data Layer',
      external: 'External',
      config: 'Configuration'
    };

    function askQuestion() { vscode.postMessage({ type: 'askQuestion' }); }
    function refreshData() { vscode.postMessage({ type: 'refresh' }); }
    function startWalkthrough() { vscode.postMessage({ type: 'startWalkthrough' }); }

    function openFile(path) {
      vscode.postMessage({ type: 'openFile', path: path });
    }

    function showAIDetail(nodeId) {
      if (!archData) return;
      var node = archData.nodes.find(function(n) { return n.id === nodeId; });
      if (node) {
        vscode.postMessage({ type: 'showNodeDetail', node: node });
      }
    }

    function toggleNode(nodeId) {
      expandedNodeId = (expandedNodeId === nodeId) ? null : nodeId;
      renderArchitecture();
    }

    function getConnectionsFor(nodeId) {
      if (!archData || !archData.edges) return { incoming: [], outgoing: [] };
      var incoming = [];
      var outgoing = [];
      archData.edges.forEach(function(e) {
        if (e.source === nodeId) {
          var target = archData.nodes.find(function(n) { return n.id === e.target; });
          if (target) outgoing.push({ node: target, label: e.label || '' });
        }
        if (e.target === nodeId) {
          var source = archData.nodes.find(function(n) { return n.id === e.source; });
          if (source) incoming.push({ node: source, label: e.label || '' });
        }
      });
      return { incoming: incoming, outgoing: outgoing };
    }

    function esc(str) {
      var d = document.createElement('div');
      d.textContent = str || '';
      return d.innerHTML;
    }

    function renderArchitecture() {
      if (!archData || !archData.nodes) return;

      var nodesByType = {};
      archData.nodes.forEach(function(n) {
        var t = n.type || 'module';
        if (!nodesByType[t]) nodesByType[t] = [];
        nodesByType[t].push(n);
      });

      var html = '<div class="flow-diagram">';
      var layersRendered = 0;

      layerOrder.forEach(function(type) {
        if (!nodesByType[type] || nodesByType[type].length === 0) return;

        if (layersRendered > 0) {
          html += '<div class="flow-connector">';
          html += '<svg width="20" height="16" viewBox="0 0 20 16"><path d="M10 0 L10 12 M6 8 L10 14 L14 8" stroke="currentColor" fill="none" stroke-width="1.5" opacity="0.4"/></svg>';
          html += '</div>';
        }

        html += '<div class="flow-layer">';
        html += '<div class="layer-label">' + esc(layerLabels[type] || type) + '</div>';
        html += '<div class="layer-nodes">';

        nodesByType[type].forEach(function(n) {
          var isExpanded = expandedNodeId === n.id;
          var conns = getConnectionsFor(n.id);

          html += '<div class="node-card border-' + n.type + (isExpanded ? ' expanded' : '') + '" onclick="toggleNode(\\'' + n.id + '\\')">';

          html += '<div class="node-card-header">';
          html += '<div class="node-icon type-' + n.type + '">' + (typeIcons[n.type] || '📦') + '</div>';
          html += '<div class="node-info">';
          html += '<div class="node-name">' + esc(n.label) + '</div>';
          html += '<div class="node-type-label">' + esc(n.type) + ' · ' + (n.files ? n.files.length : 0) + ' files</div>';
          html += '</div>';
          html += '<span class="node-expand-icon">▸</span>';
          html += '</div>';

          html += '<div class="node-detail">';
          html += '<div class="node-desc">' + esc(n.description) + '</div>';

          if (n.files && n.files.length > 0) {
            html += '<div class="node-files-title">Files</div>';
            n.files.forEach(function(f) {
              html += '<div class="node-file" onclick="event.stopPropagation(); openFile(\\'' + f.replace(/'/g, "\\\\'") + '\\')">';
              html += '📄 ' + esc(f);
              html += '</div>';
            });
          }

          if (conns.outgoing.length > 0 || conns.incoming.length > 0) {
            html += '<div class="node-connections">';
            html += '<div class="node-files-title">Connections</div>';
            conns.outgoing.forEach(function(c) {
              html += '<div class="node-conn">';
              html += '<span class="conn-arrow">→</span> ' + esc(c.node.label);
              if (c.label) html += ' <span class="conn-label">(' + esc(c.label) + ')</span>';
              html += '</div>';
            });
            conns.incoming.forEach(function(c) {
              html += '<div class="node-conn">';
              html += '<span class="conn-arrow">←</span> ' + esc(c.node.label);
              if (c.label) html += ' <span class="conn-label">(' + esc(c.label) + ')</span>';
              html += '</div>';
            });
            html += '</div>';
          }

          html += '<button class="node-detail-btn" onclick="event.stopPropagation(); showAIDetail(\\'' + n.id + '\\')">🤖 AI Explanation</button>';
          html += '</div>';

          html += '</div>';
        });

        html += '</div></div>';
        layersRendered++;
      });

      html += '</div>';

      // Legend
      html += '<div class="legend">';
      var legendTypes = [
        { type: 'entry', label: 'Entry' },
        { type: 'module', label: 'Module' },
        { type: 'service', label: 'Service' },
        { type: 'database', label: 'Database' },
        { type: 'external', label: 'External' },
        { type: 'config', label: 'Config' }
      ];
      legendTypes.forEach(function(lt) {
        html += '<div class="legend-item"><div class="legend-dot type-' + lt.type + '"></div>' + lt.label + '</div>';
      });
      html += '</div>';

      document.getElementById('map-content').innerHTML = html;
    }

    window.addEventListener('message', function(event) {
      var msg = event.data;

      if (msg.type === 'loading') {
        document.getElementById('map-content').innerHTML =
          '<div class="loading-state"><div class="loading-spinner"></div><div>Analyzing architecture...</div></div>';
        document.getElementById('status-pill').textContent = 'Loading...';
      }

      if (msg.type === 'error') {
        document.getElementById('map-content').innerHTML =
          '<div class="error-state">' + esc(msg.message) + '</div>';
        document.getElementById('status-pill').textContent = 'Error';
      }

      if (msg.type === 'architecture') {
        archData = msg.data;
        expandedNodeId = null;

        document.getElementById('status-pill').textContent =
          (archData.nodes ? archData.nodes.length : 0) + ' modules detected';

        if (archData.summary) {
          var el = document.getElementById('summary-text');
          el.style.display = 'block';
          el.textContent = archData.summary;
        }

        if (archData.techStack && Object.keys(archData.techStack).length > 0) {
          document.getElementById('tech-section').style.display = 'block';
          document.getElementById('tech-tags').innerHTML = Object.entries(archData.techStack)
            .map(function(e) { return '<span class="tech-tag">' + esc(e[0]) + ': ' + esc(e[1]) + '</span>'; })
            .join('');
        }

        if (archData.keyPatterns && archData.keyPatterns.length > 0) {
          document.getElementById('patterns-section').style.display = 'block';
          document.getElementById('patterns-tags').innerHTML = archData.keyPatterns
            .map(function(p) { return '<span class="pattern-tag">' + esc(p) + '</span>'; })
            .join('');
        }

        renderArchitecture();
      }
    });
  </script>
</body>
</html>`;
  }
}
