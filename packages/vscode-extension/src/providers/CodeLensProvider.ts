import * as vscode from "vscode";
import { getArchitecture, getRepoId } from "../api/client";

interface ArchNode {
  id: string;
  label: string;
  type: string;
  description: string;
  files: string[];
}

interface ArchData {
  nodes?: ArchNode[];
  content?: { nodes: ArchNode[] };
}

export class AutoDevCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
  public readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  private _archNodes: ArchNode[] = [];
  private _lastFetch = 0;
  private readonly CACHE_TTL_MS = 60_000; // 1 min

  constructor() {
    // Refresh when settings change
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("autodev")) {
        this._archNodes = [];
        this._lastFetch = 0;
        this._onDidChangeCodeLenses.fire();
      }
    });
  }

  refresh() {
    this._archNodes = [];
    this._lastFetch = 0;
    this._onDidChangeCodeLenses.fire();
  }

  async provideCodeLenses(
    document: vscode.TextDocument
  ): Promise<vscode.CodeLens[]> {
    const repoId = getRepoId();
    if (!repoId) return [];

    const [owner, repo] = repoId.split("/");
    if (!owner || !repo) return [];

    // Load architecture nodes with cache
    try {
      const now = Date.now();
      if (this._archNodes.length === 0 || now - this._lastFetch > this.CACHE_TTL_MS) {
        const data = (await getArchitecture(owner, repo)) as ArchData;
        const archMap = data.content ?? data;
        this._archNodes = (archMap as { nodes?: ArchNode[] }).nodes ?? [];
        this._lastFetch = now;
      }
    } catch {
      return [];
    }

    const lenses: vscode.CodeLens[] = [];
    const filePath = vscode.workspace.asRelativePath(document.uri, false);

    for (const node of this._archNodes) {
      const nodeFiles: string[] = node.files || [];
      const isMatch = nodeFiles.some((f: string) => {
        const norm = f.replace(/\\/g, "/");
        const docNorm = filePath.replace(/\\/g, "/");
        return docNorm.endsWith(norm) || norm.endsWith(docNorm) || docNorm.includes(norm) || norm.includes(docNorm);
      });

      if (isMatch) {
        lenses.push(
          new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), {
            title: `$(compass) AutoDev: ${node.label} — ${node.type}`,
            command: "autodev.showNodeDetail",
            arguments: [node],
            tooltip: node.description || `View ${node.label} module details`,
          })
        );
      }
    }

    return lenses;
  }
}
