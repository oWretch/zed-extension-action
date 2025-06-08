import { test, expect, mock } from "bun:test";
import { resolveRef } from "./github";

// Mock API client
const createMockAPI = () => ({
  request: mock((endpoint: string, options: any) => {
    // Mock commit lookup by SHA
    if (endpoint === "GET /repos/{owner}/{repo}/commits/{ref}") {
      if (options.ref === "abc1234567890abcdef1234567890abcdef12345") {
        return Promise.resolve({
          data: { sha: "abc1234567890abcdef1234567890abcdef12345" },
        });
      }
      if (options.ref === "abc1234") {
        return Promise.resolve({
          data: { sha: "abc1234567890abcdef1234567890abcdef12345" },
        });
      }
      // For any invalid looking SHA that starts with "invalid" or "deadbeef"
      if (options.ref.startsWith("invalid") || options.ref.startsWith("deadbeef")) {
        return Promise.reject(new Error("Not found"));
      }
      return Promise.reject(new Error("Not found"));
    }
    
    // Mock git refs lookup
    if (endpoint === "GET /repos/{owner}/{repo}/git/refs/{ref}") {
      if (options.ref === "tags/v1.0.0") {
        return Promise.resolve({
          data: { object: { sha: "tag1234567890abcdef1234567890abcdef123456" } },
        });
      }
      if (options.ref === "heads/main") {
        return Promise.resolve({
          data: { object: { sha: "main1234567890abcdef1234567890abcdef123456" } },
        });
      }
      if (options.ref === "heads/feature-branch") {
        return Promise.resolve({
          data: { object: { sha: "feat1234567890abcdef1234567890abcdef123456" } },
        });
      }
      if (options.ref === "tags/release-v2.0.0") {
        return Promise.resolve({
          data: { object: { sha: "rel21234567890abcdef1234567890abcdef123456" } },
        });
      }
      return Promise.reject(new Error("Not found"));
    }
    
    return Promise.reject(new Error("Unexpected endpoint"));
  }),
});

test("resolveRef - full commit SHA", async () => {
  const api = createMockAPI() as any;
  const result = await resolveRef(api, "owner", "repo", "abc1234567890abcdef1234567890abcdef12345");
  
  expect(result.sha).toBe("abc1234567890abcdef1234567890abcdef12345");
  expect(result.type).toBe("commit");
});

test("resolveRef - partial commit SHA", async () => {
  const api = createMockAPI() as any;
  const result = await resolveRef(api, "owner", "repo", "abc1234");
  
  expect(result.sha).toBe("abc1234567890abcdef1234567890abcdef12345");
  expect(result.type).toBe("commit");
});

test("resolveRef - tag name", async () => {
  const api = createMockAPI() as any;
  const result = await resolveRef(api, "owner", "repo", "v1.0.0");
  
  expect(result.sha).toBe("tag1234567890abcdef1234567890abcdef123456");
  expect(result.type).toBe("tag");
});

test("resolveRef - branch name", async () => {
  const api = createMockAPI() as any;
  const result = await resolveRef(api, "owner", "repo", "main");
  
  expect(result.sha).toBe("main1234567890abcdef1234567890abcdef123456");
  expect(result.type).toBe("branch");
});

test("resolveRef - full ref heads", async () => {
  const api = createMockAPI() as any;
  const result = await resolveRef(api, "owner", "repo", "refs/heads/feature-branch");
  
  expect(result.sha).toBe("feat1234567890abcdef1234567890abcdef123456");
  expect(result.type).toBe("branch");
});

test("resolveRef - full ref tags", async () => {
  const api = createMockAPI() as any;
  const result = await resolveRef(api, "owner", "repo", "refs/tags/release-v2.0.0");
  
  expect(result.sha).toBe("rel21234567890abcdef1234567890abcdef123456");
  expect(result.type).toBe("tag");
});

test("resolveRef - invalid reference", async () => {
  const api = createMockAPI() as any;
  
  expect(async () => {
    await resolveRef(api, "owner", "repo", "nonexistent");
  }).toThrow("Reference not found: nonexistent. Not a valid tag, branch, or commit.");
});

test("resolveRef - invalid commit SHA", async () => {
  const api = createMockAPI() as any;
  
  expect(async () => {
    await resolveRef(api, "owner", "repo", "deadbeef567890abcdef1234567890abcdef123");
  }).toThrow("Invalid commit SHA: deadbeef567890abcdef1234567890abcdef123");
});