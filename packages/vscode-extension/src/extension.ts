import * as vscode from "vscode";
import { CodebaseExplorerProvider } from "./panels/CodebaseExplorer";
import { QAPanel } from "./panels/QAPanel";
import { WalkthroughPanel } from "./panels/WalkthroughPanel";
import { AutoDevCodeLensProvider } from "./providers/CodeLensProvider";
import { explainNode, getRepoId, getFresherMode } from "./api/client";

// ─── Git remote auto-detection ────────────────────────────────────────────────

async function detectRepoIdFromGit(): Promise<string | null> {
  try {
    const gitExt = vscode.extensions.getExtension("vscode.git");
    if (!gitExt) return null;
    const git = gitExt.isActive ? gitExt.exports : await gitExt.activate();
    const api = git.getAPI(1);
    const repos = api.repositories;
    if (!repos || repos.length === 0) return null;
    const remoteUrl: string =
      repos[0].state.remotes?.[0]?.fetchUrl ||
      repos[0].state.remotes?.[0]?.pushUrl ||
      "";
    // Parse github.com remote URL → owner/repo
    const match = remoteUrl.match(/github\.com[:/]([^/]+\/[^/.]+?)(?:\.git)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function resolveRepoId(): Promise<string | null> {
  const explicit = getRepoId();
  if (explicit) return explicit;
  return detectRepoIdFromGit();
}

// ─── Activation ───────────────────────────────────────────────────────────────

export function activate(context: vscode.ExtensionContext) {
  console.log("AutoDev extension activated");

  // Auto-detect repo ID on startup and write it to settings if not set
  resolveRepoId().then(async (detected) => {
    const cfg = vscode.workspace.getConfiguration("autodev");
    if (detected && !cfg.get<string>("repoId")) {
      await cfg.update("repoId", detected, vscode.ConfigurationTarget.Workspace);
      vscode.window.showInformationMessage(
        `AutoDev: Detected repository ${detected}. You can override this in settings (autodev.repoId).`
      );
    }
  });

  // Prompt for API token if not configured
  const hasToken = vscode.workspace
    .getConfiguration("autodev")
    .get<string>("apiToken");
  if (!hasToken) {
    vscode.window
      .showInformationMessage(
        "AutoDev: Add your API token from the web dashboard for authenticated access.",
        "Set Token",
        "Use Demo Mode"
      )
      .then((selection) => {
        if (selection === "Set Token") {
          vscode.commands.executeCommand(
            "workbench.action.openSettings",
            "autodev.apiToken"
          );
        }
      });
  }

  // ─── Providers ───────────────────────────────────────────────────────────

  const explorerProvider = new CodebaseExplorerProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "autodev.explorerView",
      explorerProvider
    )
  );

  const codeLensProvider = new AutoDevCodeLensProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { scheme: "file" },
      codeLensProvider
    )
  );

  // ─── Commands ────────────────────────────────────────────────────────────

  context.subscriptions.push(
    vscode.commands.registerCommand("autodev.showExplorer", () => {
      vscode.commands.executeCommand("autodev.explorerView.focus");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("autodev.askQuestion", async () => {
      QAPanel.createOrShow(context.extensionUri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("autodev.startWalkthrough", async () => {
      const question = await vscode.window.showInputBox({
        prompt: "What do you want to understand about this codebase?",
        placeHolder: "e.g., How does authentication work?",
      });
      WalkthroughPanel.createOrShow(context.extensionUri);
      if (question) {
        // Small delay so panel initialises before we send the generate message
        setTimeout(() => {
          WalkthroughPanel.currentPanel?.sendGenerateRequest(question);
        }, 400);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("autodev.showWalkthroughs", () => {
      WalkthroughPanel.createOrShow(context.extensionUri);
    })
  );

  // Show node detail — triggered from CodeLens
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "autodev.showNodeDetail",
      async (node: {
        id: string;
        label: string;
        type: string;
        description: string;
        files: string[];
      }) => {
        const repoIdStr = await resolveRepoId();
        if (!repoIdStr) {
          vscode.window.showWarningMessage(
            "AutoDev: Could not detect the repository. Set autodev.repoId in settings."
          );
          return;
        }
        const [owner, repo] = repoIdStr.split("/");

        const panel = vscode.window.createWebviewPanel(
          "autodevNodeDetail",
          `AutoDev: ${node.label}`,
          vscode.ViewColumn.Beside,
          { enableScripts: false }
        );

        panel.webview.html = buildNodeDetailHtml(
          node,
          "Loading AI explanation..."
        );

        try {
          const fresherMode = getFresherMode();
          const data = (await explainNode(owner, repo, node.id, fresherMode)) as {
            explanation: string;
          };
          panel.webview.html = buildNodeDetailHtml(
            node,
            data.explanation || node.description
          );
        } catch {
          panel.webview.html = buildNodeDetailHtml(
            node,
            node.description || "No explanation available."
          );
        }
      }
    )
  );

  // Refresh CodeLens
  context.subscriptions.push(
    vscode.commands.registerCommand("autodev.refreshCodeLens", () => {
      codeLensProvider.refresh();
      vscode.window.showInformationMessage("AutoDev: Architecture annotations refreshed");
    })
  );

  // Select language
  context.subscriptions.push(
    vscode.commands.registerCommand("autodev.selectLanguage", async () => {
      const LANGS = [
        { label: "English", code: "en" },
        { label: "हिन्दी (Hindi)", code: "hi" },
        { label: "தமிழ் (Tamil)", code: "ta" },
        { label: "తెలుగు (Telugu)", code: "te" },
        { label: "ಕನ್ನಡ (Kannada)", code: "kn" },
        { label: "বাংলা (Bengali)", code: "bn" },
        { label: "मराठी (Marathi)", code: "mr" },
      ];
      const pick = await vscode.window.showQuickPick(LANGS, {
        placeHolder: "Select language for AI responses",
      });
      if (pick) {
        await vscode.workspace
          .getConfiguration("autodev")
          .update("language", pick.code, true);
        vscode.window.showInformationMessage(
          `AutoDev: Language set to ${pick.label}`
        );
        codeLensProvider.refresh();
      }
    })
  );

  // Set API token command
  context.subscriptions.push(
    vscode.commands.registerCommand("autodev.setApiToken", async () => {
      const token = await vscode.window.showInputBox({
        prompt: "Paste your AutoDev API token from the web dashboard (Settings → API Token)",
        placeHolder: "sk-...",
        password: true,
      });
      if (token !== undefined) {
        await vscode.workspace
          .getConfiguration("autodev")
          .update("apiToken", token, true);
        vscode.window.showInformationMessage(
          token
            ? "AutoDev: API token saved. You now have authenticated access."
            : "AutoDev: API token cleared. Running in demo mode."
        );
        codeLensProvider.refresh();
      }
    })
  );

  // ─── Status bar ───────────────────────────────────────────────────────────

  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBar.text = "$(compass) AutoDev";
  statusBar.tooltip = "AutoDev Codebase Onboarding — click to open explorer";
  statusBar.command = "autodev.showExplorer";
  statusBar.show();
  context.subscriptions.push(statusBar);

  // Update status bar to show repo
  resolveRepoId().then((r) => {
    if (r) statusBar.text = `$(compass) AutoDev: ${r}`;
  });
}

// ─── Node detail HTML ──────────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildNodeDetailHtml(
  node: {
    id: string;
    label: string;
    type: string;
    description: string;
    files: string[];
  },
  explanation: string
): string {
  const safeLabel = escapeHtml(node.label || "");
  const safeType = escapeHtml(node.type || "");
  const safeExplanation = escapeHtml(explanation || "");
  const filesList = (node.files || [])
    .map((f) => `<li><code>${escapeHtml(f)}</code></li>`)
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
<style>
  body {
    font-family: var(--vscode-font-family);
    padding: 20px;
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
    max-width: 680px;
  }
  .header { margin-bottom: 20px; }
  h1 { font-size: 1.4em; margin: 0 0 4px; }
  .type-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 12px;
    background: var(--vscode-badge-background);
    color: var(--vscode-badge-foreground);
    margin-bottom: 16px;
  }
  .section { margin-bottom: 20px; }
  .section-title {
    font-size: 11px;
    text-transform: uppercase;
    opacity: 0.6;
    margin-bottom: 8px;
    letter-spacing: 0.1em;
  }
  .explanation {
    line-height: 1.6;
    white-space: pre-line;
    font-size: 13px;
    background: var(--vscode-editor-inactiveSelectionBackground);
    padding: 12px 16px;
    border-radius: 6px;
    border-left: 3px solid var(--vscode-button-background);
  }
  code {
    background: var(--vscode-textCodeBlock-background);
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 0.9em;
    font-family: var(--vscode-editor-font-family);
  }
  ul { padding-left: 20px; margin: 0; }
  li { margin-bottom: 4px; font-size: 12px; }
  .loading { opacity: 0.5; font-style: italic; }
</style>
</head>
<body>
  <div class="header">
    <h1>${safeLabel}</h1>
    <div class="type-badge">${safeType}</div>
  </div>
  <div class="section">
    <div class="section-title">AI Explanation</div>
    <div class="explanation ${explanation === "Loading AI explanation..." ? "loading" : ""}">${safeExplanation}</div>
  </div>
  ${filesList ? `<div class="section"><div class="section-title">Files</div><ul>${filesList}</ul></div>` : ""}
</body>
</html>`;
}

export function deactivate() {
  console.log("AutoDev extension deactivated");
}
