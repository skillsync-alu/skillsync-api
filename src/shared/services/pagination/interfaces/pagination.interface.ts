import {
  FilterQuery,
  HydratedDocument,
  PopulateOptions,
  ProjectionType,
  QueryOptions
} from "mongoose";
import { FilterInput } from "../inputs/filter.input";

export interface PaginationResult<T> {
  totalCount: number;
  totalPages: number;
  list: Omit<HydratedDocument<T, object, object>, never>[] | Partial<T>[];
}

export type PaginationQuery<T> = FilterQuery<T> & {
  filter?: FilterInput;
  extraInput?: FilterQuery<T>;
  options?: {
    sort?: QueryOptions<T>["sort"];
    projection?: ProjectionType<T>;
    populate?: string | string[] | PopulateOptions | PopulateOptions[];
  };
};
