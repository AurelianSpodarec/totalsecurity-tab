import { buildListItems, getItemKey, TabListItem } from "./listItems";
import type { SessionTab } from "../types/SessionTab";

const createTab = (overrides: Partial<SessionTab> = {}): SessionTab => ({
  id: Math.floor(Math.random() * 10000),
  title: "Test Tab",
  url: "https://example.com",
  pinned: false,
  index: 0,
  active: false,
  groupId: -1,
  ...overrides,
});

describe("buildListItems", () => {
  it("returns empty array for empty input", () => {
    expect(buildListItems([])).toEqual([]);
  });

  it("returns tab items for ungrouped tabs", () => {
    const tabs = [
      createTab({ id: 1, groupId: -1 }),
      createTab({ id: 2, groupId: -1 }),
    ];

    const result = buildListItems(tabs);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ type: "tab", tab: tabs[0] });
    expect(result[1]).toEqual({ type: "tab", tab: tabs[1] });
  });

  it("inserts group header before first tab in a group", () => {
    const tabs = [
      createTab({ id: 1, groupId: 100, groupTitle: "Work", groupColor: "blue" }),
      createTab({ id: 2, groupId: 100, groupTitle: "Work", groupColor: "blue" }),
    ];

    const result = buildListItems(tabs);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      type: "group",
      groupId: 100,
      groupTitle: "Work",
      groupColor: "blue",
    });
    expect(result[1]).toEqual({ type: "tab", tab: tabs[0] });
    expect(result[2]).toEqual({ type: "tab", tab: tabs[1] });
  });

  it("handles multiple groups correctly", () => {
    const tabs = [
      createTab({ id: 1, groupId: 100, groupTitle: "Work", groupColor: "blue" }),
      createTab({ id: 2, groupId: 100, groupTitle: "Work", groupColor: "blue" }),
      createTab({ id: 3, groupId: -1 }),
      createTab({ id: 4, groupId: 200, groupTitle: "Personal", groupColor: "red" }),
    ];

    const result = buildListItems(tabs);

    expect(result).toHaveLength(6);
    expect(result[0]).toEqual({ type: "group", groupId: 100, groupTitle: "Work", groupColor: "blue" });
    expect(result[1].type).toBe("tab");
    expect(result[2].type).toBe("tab");
    expect(result[3].type).toBe("tab");
    expect(result[4]).toEqual({ type: "group", groupId: 200, groupTitle: "Personal", groupColor: "red" });
    expect(result[5].type).toBe("tab");
  });

  it("handles group without title", () => {
    const tabs = [
      createTab({ id: 1, groupId: 100, groupTitle: undefined, groupColor: "grey" }),
    ];

    const result = buildListItems(tabs);

    expect(result[0]).toEqual({
      type: "group",
      groupId: 100,
      groupTitle: undefined,
      groupColor: "grey",
    });
  });

  it("handles mixed pinned and grouped tabs", () => {
    const tabs = [
      createTab({ id: 1, pinned: true, groupId: -1 }),
      createTab({ id: 2, pinned: true, groupId: -1 }),
      createTab({ id: 3, pinned: false, groupId: 100, groupTitle: "Dev" }),
    ];

    const result = buildListItems(tabs);

    expect(result).toHaveLength(4);
    expect(result[0].type).toBe("tab");
    expect(result[1].type).toBe("tab");
    expect(result[2].type).toBe("group");
    expect(result[3].type).toBe("tab");
  });
});

describe("getItemKey", () => {
  it("returns tab key for tab items", () => {
    const item: TabListItem = {
      type: "tab",
      tab: createTab({ id: 42 }),
    };

    expect(getItemKey(item)).toBe("tab-42");
  });

  it("returns group key for group items", () => {
    const item: TabListItem = {
      type: "group",
      groupId: 100,
      groupTitle: "Work",
      groupColor: "blue",
    };

    expect(getItemKey(item)).toBe("group-100");
  });
});
