// types/api.ts (or inside userService.ts)
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  from: number;
  to: number;
  total: number;
  last_page: number;
  per_page: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
}
