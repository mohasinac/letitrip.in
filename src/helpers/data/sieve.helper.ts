/**
 * Sieve Data Helper
 *
 * Shared backend helper to apply SieveJS filtering, sorting, and pagination
 * over in-memory arrays while keeping a consistent API response contract.
 *
 * Uses @mohasinac/sievejs (https://www.npmjs.com/package/@mohasinac/sievejs) with a
 * custom in-memory adapter, enabling the Sieve DSL (filters, sorts, page, pageSize)
 * over plain JavaScript arrays fetched from Firestore.
 */

import { createSieveProcessor } from "@mohasinac/sievejs";

type InMemoryQuery<T> = T[];

type SieveFieldConfig = {
  path?: string;
  canFilter?: boolean;
  canSort?: boolean;
  parseValue?: (value: string) => unknown;
};

type SieveFieldsInput =
  | Array<{
      name: string;
      path?: string;
      canFilter?: boolean;
      canSort?: boolean;
      parseValue?: (value: string) => unknown;
    }>
  | Record<string, string | SieveFieldConfig>;

type ParsedOperator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual"
  | "contains"
  | "startsWith"
  | "endsWith";

type QueryCondition = {
  field: string;
  value: unknown;
  parsedOperator: ParsedOperator;
  operatorIsNegated: boolean;
  operatorIsCaseInsensitive: boolean;
  ignoreNullsOnNotEqual: boolean;
};

type QueryAdapter<TQuery> = {
  applyFilterGroup(query: TQuery, group: QueryCondition[]): TQuery;
  applySorts(
    query: TQuery,
    sorts: Array<{ field: string; descending: boolean }>,
  ): TQuery;
  applyPagination(
    query: TQuery,
    pagination: { page: number; pageSize: number },
  ): TQuery;
};

type SieveModelInput = {
  filters?: string;
  sorts?: string;
  page?: number | string;
  pageSize?: number | string;
};

type SieveProcessorOptions = {
  caseSensitive?: boolean;
  defaultPageSize?: number;
  maxPageSize?: number;
  throwExceptions?: boolean;
  ignoreNullsOnNotEqual?: boolean;
};

export interface SieveArrayQueryInput<TItem> {
  items: TItem[];
  model: Partial<SieveModelInput>;
  fields: SieveFieldsInput;
  options?: SieveProcessorOptions;
}

export interface SieveArrayQueryResult<TItem> {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

const DEFAULT_SIEVE_OPTIONS: SieveProcessorOptions = {
  caseSensitive: false,
  defaultPageSize: 20,
  maxPageSize: 100,
  throwExceptions: false,
  ignoreNullsOnNotEqual: true,
};

function normalizeComparable(value: unknown, caseSensitive: boolean): unknown {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "string") {
    return caseSensitive ? value : value.toLowerCase();
  }

  return value;
}

function normalizeString(value: unknown, caseSensitive: boolean): string {
  if (value == null) {
    return "";
  }

  const stringValue = String(value);
  return caseSensitive ? stringValue : stringValue.toLowerCase();
}

function compareByOperator(
  itemValue: unknown,
  condition: QueryCondition,
  caseSensitive: boolean,
): boolean {
  const comparableItemValue = normalizeComparable(itemValue, caseSensitive);
  const comparableConditionValue = normalizeComparable(
    condition.value,
    caseSensitive,
  );

  let result = false;

  switch (condition.parsedOperator) {
    case "equals":
      result = comparableItemValue === comparableConditionValue;
      break;
    case "notEquals":
      result = comparableItemValue !== comparableConditionValue;
      break;
    case "greaterThan":
      result = (comparableItemValue as any) > (comparableConditionValue as any);
      break;
    case "lessThan":
      result = (comparableItemValue as any) < (comparableConditionValue as any);
      break;
    case "greaterThanOrEqual":
      result =
        (comparableItemValue as any) >= (comparableConditionValue as any);
      break;
    case "lessThanOrEqual":
      result =
        (comparableItemValue as any) <= (comparableConditionValue as any);
      break;
    case "contains": {
      const haystack = normalizeString(itemValue, caseSensitive);
      const needle = normalizeString(condition.value, caseSensitive);
      result = haystack.includes(needle);
      break;
    }
    case "startsWith": {
      const haystack = normalizeString(itemValue, caseSensitive);
      const needle = normalizeString(condition.value, caseSensitive);
      result = haystack.startsWith(needle);
      break;
    }
    case "endsWith": {
      const haystack = normalizeString(itemValue, caseSensitive);
      const needle = normalizeString(condition.value, caseSensitive);
      result = haystack.endsWith(needle);
      break;
    }
    default:
      result = false;
      break;
  }

  return condition.operatorIsNegated ? !result : result;
}

function resolveFieldValue(
  item: Record<string, unknown>,
  path: string,
): unknown {
  return path.split(".").reduce<unknown>((accumulator, key) => {
    if (!accumulator || typeof accumulator !== "object") {
      return undefined;
    }

    return (accumulator as Record<string, unknown>)[key];
  }, item);
}

function createInMemorySieveAdapter<TItem>(
  caseSensitive: boolean,
): QueryAdapter<InMemoryQuery<TItem>> {
  return {
    applyFilterGroup(
      query: InMemoryQuery<TItem>,
      group: QueryCondition[],
    ): InMemoryQuery<TItem> {
      return query.filter((item) => {
        const record = item as Record<string, unknown>;

        return group.some((condition) => {
          const itemValue = resolveFieldValue(record, condition.field);
          return compareByOperator(itemValue, condition, caseSensitive);
        });
      });
    },

    applySorts(
      query: InMemoryQuery<TItem>,
      sorts: Array<{ field: string; descending: boolean }>,
    ): InMemoryQuery<TItem> {
      if (!sorts.length) {
        return query;
      }

      const sorted = [...query];

      sorted.sort((leftItem, rightItem) => {
        const leftRecord = leftItem as Record<string, unknown>;
        const rightRecord = rightItem as Record<string, unknown>;

        for (const sortEntry of sorts) {
          const leftValue = normalizeComparable(
            resolveFieldValue(leftRecord, sortEntry.field),
            caseSensitive,
          );
          const rightValue = normalizeComparable(
            resolveFieldValue(rightRecord, sortEntry.field),
            caseSensitive,
          );

          if (leftValue === rightValue) {
            continue;
          }

          if (leftValue == null && rightValue != null) {
            return sortEntry.descending ? 1 : -1;
          }

          if (rightValue == null && leftValue != null) {
            return sortEntry.descending ? -1 : 1;
          }

          if (leftValue! < rightValue!) {
            return sortEntry.descending ? 1 : -1;
          }

          if (leftValue! > rightValue!) {
            return sortEntry.descending ? -1 : 1;
          }
        }

        return 0;
      });

      return sorted;
    },

    applyPagination(
      query: InMemoryQuery<TItem>,
      pagination: { page: number; pageSize: number },
    ): InMemoryQuery<TItem> {
      const safePage = Math.max(1, Number(pagination.page || 1));
      const safePageSize = Math.max(1, Number(pagination.pageSize || 1));
      const startIndex = (safePage - 1) * safePageSize;
      return query.slice(startIndex, startIndex + safePageSize);
    },
  };
}

export async function applySieveToArray<TItem>(
  input: SieveArrayQueryInput<TItem>,
): Promise<SieveArrayQueryResult<TItem>> {
  const mergedOptions = {
    ...DEFAULT_SIEVE_OPTIONS,
    ...(input.options || {}),
  };

  const processor = createSieveProcessor<InMemoryQuery<TItem>>({
    adapter: createInMemorySieveAdapter<TItem>(
      Boolean(mergedOptions.caseSensitive),
    ),
    options: mergedOptions,
    fields: input.fields,
  });

  const parsedModel = processor.parseModel(input.model);
  const totalItems = processor.apply(input.model, input.items, {
    applyPagination: false,
  });
  const pagedItems = processor.apply(input.model, input.items);

  const page = Math.max(1, Number(parsedModel.page || 1));
  const pageSize = Math.max(
    1,
    Number(parsedModel.pageSize || mergedOptions.defaultPageSize || 20),
  );
  const total = totalItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items: pagedItems,
    total,
    page,
    pageSize,
    totalPages,
    hasMore: page < totalPages,
  };
}
