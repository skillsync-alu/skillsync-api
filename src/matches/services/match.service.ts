import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException
} from "@nestjs/common";
import { Match, MatchRepository } from "../models/match.model";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { PaginationService } from "../../shared/services/pagination/services/pagination.service";
import { MatchFilterInput } from "../inputs/match-filter.input";
import { ClientSession, Connection, Types } from "mongoose";
import { PaginationQuery } from "../../shared/services/pagination/interfaces/pagination.interface";
import { User, UserRepository } from "../../users/models/user.model";
import { UserType } from "../../users/interfaces/user.interface";
import { MatchStatus } from "../models/match-status.model";
import { matchStatusMessages } from "../constants/match.constant";
import { MatchStatusType } from "../interfaces/match.interface";
import { inTransaction } from "../../utilities/transaction";
import { Cron } from "@nestjs/schedule";
import { FilterInput } from "../../shared/services/pagination/inputs/filter.input";
import { omit } from "lodash";
import { paginate } from "../../utilities/paginate";
import { Star, StarRepository } from "../../stars/models/star.model";
import { UpdateMatchInput } from "../inputs/update-match.input";
import { MessageService } from "../../shared/services/messages/services/message.service";

@Injectable()
export class MatchService {
  constructor(
    private readonly messageService: MessageService,
    private readonly paginationService: PaginationService,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Star.name) private readonly starRepository: StarRepository,
    @InjectModel(Match.name) private readonly matchRepository: MatchRepository,
    @InjectModel(User.name) private readonly userRepository: UserRepository
  ) {}

  addStatus(
    status: MatchStatusType,
    details?: string,
    createdBy?: Types.ObjectId
  ): MatchStatus {
    return {
      details,
      type: status,
      timeStamp: new Date(),
      createdBy: createdBy as any,
      message: matchStatusMessages[status]
    };
  }

  async create(
    matcher: User,
    matchee: User,
    session: ClientSession,
    isSystem = true
  ) {
    try {
      const [match] = await this.matchRepository.create(
        [
          {
            matchee: matchee._id,
            matcher: matcher._id,
            skillsWanted: matchee.skillsWanted,
            skillsOfferred: matcher.skillsOfferred
          }
        ],
        { session }
      );

      match.statuses.push(
        this.addStatus(
          MatchStatusType.Draft,
          undefined,
          !isSystem ? matchee._id : undefined
        )
      );

      return await match.save({ session });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async confirm(match: Match, session: ClientSession) {
    try {
      if (match.isConfirmed) {
        return;
      }

      match.isConfirmed = true;

      match.statuses.push(this.addStatus(MatchStatusType.Confirmed));

      await this.messageService.createChatDocument({
        matchId: match.id,
        participants: [match.matcher.toString(), match.matchee.toString()]
      });

      return await match.save({ session });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createMatch(matcher: Types.ObjectId, matchee: User) {
    return await inTransaction(this.connection, async session => {
      try {
        const tutor = await this.userRepository.findOne({
          _id: matcher,
          isDeleted: false,
          type: UserType.Tutor
        });

        if (!tutor) {
          throw new BadRequestException("Tutor not available");
        }

        const matchCount = await this.matchRepository.count({
          isDeleted: false,
          matchee: matchee._id,
          status: {
            $in: [
              MatchStatusType.Draft,
              MatchStatusType.Confirmed,
              MatchStatusType.AcceptedByTutor
            ]
          }
        });

        if (matchCount >= 6) {
          throw new BadRequestException(
            "You've reached your limit of 6 matches"
          );
        }

        const match = await this.create(tutor, matchee, session, false);

        match.statuses.push(
          this.addStatus(
            MatchStatusType.AcceptedByStudent,
            undefined,
            matchee._id
          )
        );

        await match.save({ session });

        await session.commitTransaction();

        return await match.populate(["matcher"]);
      } catch (error) {
        await session.abortTransaction();

        throw new InternalServerErrorException(error);
      }
    });
  }

  async updateMatchAsStudent(input: UpdateMatchInput, user: User) {
    return await inTransaction(this.connection, async session => {
      try {
        const match = await this.matchRepository.findOne({
          _id: input.id,
          isDeleted: false,
          matchee: user._id
        });

        if (!match) {
          throw new UnauthorizedException();
        }

        if (
          ![
            MatchStatusType.AcceptedByStudent,
            MatchStatusType.RejectedByStudent
          ].includes(input.matchStatus)
        ) {
          throw new BadRequestException("Invalid Match Update status");
        }

        match.statuses.push(
          this.addStatus(input.matchStatus, input.details, user._id)
        );

        if (input.matchStatus === MatchStatusType.AcceptedByStudent) {
          if (
            match.statuses.some(
              status => status.type === MatchStatusType.AcceptedByTutor
            )
          ) {
            await this.confirm(match, session);
          }
        }

        await match.save({ session });

        await session.commitTransaction();

        return match;
      } catch (error) {
        await session.abortTransaction();

        throw new InternalServerErrorException(error);
      }
    });
  }

  async updateMatchAsTutor(input: UpdateMatchInput, user: User) {
    return await inTransaction(this.connection, async session => {
      try {
        const match = await this.matchRepository.findOne({
          _id: input.id,
          isDeleted: false,
          matcher: user._id
        });

        if (!match) {
          throw new UnauthorizedException();
        }

        if (
          ![
            MatchStatusType.AcceptedByTutor,
            MatchStatusType.RejectedByTutor
          ].includes(input.matchStatus)
        ) {
          throw new BadRequestException("Invalid Match Update status");
        }

        match.statuses.push(
          this.addStatus(input.matchStatus, input.details, user._id)
        );

        if (input.matchStatus === MatchStatusType.AcceptedByTutor) {
          if (
            match.statuses.some(
              status => status.type === MatchStatusType.AcceptedByStudent
            )
          ) {
            await this.confirm(match, session);
          }
        }

        await match.save({ session });

        await session.commitTransaction();

        return match;
      } catch (error) {
        await session.abortTransaction();

        throw new InternalServerErrorException(error);
      }
    });
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

  async getMatches(filter: MatchFilterInput, user: User) {
    try {
      const query: PaginationQuery<Match> = {
        filter,
        status: filter.status || MatchStatusType.Confirmed,
        options: {
          populate: ["matcher", "matchee"]
        }
      };

      if (user.type === UserType.Tutor) {
        query.matcher = user._id;
      } else {
        query.matchee = user._id;
      }

      return await this.paginationService.paginate(this.matchRepository, query);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getMatchers(filter: MatchFilterInput, matchee: User) {
    try {
      const pagination = new FilterInput(filter?.take, filter?.page);

      if (filter?.keyword) {
        const keywords = [
          "matcher.firstName",
          "matcher.lastName",
          "matcher.username",
          "matcher.email",
          "matcher.phoneNumber"
        ];

        const keywordQuery = keywords.map(key => ({
          [key]: {
            $regex: new RegExp(filter.keyword.split(" ").join("|"), "i")
          }
        }));

        const matches = await this.matchRepository.aggregate([
          { $match: { matchee: matchee._id } },
          {
            $lookup: {
              from: "users",
              as: "matcher",
              localField: "matcher",
              foreignField: "_id"
            }
          },
          { $match: { $or: keywordQuery } }
        ]);

        const matchers = matches.map(match => {
          match.matcher = omit(match?.matcher?.[0], ["password"]);

          match.matcher.id = match?.matcher?._id?.toString();

          return match?.matcher;
        });

        return paginate(matchers, pagination.page, pagination.take);
      }

      const matchers = await this.matchRepository
        .find(
          {
            matchee: matchee._id,
            status: {
              $in: [MatchStatusType.Draft, MatchStatusType.AcceptedByTutor]
            }
          },
          "matcher",
          {
            limit: pagination.take,
            skip: (pagination.page - 1) * pagination.take
          }
        )
        .populate({ path: "matcher" });

      const totalCount = await this.getMatcherCount(matchee._id);

      const totalPages = Math.ceil(totalCount / pagination.take);

      return {
        totalCount,
        totalPages,
        list: await Promise.all(
          matchers.map(async ({ matcher, id }) => {
            matcher.matchId = id;

            matcher.matcheeCount = await this.getMatcheeCount(matcher._id);

            matcher.starrerCount = await this.starRepository.getStarrerCount(
              matcher._id
            );

            matcher.isMatched = true;

            matcher.isStarred = await this.starRepository.isStarred(
              matchee._id,
              matcher._id
            );

            return matcher;
          })
        )
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getMatchees(filter: MatchFilterInput, matcher: User) {
    try {
      const pagination = new FilterInput(filter?.take, filter?.page);

      if (filter?.keyword) {
        const keywords = [
          "matchee.firstName",
          "matchee.lastName",
          "matchee.username",
          "matchee.email",
          "matchee.phoneNumber"
        ];

        const keywordQuery = keywords.map(key => ({
          [key]: {
            $regex: new RegExp(filter.keyword.split(" ").join("|"), "i")
          }
        }));

        const matches = await this.matchRepository.aggregate([
          { $match: { matcher: matcher._id } },
          {
            $lookup: {
              from: "users",
              as: "matchee",
              foreignField: "_id",
              localField: "matchee"
            }
          },
          { $match: { $or: keywordQuery } }
        ]);

        const matchees = matches.map(match => {
          match.matchee = omit(match?.matchee?.[0], ["password"]);

          match.matchee.id = match?.matchee?._id?.toString();

          return match?.matchee;
        });

        return paginate(matchees, pagination.page, pagination.take);
      }

      const matchees = await this.matchRepository
        .find({ matcher: matcher._id }, "matchee", {
          limit: pagination.take,
          skip: (pagination.page - 1) * pagination.take
        })
        .populate({ path: "matchee" });

      const totalCount = await this.getMatcheeCount(matcher._id);

      const totalPages = Math.ceil(totalCount / pagination.take);

      return {
        totalCount,
        totalPages,
        list: matchees.map(({ matchee }) => matchee)
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findMatchers(matchee: User) {
    try {
      if (matchee.skillsWanted && matchee.skillsWanted.length > 0) {
        return await this.userRepository.find({
          isDeleted: false,
          type: UserType.Tutor,
          skillsOfferred: { $all: matchee.skillsWanted }
        });
      }

      return [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findMatchees(matcher: User) {
    try {
      if (matcher.skillsOfferred && matcher.skillsOfferred.length > 0) {
        return await this.userRepository.find({
          isDeleted: false,
          type: UserType.User,
          skillsWanted: { $all: matcher.skillsOfferred }
        });
      }

      return [];
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  @Cron("0 6,14,22 * * *", { name: "dailyMatchmaking" })
  async match() {
    return await inTransaction(this.connection, async session => {
      try {
        // 1. Find eligible users (students)
        const eligibleUsers = await this.userRepository
          .find({
            isDeleted: false,
            type: UserType.User,
            $or: [{ skillsWanted: { $not: { $size: 0 } } }]
          })
          .session(session);

        // 2. Find eligible tutors
        const eligibleTutors = await this.userRepository
          .find({
            isDeleted: false,
            type: UserType.Tutor,
            $or: [{ skillsOfferred: { $not: { $size: 0 } } }]
          })
          .session(session);

        // Pre-fetch all matches for efficiency
        const allUserIds = [
          ...eligibleUsers.map(u => u._id.toString()),
          ...eligibleTutors.map(t => t._id.toString())
        ];

        const allMatches = await this.matchRepository
          .find({
            isDeleted: false,
            $or: [
              { matcher: { $in: allUserIds } },
              { matchee: { $in: allUserIds } }
            ]
          })
          .session(session);

        // Helper: count matches by user and status
        const matchCounts = {};

        for (const match of allMatches) {
          const matcherId = match.matcher.toString();

          const matcheeId = match.matchee.toString();

          if (!matchCounts[matcherId]) {
            matchCounts[matcherId] = { draft: 0, confirmed: 0 };
          }

          if (!matchCounts[matcheeId]) {
            matchCounts[matcheeId] = { draft: 0, confirmed: 0 };
          }

          if (match.status === MatchStatusType.Confirmed) {
            matchCounts[matcherId].confirmed++;
            matchCounts[matcheeId].confirmed++;
          } else if (match.status === MatchStatusType.Draft) {
            matchCounts[matcherId].draft++;
            matchCounts[matcheeId].draft++;
          }
        }

        // Helper: check if a match exists between two users
        const matchExists = (a: string, b: string) => {
          return allMatches.some(m => {
            const matcherId = m.matcher.toString();

            const matcheeId = m.matchee.toString();

            const isAMatcherAndBMatchee =
              matcherId === a.toString() && matcheeId === b.toString();

            const isBMatcherAndAMatchee =
              matcherId === b.toString() && matcheeId === a.toString();

            const isMatched = isAMatcherAndBMatchee || isBMatcherAndAMatchee;

            const isExists = [
              MatchStatusType.Draft,
              MatchStatusType.Confirmed
            ].includes(m.status);

            return isMatched && !m.isDeleted && isExists;
          });
        };

        // 3. For each eligible user, try to create matches
        for (const user of eligibleUsers) {
          const userId = user._id.toString();

          const userDraft = matchCounts[userId]?.draft || 0;

          const userConfirmed = matchCounts[userId]?.confirmed || 0;

          if (userConfirmed >= 3 || userDraft >= 6) continue;

          // In-memory: Find tutors for this user (at least half the skills match)
          const userSkillsWanted = user.skillsWanted || [];

          const minSkills = Math.ceil(userSkillsWanted.length / 2);

          const tutors = eligibleTutors.filter(tutor => {
            const overlap = userSkillsWanted.filter(skill =>
              tutor.skillsOfferred.includes(skill)
            );

            return overlap.length >= minSkills;
          });

          // Prioritize tutors with fewest matches
          tutors.sort((a, b) => {
            const aId = a._id.toString();

            const bId = b._id.toString();

            const aCount =
              (matchCounts[aId]?.confirmed || 0) +
              (matchCounts[aId]?.draft || 0);

            const bCount =
              (matchCounts[bId]?.confirmed || 0) +
              (matchCounts[bId]?.draft || 0);

            return aCount - bCount;
          });

          for (const tutor of tutors) {
            // Ensure matchCounts objects exist before using
            const tutorId = tutor._id.toString();
            if (!matchCounts[userId]) {
              matchCounts[userId] = { draft: 0, confirmed: 0 };
            }
            if (!matchCounts[tutorId]) {
              matchCounts[tutorId] = { draft: 0, confirmed: 0 };
            }

            // Stop if user hits max BEFORE creating a new match
            if ((matchCounts[userId].draft || 0) >= 6) {
              break;
            }

            const tutorDraft = matchCounts[tutorId]?.draft || 0;

            const tutorConfirmed = matchCounts[tutorId]?.confirmed || 0;

            if (tutorConfirmed >= 3 || tutorDraft >= 6) {
              continue;
            }

            if (matchExists(userId, tutorId)) {
              continue;
            }

            // Create match
            await this.create(tutor, user, session);
            // Add to allMatches to prevent duplicates in this run
            allMatches.push({
              matcher: tutor._id.toString(),
              matchee: user._id.toString(),
              status: MatchStatusType.Draft,
              isDeleted: false
            } as any);

            // Update counts
            matchCounts[userId].draft = (matchCounts[userId].draft || 0) + 1;

            matchCounts[tutorId].draft = (matchCounts[tutorId].draft || 0) + 1;
          }
        }

        // 4. For each eligible tutor, try to create matches (symmetry)
        for (const tutor of eligibleTutors) {
          const tutorId = tutor._id.toString();

          const tutorDraft = matchCounts[tutorId]?.draft || 0;

          const tutorConfirmed = matchCounts[tutorId]?.confirmed || 0;

          if (tutorConfirmed >= 3 || tutorDraft + tutorConfirmed >= 3) continue;

          // In-memory: Find users for this tutor (at least half the skills match)
          const tutorSkillsOfferred = tutor.skillsOfferred || [];

          const users = eligibleUsers.filter(user => {
            const overlap = tutorSkillsOfferred.filter(skill =>
              user.skillsWanted.includes(skill)
            );

            const minSkills = Math.ceil(user.skillsWanted.length / 2);

            return overlap.length >= minSkills;
          });

          // Prioritize users with fewest matches
          users.sort((a, b) => {
            const aId = a._id.toString();

            const bId = b._id.toString();

            const aCount =
              (matchCounts[aId]?.confirmed || 0) +
              (matchCounts[aId]?.draft || 0);

            const bCount =
              (matchCounts[bId]?.confirmed || 0) +
              (matchCounts[bId]?.draft || 0);

            return aCount - bCount;
          });

          for (const user of users) {
            // Ensure matchCounts objects exist before using
            const userId = user._id.toString();

            if (!matchCounts[tutorId]) {
              matchCounts[tutorId] = { draft: 0, confirmed: 0 };
            }

            if (!matchCounts[userId]) {
              matchCounts[userId] = { draft: 0, confirmed: 0 };
            }

            // Stop if tutor hits max BEFORE creating a new match
            if ((matchCounts[tutorId].draft || 0) >= 6) {
              break;
            }

            const userDraft = matchCounts[userId]?.draft || 0;

            const userConfirmed = matchCounts[userId]?.confirmed || 0;

            if (userConfirmed >= 3 || userDraft >= 6) continue;

            if (matchExists(userId, tutorId)) continue;

            // Create match
            await this.create(tutor, user, session);
            // Add to allMatches to prevent duplicates in this run
            allMatches.push({
              matcher: tutor._id.toString(),
              matchee: user._id.toString(),
              status: MatchStatusType.Draft,
              isDeleted: false
            } as any);

            // Update counts
            matchCounts[userId].draft = (matchCounts[userId].draft || 0) + 1;

            matchCounts[tutorId].draft = (matchCounts[tutorId].draft || 0) + 1;
          }
        }

        await session.commitTransaction();

        return { success: true };
      } catch (error) {
        await session.abortTransaction();

        throw new InternalServerErrorException(error);
      }
    });
  }
}
