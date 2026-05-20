/**
 * Strip any Sieve filter clauses whose field is not in `allowedFields`.
 * Malformed clauses (no recognizable operator) are also stripped.
 * Returns a comma-joined string of the surviving clauses.
 */
export function validateSieveFilters(
  raw: string,
  allowedFields: ReadonlySet<string>,
): string {
  return raw
    .split(",")
    .map((clause) => clause.trim())
    .filter((clause) => {
      const match = clause.match(/^([^<>=!@]+)\s*(?:==|!=|<=|>=|<|>|@=\*?)/);
      return match ? allowedFields.has(match[1].trim()) : false;
    })
    .join(",");
}
