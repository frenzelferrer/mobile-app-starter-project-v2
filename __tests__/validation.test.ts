import { formatDate, getDueDateStatus, isValidDate, validateTaskForm, getAllTags } from "../src/utils/validation";
import type { Task, TaskFormData } from "../src/types/task";

// ── isValidDate ──

describe("isValidDate", () => {
  it("accepts a valid date string", () => {
    expect(isValidDate("2026-08-25")).toBe(true);
  });

  it("accepts leap day on a leap year", () => {
    expect(isValidDate("2024-02-29")).toBe(true);
  });

  it("rejects leap day on a non-leap year", () => {
    expect(isValidDate("2025-02-29")).toBe(false);
  });

  it("rejects malformed format", () => {
    expect(isValidDate("08-25-2026")).toBe(false);
    expect(isValidDate("2026/08/25")).toBe(false);
    expect(isValidDate("not-a-date")).toBe(false);
    expect(isValidDate("")).toBe(false);
  });

  it("rejects out-of-range month", () => {
    expect(isValidDate("2026-13-01")).toBe(false);
  });

  it("rejects out-of-range day", () => {
    expect(isValidDate("2026-08-32")).toBe(false);
  });
});

// ── formatDate ──

describe("formatDate", () => {
  it("returns a human-readable date string", () => {
    const result = formatDate("2026-08-25");
    expect(result).toBeTruthy();
    expect(result).not.toBe("2026-08-25");
  });

  it("returns the original string for an invalid date", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});

// ── getDueDateStatus ──

describe("getDueDateStatus", () => {
  it('returns "Completed" for completed tasks', () => {
    const task = { dueDate: "2020-01-01", status: "Completed" as const };
    expect(getDueDateStatus(task)).toBe("Completed");
  });

  it('returns "Overdue" for past dates on pending tasks', () => {
    const task = { dueDate: "2020-01-01", status: "Pending" as const };
    expect(getDueDateStatus(task)).toBe("Overdue");
  });

  it('returns "Upcoming" for far-future dates', () => {
    const task = { dueDate: "2099-12-31", status: "Pending" as const };
    expect(getDueDateStatus(task)).toBe("Upcoming");
  });
});

// ── validateTaskForm ──

describe("validateTaskForm", () => {
  const validForm: TaskFormData = {
    title: "Test Task",
    subject: "Test Subject",
    description: "A description that is long enough.",
    dueDate: "2026-08-25",
    priority: "Medium",
    status: "Pending",
    tags: [],
    recurrence: "none",
    reminderAdvance: "1d",
  };

  it("returns no errors for a valid form", () => {
    const errors = validateTaskForm(validForm);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it("returns error for empty title", () => {
    const errors = validateTaskForm({ ...validForm, title: "" });
    expect(errors.title).toBeTruthy();
  });

  it("returns error for title shorter than 3 characters", () => {
    const errors = validateTaskForm({ ...validForm, title: "AB" });
    expect(errors.title).toBeTruthy();
  });

  it("returns error for empty subject", () => {
    const errors = validateTaskForm({ ...validForm, subject: "" });
    expect(errors.subject).toBeTruthy();
  });

  it("returns error for description shorter than 10 characters", () => {
    const errors = validateTaskForm({ ...validForm, description: "Short" });
    expect(errors.description).toBeTruthy();
  });

  it("returns error for invalid date format", () => {
    const errors = validateTaskForm({ ...validForm, dueDate: "invalid" });
    expect(errors.dueDate).toBeTruthy();
  });

  it("returns error for empty due date", () => {
    const errors = validateTaskForm({ ...validForm, dueDate: "" });
    expect(errors.dueDate).toBeTruthy();
  });
});

// ── getAllTags ──

describe("getAllTags", () => {
  it("returns unique sorted tags from tasks", () => {
    const tasks: Pick<Task, "tags">[] = [
      { tags: ["exam", "project"] },
      { tags: ["homework", "exam"] },
      { tags: undefined },
    ] as Task[];
    const result = getAllTags(tasks as Task[]);
    expect(result).toEqual(["exam", "homework", "project"]);
  });

  it("returns empty array for tasks with no tags", () => {
    const tasks: Task[] = [{ tags: undefined } as unknown as Task];
    expect(getAllTags(tasks)).toEqual([]);
  });
});
