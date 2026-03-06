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

    // Load architecture data on open
    this._loadArchitecture();

    // Handle messages from the webview
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
            vscode.window.showErrorMessage(`Could not open file: ${message.path}`);
          }
          break;
        }
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
        content?: { nodes: { id: string; label: string; type: string; description: string; files: string[] }[]; techStack: Record<string, string>; summary: string };
        nodes?: { id: string; label: string; type: string; description: string; files: string[] }[];
        techStack?: Record<string, string>;
        summary?: string;
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
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      padding: 12px;
      margin: 0;
    }
    h2 { font-size: 14px; margin: 0 0 12px; }
    .status {
      padding: 8px 12px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      border-radius: 4px;
      font-size: 12px;
      margin-bottom: 12px;
    }
    .section {
      margin-bottom: 16px;
    }
    .section-title {
      font-size: 11px;
      text-transform: uppercase;
      opacity: 0.7;
      margin-bottom: 6px;
    }
    button {
      width: 100%;
      padding: 8px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      margin-bottom: 6px;
    }
    button:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .node-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .node-item {
      padding: 6px 8px;
      font-size: 12px;
      border-radius: 4px;
      margin-bottom: 2px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .node-item:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .node-badge {
      font-size: 9px;
      padding: 1px 4px;
      border-radius: 3px;
      text-transform: uppercase;
      font-weight: bold;
    }
    .tech-tag {
      display: inline-block;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 3px;
      background: var(--vscode-badge-background);
      color: var(--vscode-badge-foreground);
      margin: 2px;
    }
    .summary {
      font-size: 12px;
      opacity: 0.8;
      line-height: 1.4;
      margin-bottom: 12px;
    }
    .loading {
      text-align: center;
      font-size: 12px;
      opacity: 0.6;
      padding: 20px 0;
    }
    #map-container {
      min-height: 60px;
    }
  </style>
</head>
<body>
  <h2>AutoDev Explorer</h2>

  <div class="status" id="status-bar">
    Connect a repo to get started
  </div>

  <div id="summary-section" style="display:none">
    <div class="summary" id="summary-text"></div>
  </div>

  <div class="section" id="tech-section" style="display:none">
    <div class="section-title">Tech Stack</div>
    <div id="tech-tags"></div>
  </div>

  <div class="section">
    <div class="section-title">Architecture Map</div>
    <div id="map-container">
      <div class="loading" id="loading-msg" style="display:none">Loading...</div>
      <ul class="node-list" id="node-list"></ul>
      <div class="loading" id="empty-msg">No repo analyzed yet</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Quick Actions</div>
    <button onclick="askQuestion()">Ask About This Codebase</button>
    <button onclick="refreshData()">Refresh Architecture</button>
    <button onclick="startWalkthrough()">Start a Walkthrough</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const nodeColors = {
      entry: '#f59e0b', module: '#3b82f6', service: '#10b981',
      config: '#8b5cf6', util: '#6366f1', database: '#ec4899', external: '#ef4444'
    };

    function askQuestion() {
      vscode.postMessage({ type: 'askQuestion' });
    }

    function refreshData() {
      vscode.postMessage({ type: 'refresh' });
    }

    function startWalkthrough() {
      vscode.postMessage({ type: 'startWalkthrough' });
    }

    function openFile(path) {
      vscode.postMessage({ type: 'openFile', path: path });
    }

    window.addEventListener('message', (event) => {
      const msg = event.data;

      if (msg.type === 'loading') {
        document.getElementById('loading-msg').style.display = 'block';
        document.getElementById('empty-msg').style.display = 'none';
        document.getElementById('node-list').innerHTML = '';
        document.getElementById('status-bar').textContent = 'Loading architecture...';
      }

      if (msg.type === 'error') {
        document.getElementById('loading-msg').style.display = 'none';
        document.getElementById('empty-msg').style.display = 'block';
        document.getElementById('empty-msg').textContent = msg.message;
        document.getElementById('status-bar').textContent = 'Error loading data';
      }

      if (msg.type === 'architecture') {
        const data = msg.data;
        document.getElementById('loading-msg').style.display = 'none';
        document.getElementById('empty-msg').style.display = 'none';

        // Status
        document.getElementById('status-bar').textContent =
          (data.nodes ? data.nodes.length : 0) + ' modules detected';

        // Summary
        if (data.summary) {
          document.getElementById('summary-section').style.display = 'block';
          document.getElementById('summary-text').textContent = data.summary;
        }

        // Tech stack
        if (data.techStack && Object.keys(data.techStack).length > 0) {
          document.getElementById('tech-section').style.display = 'block';
          document.getElementById('tech-tags').innerHTML = Object.entries(data.techStack)
            .map(function(e) { return '<span class="tech-tag">' + e[0] + ': ' + e[1] + '</span>'; })
            .join('');
        }

        // Nodes
        if (data.nodes && data.nodes.length > 0) {
          const html = data.nodes.map(function(n) {
            const color = nodeColors[n.type] || '#6b7280';
            const filesStr = n.files ? ' (' + n.files.length + ' files)' : '';
            const hasFile = n.files && n.files[0];
            const clickAttr = hasFile
              ? ' onclick="openFile(\\'' + n.files[0].replace(/'/g, "\\\\'") + '\\')" style="cursor:pointer"'
              : ' style="cursor:default;opacity:0.8"';
            return '<li class="node-item"' + clickAttr + ' title="' +
              (n.description || '').replace(/"/g, '&quot;') + '">' +
              '<span class="node-badge" style="background:' + color + ';color:white">' + n.type + '</span>' +
              '<span>' + n.label + filesStr + '</span>' +
              '</li>';
          }).join('');
          document.getElementById('node-list').innerHTML = html;
        }
      }
    });
  </script>
</body>
</html>`;
  }
}
