import { describe, expect, it } from "vitest";
import {
  mergeMessages,
  nextBackoffMs,
  type ThreadMessage,
} from "./use-message-stream";

const message = (id: string): ThreadMessage => ({
  id,
  authorKind: "lawyer",
  authorName: "Dra. Ana",
  body: id,
  createdAt: "2026-08-11T10:00:00.000Z",
  attachments: [],
});

describe("mergeMessages", () => {
  it("insere no topo, porque a lista vem do mais recente para o mais antigo", () => {
    const result = mergeMessages([message("b")], message("a"));
    expect(result.map((m) => m.id)).toEqual(["a", "b"]);
  });

  it("ignora id repetido — o stream reentrega quando reconecta", () => {
    const result = mergeMessages([message("a")], message("a"));
    expect(result).toHaveLength(1);
  });
});

describe("nextBackoffMs", () => {
  it("dobra a cada tentativa", () => {
    expect(nextBackoffMs(0)).toBe(1000);
    expect(nextBackoffMs(1)).toBe(2000);
    expect(nextBackoffMs(2)).toBe(4000);
  });

  it("satura em 30s", () => {
    expect(nextBackoffMs(10)).toBe(30000);
  });
});
