import { IsOptional, IsInt, Min, Max, IsString, MaxLength } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @Transform(({ obj, value }) => value ?? obj.limit, { toClassOnly: true })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  cursor?: string;
}

export class PaginatedResponse<T> {
  items: T[];
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  constructor(items: T[], total: number, page: number, pageSize: number) {
    this.items = items;
    this.data = items;
    this.pagination = {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
    this.meta = this.pagination;
  }
}

export class CursorPaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  total?: number;

  constructor(data: T[], nextCursor: string | null, total?: number) {
    this.data = data;
    this.nextCursor = nextCursor;
    if (typeof total === 'number') {
      this.total = total;
    }
  }
}
