import { describe, it, expect } from "vitest";
import {
  classifyArea,
  getAreasFromArchitecture,
  computeSkillScores,
  computeDeveloperProgress,
} from "../services/progressTracker.js";
import type {
  ProgressEvent,
  SkillArea,
  ArchitectureMap,
} from "@autodev/shared";

// --- classifyArea ---

describe("classifyArea", () => {
  it("classifies auth-related labels", () => {
    expect(classifyArea("AuthService")).toBe("auth");
    expect(classifyArea("jwt-middleware")).toBe("auth");
    expect(classifyArea("OAuth Handler")).toBe("auth");
    expect(classifyArea("login page")).toBe("auth");
    expect(classifyArea("session-manager")).toBe("auth");
  });

  it("classifies API-related labels", () => {
    expect(classifyArea("API Routes")).toBe("api");
    expect(classifyArea("userController")).toBe("api");
    expect(classifyArea("express-middleware")).toBe("api");
    expect(classifyArea("endpoint")).toBe("api");
  });

  it("classifies database-related labels", () => {
    expect(classifyArea("database config")).toBe("database");
    expect(classifyArea("User Model")).toBe("database");
    expect(classifyArea("migration-001")).toBe("database");
    expect(classifyArea("postgres-pool")).toBe("database");
    expect(classifyArea("DynamoDB tables")).toBe("database");
    expect(classifyArea("Redis cache")).toBe("database");
  });

  it("classifies frontend-related labels", () => {
    expect(classifyArea("React Component")).toBe("frontend");
    expect(classifyArea("HomePage")).toBe("frontend");
    expect(classifyArea("CSS Styles")).toBe("frontend");
    expect(classifyArea("Next.js pages")).toBe("frontend");
    expect(classifyArea("UI components")).toBe("frontend");
  });

  it("classifies infrastructure-related labels", () => {
    expect(classifyArea("Docker setup")).toBe("infrastructure");
    expect(classifyArea("CI/CD pipeline")).toBe("infrastructure");
    expect(classifyArea("AWS Lambda")).toBe("infrastructure");
    expect(classifyArea("Terraform modules")).toBe("infrastructure");
    expect(classifyArea("CDK stacks")).toBe("infrastructure");
    expect(classifyArea("deploy script")).toBe("infrastructure");
  });

  it("classifies testing-related labels", () => {
    expect(classifyArea("unit tests")).toBe("testing");
    expect(classifyArea("jest config")).toBe("testing");
    expect(classifyArea("e2e tests")).toBe("testing");
    expect(classifyArea("vitest setup")).toBe("testing");
  });

  it("classifies devops-related labels", () => {
    expect(classifyArea("monitoring setup")).toBe("devops");
    expect(classifyArea("logging service")).toBe("devops");
    expect(classifyArea("observability stack")).toBe("devops");
  });

  it("returns 'other' for unrecognized labels", () => {
    expect(classifyArea("README")).toBe("other");
    expect(classifyArea("utils")).toBe("other");
    expect(classifyArea("")).toBe("other");
    expect(classifyArea("random-stuff")).toBe("other");
  });

  it("is case-insensitive", () => {
    expect(classifyArea("AUTH")).toBe("auth");
    expect(classifyArea("Database")).toBe("database");
    expect(classifyArea("FRONTEND")).toBe("frontend");
  });
});

// --- getAreasFromArchitecture ---

describe("getAreasFromArchitecture", () => {
  it("maps architecture nodes to skill areas", () => {
    const archMap: ArchitectureMap = {
      nodes: [
        { id: "n1", label: "Auth Service", type: "service", files: [], description: "" },
        { id: "n2", label: "API Gateway", type: "service", files: [], description: "" },
        { id: "n3", label: "Database Layer", type: "database", files: [], description: "" },
        { id: "n4", label: "React Frontend", type: "module", files: [], description: "" },
      ],
      edges: [],
      techStack: {},
      summary: "",
    };

    const result = getAreasFromArchitecture(archMap);

    expect(result.get("auth")).toEqual(["n1"]);
    expect(result.get("api")).toEqual(["n2"]);
    expect(result.get("database")).toEqual(["n3"]);
    expect(result.get("frontend")).toEqual(["n4"]);
  });

  it("groups multiple nodes under the same area", () => {
    const archMap: ArchitectureMap = {
      nodes: [
        { id: "n1", label: "Auth middleware", type: "service", files: [], description: "" },
        { id: "n2", label: "Login handler", type: "service", files: [], description: "" },
        { id: "n3", label: "JWT utils", type: "service", files: [], description: "" },
      ],
      edges: [],
      techStack: {},
      summary: "",
    };

    const result = getAreasFromArchitecture(archMap);
    expect(result.get("auth")).toEqual(["n1", "n2", "n3"]);
  });

  it("handles empty architecture map", () => {
    const archMap: ArchitectureMap = { nodes: [], edges: [], techStack: {}, summary: "" };
    const result = getAreasFromArchitecture(archMap);
    expect(result.size).toBe(0);
  });
});

// --- computeSkillScores ---

function makeEvent(overrides: Partial<ProgressEvent> = {}): ProgressEvent {
  return {
    id: `evt-${Math.random().toString(36).slice(2)}`,
    userId: "user1",
    repoId: "owner/repo",
    eventType: "module_explored",
    targetId: "target1",
    targetLabel: "Auth Service",
    area: "auth" as SkillArea,
    timestamp: new Date().toISOString(),
    durationMs: 5000,
    ...overrides,
  };
}

describe("computeSkillScores", () => {
  it("returns scores for all 8 standard areas", () => {
    const events: ProgressEvent[] = [];
    const scores = computeSkillScores(events, null);
    expect(scores).toHaveLength(8);
    const areas = scores.map((s) => s.area);
    expect(areas).toContain("architecture");
    expect(areas).toContain("api");
    expect(areas).toContain("auth");
    expect(areas).toContain("database");
    expect(areas).toContain("frontend");
    expect(areas).toContain("infrastructure");
    expect(areas).toContain("testing");
    expect(areas).toContain("devops");
  });

  it("returns zero scores for empty events", () => {
    const scores = computeSkillScores([], null);
    for (const skill of scores) {
      expect(skill.score).toBe(0);
      expect(skill.modulesExplored).toBe(0);
    }
  });

  it("increases auth score with auth-area events", () => {
    const events = [
      makeEvent({ eventType: "module_explored", area: "auth", targetId: "auth1", targetLabel: "Auth" }),
      makeEvent({ eventType: "walkthrough_viewed", area: "auth", targetId: "auth-wt", targetLabel: "Auth walkthrough" }),
      makeEvent({ eventType: "qa_asked", area: "auth", targetId: "auth-qa", targetLabel: "What is JWT?" }),
    ];

    const scores = computeSkillScores(events, null);
    const authScore = scores.find((s) => s.area === "auth");
    expect(authScore).toBeDefined();
    expect(authScore!.score).toBeGreaterThan(0);
    expect(authScore!.modulesExplored).toBe(3);
  });

  it("caps score at 100", () => {
    // Create many events to exceed normal max
    const events: ProgressEvent[] = [];
    for (let i = 0; i < 50; i++) {
      events.push(
        makeEvent({
          eventType: "module_explored",
          area: "api",
          targetId: `api-${i}`,
          targetLabel: `API Module ${i}`,
        })
      );
    }

    const scores = computeSkillScores(events, null);
    const apiScore = scores.find((s) => s.area === "api");
    expect(apiScore!.score).toBeLessThanOrEqual(100);
  });

  it("deduplicates identical interactions", () => {
    const sameEvent = makeEvent({
      eventType: "module_explored",
      area: "database",
      targetId: "db1",
      targetLabel: "DB Model",
    });
    // Same event twice should count as 1 interaction
    const events = [sameEvent, { ...sameEvent }];

    const scores = computeSkillScores(events, null);
    const dbScore = scores.find((s) => s.area === "database");
    expect(dbScore!.modulesExplored).toBe(1);
  });

  it("uses architecture map for module coverage", () => {
    const archMap: ArchitectureMap = {
      nodes: [
        { id: "auth1", label: "Auth Service", type: "service", files: [], description: "" },
        { id: "auth2", label: "Auth Middleware", type: "service", files: [], description: "" },
        { id: "auth3", label: "Session Manager", type: "service", files: [], description: "" },
      ],
      edges: [],
      techStack: {},
      summary: "",
    };

    const events = [
      makeEvent({ eventType: "module_explored", area: "auth", targetId: "auth1", targetLabel: "Auth Service" }),
    ];

    const scores = computeSkillScores(events, archMap);
    const authScore = scores.find((s) => s.area === "auth");
    expect(authScore!.totalModules).toBe(3);
    expect(authScore!.modulesExplored).toBe(1);
  });
});

// --- computeDeveloperProgress ---

describe("computeDeveloperProgress", () => {
  it("returns zero progress for no events", () => {
    const progress = computeDeveloperProgress("user1", "owner/repo", [], null);
    expect(progress.userId).toBe("user1");
    expect(progress.repoId).toBe("owner/repo");
    expect(progress.overallScore).toBe(0);
    expect(progress.walkthroughsCompleted).toBe(0);
    expect(progress.questionsAsked).toBe(0);
    expect(progress.modulesExplored).toBe(0);
    expect(progress.totalTimeSpentMs).toBe(0);
    expect(progress.skills).toHaveLength(8);
    expect(progress.timeline).toHaveLength(0);
  });

  it("counts distinct walkthroughs completed", () => {
    const events = [
      makeEvent({ eventType: "walkthrough_viewed", targetId: "wt-1" }),
      makeEvent({ eventType: "walkthrough_viewed", targetId: "wt-1" }), // duplicate
      makeEvent({ eventType: "walkthrough_viewed", targetId: "wt-2" }),
    ];

    const progress = computeDeveloperProgress("user1", "owner/repo", events, null);
    expect(progress.walkthroughsCompleted).toBe(2);
  });

  it("counts questions asked", () => {
    const events = [
      makeEvent({ eventType: "qa_asked", targetLabel: "Q1" }),
      makeEvent({ eventType: "qa_asked", targetLabel: "Q2" }),
      makeEvent({ eventType: "qa_asked", targetLabel: "Q3" }),
    ];

    const progress = computeDeveloperProgress("user1", "owner/repo", events, null);
    expect(progress.questionsAsked).toBe(3);
  });

  it("counts distinct modules explored", () => {
    const events = [
      makeEvent({ eventType: "module_explored", targetId: "m1" }),
      makeEvent({ eventType: "module_explored", targetId: "m1" }), // dup
      makeEvent({ eventType: "module_explored", targetId: "m2" }),
      makeEvent({ eventType: "module_explored", targetId: "m3" }),
    ];

    const progress = computeDeveloperProgress("user1", "owner/repo", events, null);
    expect(progress.modulesExplored).toBe(3);
  });

  it("sums duration from events", () => {
    const events = [
      makeEvent({ durationMs: 1000 }),
      makeEvent({ durationMs: 2500 }),
      makeEvent({ durationMs: 500 }),
    ];

    const progress = computeDeveloperProgress("user1", "owner/repo", events, null);
    expect(progress.totalTimeSpentMs).toBe(4000);
  });

  it("builds timeline snapshots", () => {
    const events: ProgressEvent[] = [];
    for (let i = 0; i < 20; i++) {
      events.push(
        makeEvent({
          eventType: "module_explored",
          area: "api",
          targetId: `mod-${i}`,
          targetLabel: `Module ${i}`,
          timestamp: new Date(Date.now() + i * 60000).toISOString(),
        })
      );
    }

    const progress = computeDeveloperProgress("user1", "owner/repo", events, null);
    expect(progress.timeline.length).toBeGreaterThan(0);
    // Timeline should show increasing scores
    for (const snapshot of progress.timeline) {
      expect(snapshot.overallScore).toBeGreaterThanOrEqual(0);
      expect(snapshot.timestamp).toBeTruthy();
      expect(snapshot.eventDescription).toBeTruthy();
    }
  });

  it("sets firstActivity and lastActivity from events", () => {
    const t1 = "2024-01-01T00:00:00.000Z";
    const t2 = "2024-01-02T00:00:00.000Z";
    const t3 = "2024-01-03T00:00:00.000Z";

    const events = [
      makeEvent({ timestamp: t1, targetId: "a" }),
      makeEvent({ timestamp: t2, targetId: "b" }),
      makeEvent({ timestamp: t3, targetId: "c" }),
    ];

    const progress = computeDeveloperProgress("user1", "owner/repo", events, null);
    expect(progress.firstActivity).toBe(t1);
    expect(progress.lastActivity).toBe(t3);
  });

  it("handles mixed event types correctly", () => {
    const events = [
      makeEvent({ eventType: "walkthrough_viewed", targetId: "wt1", area: "auth" }),
      makeEvent({ eventType: "qa_asked", targetId: "qa1", area: "api" }),
      makeEvent({ eventType: "module_explored", targetId: "m1", area: "database" }),
      makeEvent({ eventType: "convention_viewed", targetId: "cv1", area: "frontend" }),
      makeEvent({ eventType: "env_setup_viewed", targetId: "es1", area: "infrastructure" }),
      makeEvent({ eventType: "animated_viewed", targetId: "av1", area: "architecture" }),
    ];

    const progress = computeDeveloperProgress("user1", "owner/repo", events, null);
    expect(progress.overallScore).toBeGreaterThan(0);
    expect(progress.walkthroughsCompleted).toBe(1);
    expect(progress.questionsAsked).toBe(1);
    expect(progress.modulesExplored).toBe(1);
    expect(progress.skills).toHaveLength(8);
  });
});

// --- Edge Cases ---

describe("edge cases", () => {
  it("handles events with missing optional fields", () => {
    const events: ProgressEvent[] = [
      {
        id: "e1",
        userId: "user1",
        repoId: "owner/repo",
        eventType: "module_explored",
        targetId: "",
        targetLabel: "",
        area: "other" as SkillArea,
        timestamp: new Date().toISOString(),
        durationMs: 0,
      },
    ];

    const scores = computeSkillScores(events, null);
    expect(scores).toHaveLength(8);
    // "other" events don't show in standard 8 areas, so all should still be valid
    for (const s of scores) {
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(100);
    }
  });

  it("handles large number of events performantly", () => {
    const events: ProgressEvent[] = [];
    const areas: SkillArea[] = ["auth", "api", "database", "frontend", "infrastructure", "testing", "devops", "architecture"];

    for (let i = 0; i < 500; i++) {
      events.push(
        makeEvent({
          eventType: "module_explored",
          area: areas[i % areas.length],
          targetId: `m-${i}`,
          targetLabel: `Module ${i}`,
          timestamp: new Date(Date.now() + i * 1000).toISOString(),
        })
      );
    }

    const start = Date.now();
    const progress = computeDeveloperProgress("user1", "owner/repo", events, null);
    const elapsed = Date.now() - start;

    expect(progress.overallScore).toBeGreaterThan(0);
    expect(progress.skills).toHaveLength(8);
    // Should complete within 5 seconds even on slow machines
    expect(elapsed).toBeLessThan(5000);
  });

  it("handles empty repo (no architecture)", () => {
    const events = [
      makeEvent({ eventType: "qa_asked", area: "other", targetLabel: "How does this work?" }),
    ];

    const progress = computeDeveloperProgress("user1", "empty/repo", events, null);
    expect(progress.overallScore).toBeGreaterThanOrEqual(0);
    expect(progress.questionsAsked).toBe(1);
  });
});
