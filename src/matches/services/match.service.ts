import {
  BadRequestException,
  Injectable,
  InternalServerErrorException
} from "@nestjs/common";
import { Match, MatchRepository } from "../models/match.model";
import { InjectModel } from "@nestjs/mongoose";
import { PaginationService } from "../../shared/services/pagination/services/pagination.service";
import { MatchFilterInput } from "../inputs/match-filter.input";
import { CreateMatchInput } from "../inputs/create-match.input";
import { Types } from "mongoose";
import { PaginationQuery } from "src/shared/services/pagination/interfaces/pagination.interface";

@Injectable()
export class MatchService {
  constructor(
    private readonly paginationService: PaginationService,
    @InjectModel(Match.name) private readonly matchRepository: MatchRepository
  ) {}

  async match(input: CreateMatchInput) {
    try {
      const matcher = await this.matchRepository.findOne({
        isDeleted: false,
        _id: input.matcher
      });

      if (!matcher) {
        throw new BadRequestException();
      }

      const matchee = await this.matchRepository.findOne({
        isDeleted: false,
        _id: input.matchee
      });

      if (!matchee) {
        throw new BadRequestException();
      }

      return await this.matchRepository.create({
        matchee: matchee._id,
        matcher: matcher._id,
        skillsWanted: matchee.skillsWanted,
        skillsOfferred: matcher.skillsOfferred
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getMatcheeCount(matcher: Types.ObjectId) {
    try {
      return await this.matchRepository.count({ matcher, isDeleted: false });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getMatcherCount(matchee: Types.ObjectId) {
    try {
      return await this.matchRepository.count({ matchee, isDeleted: false });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async isMatched(matcher: Types.ObjectId, matchee: Types.ObjectId) {
    try {
      return Boolean(
        await this.matchRepository.exists({
          matcher,
          matchee,
          isDeleted: false
        })
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getMatches(filter: MatchFilterInput) {
    try {
      const query: PaginationQuery<Match> = { filter };

      if (filter.matchee) {
        query.matchee = filter.matchee;
      }

      if (filter.matcher) {
        query.matcher = filter.matcher;
      }

      return await this.paginationService.paginate(this.matchRepository, query);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
