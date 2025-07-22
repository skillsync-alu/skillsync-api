import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ClientSession, Types } from "mongoose";
import { Match } from "../../matches/models/match.model";
import { Feedback, FeedbackRepository } from "../models/feedback.model";
import { User } from "../../users/models/user.model";
import { UpdateFeedbackInput } from "../inputs/update-feedback.input";
import { UserType } from "../../users/interfaces/user.interface";
import { FeedbackUserType } from "../interfaces/feedback.interface";

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel(Feedback.name)
    private readonly feedbackRepository: FeedbackRepository
  ) {}

  async create(match: Match, session: ClientSession) {
    try {
      if (!match?.matchee?.firstName || !match?.matcher?.firstName) {
        await match.populate(["matchee", "matcher"]);
      }

      return await this.feedbackRepository.create(
        [
          {
            match: match._id,
            matchee: match.matchee._id,
            matcher: match.matcher._id
          }
        ],
        { session }
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getFeedback(match: Types.ObjectId, user: User) {
    try {
      const feedback = await this.feedbackRepository.findOne({
        match,
        isDeleted: false,
        $or: [{ matcher: user._id }, { matchee: user._id }]
      });

      if (!feedback) {
        throw new UnauthorizedException();
      }

      return feedback;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateFeedback(input: UpdateFeedbackInput, user: User) {
    try {
      const feedback = await this.feedbackRepository.findOne({
        isDeleted: false,
        match: input.match,
        $or: [{ matcher: user._id }, { matchee: user._id }]
      });

      if (!feedback) {
        throw new UnauthorizedException();
      }

      feedback.messages.push({
        user: user._id as any,
        message: input.message,
        timeStamp: new Date(),
        userType:
          user.type === UserType.Tutor
            ? FeedbackUserType.Matcher
            : FeedbackUserType.Matchee
      });

      return await feedback.save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
