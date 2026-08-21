import {
  getWeekStart,
  isInCurrentWeek,
  formatDuration,
  calculateStreak,
  longestSession,
  totalFocusMinutes,
} from "../src/utils/productivity";
import type { FocusSession, Task } from "../src/types/task";

// ── getWeekStart ──

describe("getWeekStart", () => {
  it("returns a Monday", () => {
    const result = getWeekStart(new Date("2026-08-21T12:00:00"));
    expect(result.getDay()).toBe(1); // Monday
  });

  it("returns midnight", () => {
    const result = getWeekStart(new Date("2026-08-21T15:30:00"));
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });
});

// ── isInCurrentWeek ──

describe("isInCurrentWeek", () => {
  const wednesday = new Date("2026-08-19T12:00:00");

  it("returns true for a date within the same week", () => {
    expect(isInCurrentWeek("2026-08-18", wednesday)).toBe(true); // Tuesday
    expect(isInCurrentWeek("2026-08-19", wednesday)).toBe(true); // Wednesday
  });

  it("returns false for a date in a different week", () => {
    expect(isInCurrentWeek("2026-08-10", wednesday)).toBe(false);
    expect(isInCurrentWeek("2026-08-25", wednesday)).toBe(false);
  });
});

// ── formatDuration ──

describe("formatDuration", () => {
  it("formats minutes under 60", () => {
    expect(formatDuration(45)).toBe("45 min");
  });

  it("formats exact hours", () => {
    expect(formatDuration(120)).toBe("2h");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(90)).toBe("1h 30m");
  });

  it("formats zero", () => {
    expect(formatDuration(0)).toBe("0 min");
  });
});

// ── calculateStreak ──

describe("calculateStreak", () => {
  it("returns 0 for no completed tasks", () => {
    expect(calculateStreak([])).toBe(0);
  });

  it("returns 0 for completed tasks without completedAt", () => {
    const tasks: Task[] = [
      { id: "1", title: "T", subject: "S", description: "D", dueDate: "2026-08-20", priority: "Medium", status: "Completed" },
    ];
    expect(calculateStreak(tasks)).toBe(0);
  });
});

// ── longestSession ──

describe("longestSession", () => {
  it("returns 0 for empty sessions", () => {
    expect(longestSession([])).toBe(0);
  });

  it("returns the max minutes", () => {
    const sessions: FocusSession[] = [
      { id: "1", taskId: "t1", taskTitle: "T", minutes: 25, completedAt: "2026-08-20T10:00:00Z" },
      { id: "2", taskId: "t1", taskTitle: "T", minutes: 45, completedAt: "2026-08-20T11:00:00Z" },
      { id: "3", taskId: "t1", taskTitle: "T", minutes: 15, completedAt: "2026-08-20T12:00:00Z" },
    ];
    expect(longestSession(sessions)).toBe(45);
  });
});

// ── totalFocusMinutes ──

describe("totalFocusMinutes", () => {
  it("returns 0 for empty sessions", () => {
    expect(totalFocusMinutes([])).toBe(0);
  });

  it("sums all session minutes", () => {
    const sessions: FocusSession[] = [
      { id: "1", taskId: "t1", taskTitle: "T", minutes: 25, completedAt: "2026-08-20T10:00:00Z" },
      { id: "2", taskId: "t1", taskTitle: "T", minutes: 30, completedAt: "2026-08-20T11:00:00Z" },
    ];
    expect(totalFocusMinutes(sessions)).toBe(55);
  });
});
