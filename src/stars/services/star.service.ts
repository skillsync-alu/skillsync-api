import {
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Star, StarRepository } from "../models/star.model";
import { Types } from "mongoose";
import { FilterInput } from "../../shared/services/pagination/inputs/filter.input";
import { User, UserRepository } from "../../users/models/user.model";
import { omit } from "lodash";
import { paginate } from "../../utilities/paginate";
import { optimizedUserFields } from "../../users/constants/user.constant";
import { Match, MatchRepository } from "../../matches/models/match.model";

@Injectable()
export class StarService {
  constructor(
    @InjectModel(Star.name) private readonly starRepository: StarRepository,
    @InjectModel(User.name) private readonly userRepository: UserRepository,
    @InjectModel(Match.name) private readonly matchRepository: MatchRepository
  ) {}

  async getStarrerCount(starred: Types.ObjectId) {
    try {
      return await this.starRepository.count({ starred });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getStarrers(filter: FilterInput, starred: User) {
    try {
      const pagination = new FilterInput(filter?.take, filter?.page);

      if (filter?.keyword) {
        const keywords = [
          "starrer.firstName",
          "starrer.lastName",
          "starrer.username",
          "starrer.email",
          "starrer.phoneNumber"
        ];

        const keywordQuery = keywords.map(key => ({
          [key]: {
            $regex: new RegExp(filter.keyword.split(" ").join("|"), "i")
          }
        }));

        const stars = await this.starRepository.aggregate([
          { $match: { starred: starred._id } },
          {
            $lookup: {
              from: "users",
              localField: "starrer",
              foreignField: "_id",
              as: "starrer"
            }
          },
          { $match: { $or: keywordQuery } }
        ]);

        const starrers = stars.map(star => {
          star.starrer = omit(star?.starrer?.[0], ["password"]);

          star.starrer.id = star?.starrer?._id?.toString();

          return star?.starrer;
        });

        return paginate(starrers, pagination.page, pagination.take);
      }

      const starrers = await this.starRepository
        .find({ starred: starred._id }, "starrer", {
          limit: pagination.take,
          skip: (pagination.page - 1) * pagination.take
        })
        .populate({
          path: "starrer",
          select: optimizedUserFields
        });

      const totalCount = await this.getStarrerCount(starred._id);

      const totalPages = Math.ceil(totalCount / pagination.take);

      return {
        totalCount,
        totalPages,
        list: starrers.map(({ starrer }) => starrer)
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getStarredCount(starrer: Types.ObjectId) {
    try {
      return await this.starRepository.count({ starrer });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getStarred(filter: FilterInput, starrer: User) {
    try {
      const pagination = new FilterInput(filter?.take, filter?.page);

      if (filter?.keyword) {
        const keywords = [
          "starred.firstName",
          "starred.lastName",
          "starred.username",
          "starred.email",
          "starred.phoneNumber"
        ];

        const keywordQuery = keywords.map(key => ({
          [key]: {
            $regex: new RegExp(filter.keyword.split(" ").join("|"), "i")
          }
        }));

        const stars = await this.starRepository.aggregate([
          { $match: { starrer: starrer._id } },
          {
            $lookup: {
              from: "users",
              localField: "starred",
              foreignField: "_id",
              as: "starred"
            }
          },
          { $match: { $or: keywordQuery } }
        ]);

        const starred = stars.map(star => {
          star.starred = omit(star?.starred?.[0], ["password"]);

          star.starred.id = star?.starred?._id?.toString();

          return star?.starred;
        });

        return paginate(starred, pagination.page, pagination.take);
      }

      const starred = await this.starRepository
        .find({ starrer: starrer._id }, "starred", {
          limit: pagination.take,
          skip: (pagination.page - 1) * pagination.take
        })
        .populate({ path: "starred" });

      const totalCount = await this.getStarredCount(starrer._id);

      const totalPages = Math.ceil(totalCount / pagination.take);

      return {
        totalCount,
        totalPages,
        list: await Promise.all(
          starred.map(async ({ starred }) => {
            starred.matcheeCount = await this.matchRepository.getMatcheeCount(
              starred._id
            );

            starred.starrerCount = await this.getStarrerCount(starred._id);

            starred.isMatched = await this.matchRepository.isMatched(
              starred._id,
              starrer._id
            );

            starred.isStarred = await this.isStarred(starred._id, starrer._id);

            return starred;
          })
        )
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async isStarred(
    starrer: Types.ObjectId,
    starred: Types.ObjectId
  ): Promise<boolean> {
    try {
      return Boolean(await this.starRepository.exists({ starrer, starred }));
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async starOrUnstar(starrer: User, starred: Types.ObjectId) {
    try {
      if (starrer.id === starred.toString()) {
        throw new InternalServerErrorException("You cannot star yourself");
      }

      const user = await this.userRepository.findOne({
        _id: starred,
        isDeleted: false
      });

      if (!user) {
        throw new NotFoundException(
          "The person you are trying to star or unstar either doesn't exist or has had his/her account deleted."
        );
      }

      const existingStar = await this.starRepository.findOne({
        starred,
        starrer: starrer._id
      });

      if (existingStar) {
        await existingStar.remove();
      } else {
        const newStar = await this.starRepository.create({
          starred,
          starrer: starrer._id
        });

        await newStar.save();
      }

      user.isStarred = !existingStar;

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
