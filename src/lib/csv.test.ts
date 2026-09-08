import { describe, expect, it } from "vitest";
import { csvToRecords, parseCsv, stringifyCsv } from "./csv";

describe("parseCsv", () => {
  it("parses plain rows", () => {
    expect(parseCsv("a,b\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });

  it("keeps commas, quotes and newlines inside quoted fields", () => {
    expect(parseCsv('a,"b,c"\n"say ""hi""","line1\nline2"')).toEqual([
      ["a", "b,c"],
      ['say "hi"', "line1\nline2"],
    ]);
  });

  it("strips the BOM Excel writes", () => {
    expect(parseCsv("﻿a,b")).toEqual([["a", "b"]]);
  });

  it("handles CRLF line endings", () => {
    expect(parseCsv("a,b\r\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ]);
  });
});

describe("stringifyCsv → parseCsv round-trip", () => {
  it("survives the values that need escaping", () => {
    const rows = [
      ["szlug", "nev_hu", "megjegyzes"],
      ["hc-1", 'HC "Design" 5', "hosszú, tagolt\nsor"],
      ["bull-grill", "BULL grill", ""],
    ];
    expect(parseCsv(stringifyCsv(rows))).toEqual(rows);
  });

  it("writes null/undefined as empty fields", () => {
    expect(parseCsv(stringifyCsv([["a", null, undefined, 3]]))).toEqual([
      ["a", "", "", "3"],
    ]);
  });
});

describe("csvToRecords", () => {
  it("keys each row by the header row", () => {
    expect(csvToRecords("szlug,nev_hu\nhc-1,HC 1")).toEqual([
      { szlug: "hc-1", nev_hu: "HC 1" },
    ]);
  });

  it("returns nothing for an empty file", () => {
    expect(csvToRecords("")).toEqual([]);
  });
});
