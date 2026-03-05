import * as vscode from "vscode";
import { getWalkthroughs, generateWalkthrough } from "../api/client";

interface WalkthroughStep {
  title: string;
  description: string;
  file?: string;
  lineStart?: number;
  lineEnd?: number;
  codeSnippet?: string;
  explanation: string;
}

interface Walkthrough {
  id?: string;
  title: string;
  description?: string;
  question?: string;
  difficulty?: string;
  estimatedMinutes?: number;
  steps: WalkthroughStep[];
}

export class WalkthroughPanel {
  public static currentPanel: WalkthroughPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(
    extensionUri: vscode.Uri,
    walkthrough?: Walkthrough
  ) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (WalkthroughPanel.currentPanel) {
      WalkthroughPanel.currentPanel._panel.reveal(column);
      if (walkthrough) {
        WalkthroughPanel.currentPanel._showWalkthrough(walkthrough);
      }
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "autodevWalkthrough",
      "AutoDev Walkthrough",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [extensionUri],
        retainContextWhenHidden: true,
      }
    );

    WalkthroughPanel.currentPanel = new WalkthroughPanel(
      panel,
      extensionUri,
      walkthrough
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    private readonly _extensionUri: vscode.Uri,
    walkthrough?: Walkthrough
  ) {
    this._panel = panel;
    this._panel.webview.html = this._getHtmlContent();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.type) {
          case "loadWalkthroughs":
            await this._loadWalkthroughs();
            break;
          case "generateWalkthrough":
            await this._generateWalkthrough(message.question);
            break;
          case "openFile":
            await this._openFile(message.path, message.line);
            break;
          case "selectWalkthrough":
            // Handled in webview
            break;
        }
      },
      null,
      this._disposables
    );

    if (walkthrough) {
      // Small delay to let webview initialize
      setTimeout(() => this._showWalkthrough(walkthrough), 300);
    } else {
      setTimeout(() => this._loadWalkthroughs(), 300);
    }
  }

  private _showWalkthrough(walkthrough: Walkthrough) {
    this._panel.webview.postMessage({
      type: "showWalkthrough",
      data: walkthrough,
    });
  }

  public sendGenerateRequest(question: string) {
    this._panel.webview.postMessage({ type: "triggerGenerate", question });
  }

  private async _loadWalkthroughs() {
    const repoId = vscode.workspace
      .getConfiguration("autodev")
      .get<string>("repoId");

    if (!repoId) {
      this._panel.webview.postMessage({
        type: "error",
        message: 'Set "autodev.repoId" in settings first (e.g., "owner/repo").',
      });
      return;
    }

    const [owner, repo] = repoId.split("/");
    if (!owner || !repo) return;

    this._panel.webview.postMessage({ type: "loading" });

    try {
      const data = (await getWalkthroughs(owner, repo)) as {
        walkthroughs?: Walkthrough[];
      };
      this._panel.webview.postMessage({
        type: "walkthroughsList",
        data: data.walkthroughs || [],
      });
    } catch {
      this._panel.webview.postMessage({
        type: "error",
        message: "Failed to load walkthroughs. Is the backend running?",
      });
    }
  }

  private async _generateWalkthrough(question: string) {
    const repoId = vscode.workspace
      .getConfiguration("autodev")
      .get<string>("repoId");

    if (!repoId) return;
    const [owner, repo] = repoId.split("/");
    if (!owner || !repo) return;

    this._panel.webview.postMessage({ type: "generating" });

    try {
      const data = (await generateWalkthrough(owner, repo, question)) as {
        walkthrough?: Walkthrough;
      };
      if (data.walkthrough) {
        this._panel.webview.postMessage({
          type: "showWalkthrough",
          data: data.walkthrough,
        });
      }
    } catch {
      this._panel.webview.postMessage({
        type: "error",
        message: "Failed to generate walkthrough.",
      });
    }
  }

  private async _openFile(path: string, line?: number) {
    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) return;

      const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, path);
      const doc = await vscode.workspace.openTextDocument(fileUri);
      const editor = await vscode.window.showTextDocument(
        doc,
        vscode.ViewColumn.One
      );

      if (line && line > 0) {
        const position = new vscode.Position(line - 1, 0);
        editor.selection = new vscode.Selection(position, position);
        editor.revealRange(
          new vscode.Range(position, position),
          vscode.TextEditorRevealType.InCenter
        );
      }
    } catch {
      vscode.window.showErrorMessage(`Could not open file: ${path}`);
    }
  }

  public dispose() {
    WalkthroughPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const d = this._disposables.pop();
      if (d) d.dispose();
    }
  }

  private _getHtmlContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutoDev Walkthrough</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 16px;
      margin: 0;
    }
    h1 { font-size: 18px; margin: 0 0 16px; }
    h2 { font-size: 15px; margin: 16px 0 8px; }
    .input-row {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    input {
      flex: 1;
      padding: 6px 10px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      font-size: 13px;
    }
    input:focus {
      outline: 1px solid var(--vscode-focusBorder);
    }
    button {
      padding: 6px 14px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      white-space: nowrap;
    }
    button:hover { background: var(--vscode-button-hoverBackground); }
    button:disabled { opacity: 0.5; cursor: default; }
    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .error {
      padding: 10px;
      background: var(--vscode-inputValidation-errorBackground);
      border: 1px solid var(--vscode-inputValidation-errorBorder);
      border-radius: 4px;
      font-size: 12px;
      margin-bottom: 12px;
    }
    .loading {
      text-align: center;
      padding: 32px;
      opacity: 0.7;
    }
    .list-item {
      padding: 10px 12px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      margin-bottom: 8px;
      cursor: pointer;
    }
    .list-item:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .list-title { font-size: 13px; font-weight: 600; }
    .list-desc { font-size: 11px; opacity: 0.7; margin-top: 2px; }
    .list-meta { font-size: 10px; opacity: 0.5; margin-top: 4px; }
    .badge {
      display: inline-block;
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 8px;
      margin-left: 6px;
    }
    .badge-beginner { background: #16a34a30; color: #4ade80; }
    .badge-intermediate { background: #ca8a0430; color: #facc15; }
    .badge-advanced { background: #dc262630; color: #f87171; }
    .step {
      padding: 12px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      margin-bottom: 12px;
    }
    .step-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .step-number {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      flex-shrink: 0;
    }
    .step-title { font-weight: 600; font-size: 13px; }
    .step-body { font-size: 12px; line-height: 1.5; }
    .file-link {
      display: inline-block;
      padding: 2px 8px;
      background: var(--vscode-badge-background);
      color: var(--vscode-textLink-foreground);
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      margin: 6px 0;
      text-decoration: none;
    }
    .file-link:hover { text-decoration: underline; }
    pre {
      background: var(--vscode-textCodeBlock-background);
      padding: 10px 12px;
      border-radius: 4px;
      font-size: 12px;
      overflow-x: auto;
      margin: 8px 0;
    }
    .progress {
      display: flex;
      gap: 3px;
      margin: 12px 0;
    }
    .progress-dot {
      flex: 1;
      height: 3px;
      border-radius: 2px;
      background: var(--vscode-panel-border);
    }
    .progress-dot.active { background: var(--vscode-button-background); }
    .nav-row {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
    }
    .empty {
      text-align: center;
      padding: 32px;
      opacity: 0.5;
    }
  </style>
</head>
<body>
  <div id="app">
    <div class="loading">Loading...</div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const app = document.getElementById('app');
    let walkthroughs = [];
    let currentWalkthrough = null;
    let currentStep = 0;

    function renderList() {
      let html = '<h1>Walkthroughs</h1>';
      html += '<div class="input-row">';
      html += '<input id="question" placeholder="How does authentication work?" />';
      html += '<button onclick="generate()">Generate</button>';
      html += '</div>';

      if (walkthroughs.length === 0) {
        html += '<div class="empty">No walkthroughs yet. Ask a question to generate one.</div>';
      } else {
        walkthroughs.forEach((w, i) => {
          const badge = w.difficulty ? '<span class="badge badge-' + w.difficulty + '">' + w.difficulty + '</span>' : '';
          html += '<div class="list-item" onclick="selectWalkthrough(' + i + ')">';
          html += '<div class="list-title">' + esc(w.title || 'Walkthrough ' + (i + 1)) + badge + '</div>';
          if (w.description) html += '<div class="list-desc">' + esc(w.description) + '</div>';
          html += '<div class="list-meta">' + (w.steps?.length || 0) + ' steps';
          if (w.estimatedMinutes) html += ' · ~' + w.estimatedMinutes + ' min';
          html += '</div></div>';
        });
      }
      app.innerHTML = html;
    }

    function renderWalkthrough() {
      if (!currentWalkthrough) return;
      const w = currentWalkthrough;
      const steps = w.steps || [];
      const step = steps[currentStep] || {};

      let html = '<button class="btn-secondary" onclick="backToList()" style="margin-bottom:12px">← Back</button>';
      html += '<h1>' + esc(w.title || 'Walkthrough') + '</h1>';
      if (w.description) html += '<p style="font-size:12px;opacity:0.7;margin:0 0 12px">' + esc(w.description) + '</p>';

      // Progress
      html += '<div class="progress">';
      for (let i = 0; i < steps.length; i++) {
        html += '<div class="progress-dot' + (i <= currentStep ? ' active' : '') + '"></div>';
      }
      html += '</div>';
      html += '<div style="font-size:11px;opacity:0.5;margin-bottom:12px">Step ' + (currentStep + 1) + ' of ' + steps.length + '</div>';

      // Current step
      html += '<div class="step">';
      html += '<div class="step-header">';
      html += '<div class="step-number">' + (currentStep + 1) + '</div>';
      html += '<div class="step-title">' + esc(step.title || '') + '</div>';
      html += '</div>';
      html += '<div class="step-body">' + esc(step.explanation || step.description || '') + '</div>';

      if (step.file) {
        const lineInfo = step.lineStart ? ':' + step.lineStart : '';
        html += '<a class="file-link" onclick="openFile(\'' + escAttr(step.file) + '\',' + (step.lineStart || 0) + ')">' + esc(step.file + lineInfo) + '</a>';
      }

      if (step.codeSnippet) {
        html += '<pre>' + esc(step.codeSnippet) + '</pre>';
      }
      html += '</div>';

      // Navigation
      html += '<div class="nav-row">';
      html += '<button class="btn-secondary"' + (currentStep === 0 ? ' disabled' : ' onclick="prevStep()"') + '>Previous</button>';
      html += '<button' + (currentStep >= steps.length - 1 ? ' disabled' : ' onclick="nextStep()"') + '>Next</button>';
      html += '</div>';

      app.innerHTML = html;
    }

    function selectWalkthrough(index) {
      currentWalkthrough = walkthroughs[index];
      currentStep = 0;
      renderWalkthrough();
    }

    function backToList() {
      currentWalkthrough = null;
      currentStep = 0;
      renderList();
    }

    function prevStep() {
      if (currentStep > 0) { currentStep--; renderWalkthrough(); }
    }

    function nextStep() {
      if (currentWalkthrough && currentStep < currentWalkthrough.steps.length - 1) {
        currentStep++;
        renderWalkthrough();
      }
    }

    function generate() {
      const q = document.getElementById('question')?.value;
      if (q && q.trim()) {
        vscode.postMessage({ type: 'generateWalkthrough', question: q.trim() });
      }
    }

    function openFile(path, line) {
      vscode.postMessage({ type: 'openFile', path, line });
    }

    function esc(str) {
      const d = document.createElement('div');
      d.textContent = str || '';
      return d.innerHTML;
    }

    function escAttr(str) {
      return (str || '').replace(/'/g, "\\\\'").replace(/"/g, '&quot;');
    }

    window.addEventListener('message', (event) => {
      const msg = event.data;
      switch (msg.type) {
        case 'loading':
          app.innerHTML = '<div class="loading">Loading walkthroughs...</div>';
          break;
        case 'generating':
          app.innerHTML = '<div class="loading">Generating walkthrough...</div>';
          break;
        case 'error':
          app.innerHTML = '<div class="error">' + esc(msg.message) + '</div>';
          break;
        case 'walkthroughsList':
          walkthroughs = msg.data || [];
          renderList();
          break;
        case 'showWalkthrough':
          currentWalkthrough = msg.data;
          currentStep = 0;
          // Also add to local list
          if (msg.data && !walkthroughs.find(w => w.id === msg.data.id)) {
            walkthroughs.push(msg.data);
          }
          renderWalkthrough();
          break;
        case 'triggerGenerate':
          // Pre-fill and auto-trigger a walkthrough generation from extension
          walkthroughs = [];
          renderList();
          setTimeout(() => {
            const qi = document.getElementById('question');
            if (qi) { qi.value = msg.question || ''; }
            generate();
          }, 100);
          break;
      }
    });

    // Initial load
    vscode.postMessage({ type: 'loadWalkthroughs' });
  </script>
</body>
</html>`;
  }
}
