import * as vscode from "vscode";
import { askQuestion, getLanguage, getFresherMode } from "../api/client";

export class QAPanel {
  public static currentPanel: QAPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.webview.html = this._getHtmlContent();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.type) {
          case "ask": {
            const repoId = this._getRepoId();
            if (!repoId) {
              this._panel.webview.postMessage({
                type: "answer",
                data: {
                  answer: "No repository detected. Open a Git repository to use Q&A.",
                  relevantFiles: [],
                  relatedQuestions: [],
                },
              });
              return;
            }
            const [owner, repo] = repoId.split("/");
            this._panel.webview.postMessage({ type: "loading" });
            try {
              const language = getLanguage();
              const fresherMode = getFresherMode();
              const response = await askQuestion(owner, repo, message.question, language, fresherMode) as {
                answer: string;
                relevantFiles?: { path: string; lineRange?: { start: number; end: number } }[];
                relatedQuestions?: string[];
              };
              this._panel.webview.postMessage({
                type: "answer",
                data: {
                  answer: response.answer,
                  relevantFiles: response.relevantFiles ?? [],
                  relatedQuestions: response.relatedQuestions ?? [],
                },
              });
            } catch (err) {
              this._panel.webview.postMessage({
                type: "answer",
                data: {
                  answer: `Error: ${err instanceof Error ? err.message : "Failed to get a response. Is the backend running?"}`,
                  relevantFiles: [],
                  relatedQuestions: [],
                },
              });
            }
            break;
          }
          case "openFile": {
            if (!message.path) break;
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) break;
            try {
              const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, message.path);
              const doc = await vscode.workspace.openTextDocument(fileUri);
              const editor = await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
              if (message.line && message.line > 0) {
                const position = new vscode.Position(message.line - 1, 0);
                editor.selection = new vscode.Selection(position, position);
                editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
              }
            } catch {
              vscode.window.showErrorMessage(`Could not open file: ${message.path}`);
            }
            break;
          }
          case "askRelated": {
            this._panel.webview.postMessage({ type: "fillQuestion", question: message.question });
            break;
          }
        }
      },
      null,
      this._disposables
    );
  }

  public static createOrShow(extensionUri: vscode.Uri) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (QAPanel.currentPanel) {
      QAPanel.currentPanel._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      "autodevQA",
      "AutoDev Q&A",
      column || vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true }
    );

    QAPanel.currentPanel = new QAPanel(panel, extensionUri);
  }

  public dispose() {
    QAPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const d = this._disposables.pop();
      if (d) d.dispose();
    }
  }

  private _getRepoId(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders?.[0]) return undefined;
    // Try to derive owner/repo from the git remote
    // For now, use the workspace folder name as a fallback
    return vscode.workspace
      .getConfiguration("autodev")
      .get<string>("repoId");
  }

  private _getHtmlContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutoDev Q&A</title>
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 16px;
      margin: 0;
    }
    h2 { margin: 0 0 16px; font-size: 16px; }
    #messages {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 12px;
      min-height: 300px;
    }
    .message {
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 8px;
      font-size: 13px;
      line-height: 1.5;
    }
    .user-msg {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      margin-left: 40px;
    }
    .ai-msg {
      background: var(--vscode-editor-inactiveSelectionBackground);
      margin-right: 40px;
      white-space: pre-wrap;
    }
    .loading-msg {
      text-align: center;
      padding: 12px;
      opacity: 0.6;
      font-size: 12px;
      font-style: italic;
    }
    .loading-msg::after {
      content: '';
      animation: dots 1.5s steps(3, end) infinite;
    }
    @keyframes dots {
      0% { content: ''; }
      33% { content: '.'; }
      66% { content: '..'; }
      100% { content: '...'; }
    }
    .relevant-files {
      margin-top: 8px;
      padding: 6px 0;
    }
    .relevant-files-title {
      font-size: 10px;
      text-transform: uppercase;
      opacity: 0.6;
      margin-bottom: 4px;
    }
    .file-link {
      display: inline-block;
      padding: 2px 8px;
      background: var(--vscode-badge-background);
      color: var(--vscode-textLink-foreground);
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      margin: 2px 4px 2px 0;
      text-decoration: none;
      font-family: var(--vscode-editor-font-family);
    }
    .file-link:hover { text-decoration: underline; }
    .related-questions {
      margin-top: 6px;
      padding: 4px 0;
    }
    .related-btn {
      display: block;
      width: 100%;
      text-align: left;
      padding: 5px 10px;
      background: transparent;
      color: var(--vscode-textLink-foreground);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      margin-bottom: 4px;
    }
    .related-btn:hover {
      background: var(--vscode-list-hoverBackground);
    }
    .input-row {
      display: flex;
      gap: 8px;
    }
    input {
      flex: 1;
      padding: 8px 12px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 4px;
      font-size: 13px;
    }
    input:focus { outline: 1px solid var(--vscode-focusBorder); }
    button.send-btn {
      padding: 8px 16px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button.send-btn:hover { background: var(--vscode-button-hoverBackground); }
    .empty-state {
      text-align: center;
      padding: 24px 0;
      font-size: 13px;
    }
    .empty-state p { opacity: 0.5; margin-bottom: 16px; }
    .suggestions { display: flex; flex-direction: column; gap: 8px; }
    .suggest-btn {
      display: block;
      width: 100%;
      text-align: left;
      padding: 10px 14px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      color: var(--vscode-foreground);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      line-height: 1.4;
      transition: background 0.15s;
    }
    .suggest-btn:hover { background: var(--vscode-list-hoverBackground); }
    .suggest-lang { font-size: 10px; opacity: 0.5; text-transform: uppercase; margin-bottom: 2px; }
  </style>
</head>
<body>
  <h2>Ask About This Codebase</h2>
  <div id="messages">
    <div class="empty-state">
      <p>Ask any question about this codebase — try a suggestion below:</p>
      <div class="suggestions">
        <button class="suggest-btn" onclick="askRelated('How does the authentication flow work in this app?')"><div class="suggest-lang">English</div>How does the authentication flow work in this app?</button>
        <button class="suggest-btn" onclick="askRelated('इस ऐप में बैकएंड और फ्रंटएंड कैसे जुड़े हैं?')"><div class="suggest-lang">Hindi</div>इस ऐप में बैकएंड और फ्रंटएंड कैसे जुड़े हैं?</button>
        <button class="suggest-btn" onclick="askRelated('இந்த செயலியின் API அமைப்பு எப்படி செயல்படுகிறது?')"><div class="suggest-lang">Tamil</div>இந்த செயலியின் API அமைப்பு எப்படி செயல்படுகிறது?</button>
        <button class="suggest-btn" onclick="askRelated('এই অ্যাপে ডেটাবেস কানেকশন কীভাবে কাজ করে?')"><div class="suggest-lang">Bengali</div>এই অ্যাপে ডেটাবেস কানেকশন কীভাবে কাজ করে?</button>
      </div>
    </div>
  </div>
  <div class="input-row">
    <input type="text" id="question" placeholder="e.g., How does authentication work?" />
    <button class="send-btn" onclick="sendQuestion()">Ask</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const messagesDiv = document.getElementById('messages');
    const questionInput = document.getElementById('question');
    let firstMessage = true;

    function sendQuestion() {
      const question = questionInput.value.trim();
      if (!question) return;

      if (firstMessage) {
        messagesDiv.innerHTML = '';
        firstMessage = false;
      }

      messagesDiv.innerHTML += '<div class="message user-msg">' + escapeHtml(question) + '</div>';
      questionInput.value = '';

      vscode.postMessage({ type: 'ask', question });
    }

    function openFile(path, line) {
      vscode.postMessage({ type: 'openFile', path: path, line: line || 0 });
    }

    function askRelated(question) {
      questionInput.value = question;
      sendQuestion();
    }

    questionInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') sendQuestion();
    });

    window.addEventListener('message', function(event) {
      const msg = event.data;

      if (msg.type === 'loading') {
        var existingLoader = document.getElementById('loading-indicator');
        if (!existingLoader) {
          if (firstMessage) {
            messagesDiv.innerHTML = '';
            firstMessage = false;
          }
          messagesDiv.innerHTML += '<div class="loading-msg" id="loading-indicator">Thinking</div>';
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
      }

      if (msg.type === 'answer') {
        var loader = document.getElementById('loading-indicator');
        if (loader) loader.remove();

        var html = '<div class="message ai-msg">' + escapeHtml(msg.data.answer) + '</div>';

        if (msg.data.relevantFiles && msg.data.relevantFiles.length > 0) {
          html += '<div class="relevant-files"><div class="relevant-files-title">Referenced Files</div>';
          msg.data.relevantFiles.forEach(function(f) {
            var lineInfo = f.lineRange ? ':' + f.lineRange.start : '';
            var lineNum = f.lineRange ? f.lineRange.start : 0;
            html += '<span class="file-link" onclick="openFile(\\'' + escapeAttr(f.path) + '\\',' + lineNum + ')">' + escapeHtml(f.path + lineInfo) + '</span>';
          });
          html += '</div>';
        }

        if (msg.data.relatedQuestions && msg.data.relatedQuestions.length > 0) {
          html += '<div class="related-questions">';
          msg.data.relatedQuestions.forEach(function(q) {
            html += '<button class="related-btn" onclick="askRelated(\\'' + escapeAttr(q) + '\\')">' + escapeHtml(q) + '</button>';
          });
          html += '</div>';
        }

        messagesDiv.innerHTML += html;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }

      if (msg.type === 'fillQuestion') {
        questionInput.value = msg.question || '';
        questionInput.focus();
      }
    });

    function escapeHtml(text) {
      var div = document.createElement('div');
      div.textContent = text || '';
      return div.innerHTML;
    }

    function escapeAttr(str) {
      return (str || '').replace(/\\\\/g, '\\\\\\\\').replace(/'/g, "\\\\'").replace(/"/g, '&quot;');
    }
  </script>
</body>
</html>`;
  }
}
