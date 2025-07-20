import { Injectable } from "@nestjs/common";
import { FilterQuery, Model } from "mongoose";
import { PaginationQuery } from "../interfaces/pagination.interface";
import { omit } from "lodash";
import { PaginationResponse } from "../responses/pagination.response";
import dayjs from "dayjs";
import { toFixed } from "../../../../utilities/to-fixed";
import { Document } from "../../../../shared/models/document.model";

@Injectable()
export class PaginationService {
  async paginate<T>(
    repository: Model<T>,
    query: PaginationQuery<T> = {}
  ): Promise<PaginationResponse<T>> {
    const limit = Number(query.filter?.take || "20");

    const skip = (Number(query.filter?.page || "1") - 1) * limit;

    const filter = {
      ...(omit(query, ["filter", "options"]) || {}),
      ...(query.extraInput || {})
    } as FilterQuery<T & Document>;

    if (query?.filter?.from || query?.filter?.to) {
      filter.createdAt = {};

      if (query?.filter?.from) {
        filter.createdAt.$gte = query?.filter?.from;
      }

      if (query?.filter?.to) {
        filter.createdAt.$lte = query?.filter?.to;
      }
    }

    if (query?.input?.isDeleted === undefined) {
      // @ts-ignore
      filter.isDeleted = false;
    }

    const list = await repository
      .find(filter, query?.options?.projection, {
        limit,
        skip,
        populate: query?.options?.populate,
        sort: query?.options?.sort || { createdAt: -1 }
      })
      .exec();

    const totalCount = await repository.count(filter);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      list,
      totalCount,
      totalPages
    };
  }

  async getPercentageGrowth<T>(repository: Model<T>, query: FilterQuery<T>) {
    const today = dayjs().toDate();

    const lastMonth = dayjs().subtract(1, "M").toDate();

    const last2Months = dayjs().subtract(2, "M").toDate();

    const lastMonthCount = await repository.count({
      ...query,
      createdAt: {
        $lt: lastMonth,
        $gte: last2Months
      }
    });

    const presentMonthCount = await repository.count({
      ...query,
      createdAt: {
        $lt: today,
        $gte: lastMonth
      }
    });

    if (lastMonthCount === 0) {
      if (presentMonthCount === 0) {
        return 0;
      }

      return 100;
    }

    return toFixed(
      ((presentMonthCount - lastMonthCount) / lastMonthCount) * 100
    );
  }
}
