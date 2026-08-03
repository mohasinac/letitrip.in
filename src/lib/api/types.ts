/** Open JSON object body — any string-keyed JSON-serializable value. */
export interface JsonBody {
  [key: string]: unknown;
}

/** Shape returned by admin list endpoints: GET /api/admin/<resource>?... */
export interface AdminListResponse<T = unknown> {
  data: {
    items: T[];
    total: number;
    page?: number;
    pageSize?: number;
  };
}
