import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { UpdateUserInput } from "../inputs/update-user.input";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserRepository } from "../models/user.model";
import { PaginationQuery } from "../../shared/services/pagination/interfaces/pagination.interface";
import { UsersFilterInput } from "../inputs/users-filter.input";
import { PaginationService } from "../../shared/services/pagination/services/pagination.service";
import { omit } from "lodash";
import { EncryptionService } from "../../shared/services/encryption/services/encryption.service";
import { Types } from "mongoose";
import { Empty_Token_Error_Message } from "../../authentication/messages/authentication.message";

const keywords = ["firstName", "lastName", "username", "email", "phoneNumber"];

@Injectable()
export class UserService {
  constructor(
    private readonly paginationService: PaginationService,
    private readonly encryptionService: EncryptionService,
    @InjectModel(User.name) private readonly userRepository: UserRepository
  ) {}

  async getUsers(filter: UsersFilterInput) {
    try {
      const { take = 10, page = 1, keyword = "", type } = filter;

      const query: PaginationQuery<User> = {
        page,
        take,
        isDeleted: false,
        sort: { createdAt: -1 }
      };

      if (type || keyword) {
        query.$or = [];

        if (type) {
          query.$or.push([{ type }]);
        }

        if (keyword) {
          query.$or.push(
            ...keywords.map(key => ({
              [key]: { $regex: new RegExp(keyword.split(" ").join("|"), "i") }
            }))
          );
        }
      }

      return await this.paginationService.paginate(this.userRepository, query);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUser(token: string, username?: string) {
    try {
      if (username) {
        const profile = await this.userRepository.findOne(
          {
            username,
            isDeleted: false
          },
          "id firstName lastName username avatar bio createdAt"
        );

        if (!profile) {
          throw new NotFoundException(
            `User with Username: (${username}) either does not exist or has been deleted.`
          );
        }

        return profile;
      }

      const user = await this.getUserByToken(token);

      if (!user) {
        throw new UnauthorizedException(Empty_Token_Error_Message);
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUserByToken(token: string) {
    try {
      if (token === "null" || !token) {
        return null;
      }

      const payload = await this.encryptionService.verify(
        token.split("Bearer ")[1]
      );

      return await this.userRepository.findOne({
        isDeleted: false,
        _id: new Types.ObjectId(payload?.id)
      });
    } catch (error) {
      return null;
    }
  }

  async updateUser(user: User, input: UpdateUserInput) {
    try {
      Object.entries(omit(input, ["avatarInput"])).forEach(([key, value]) => {
        if (key in user) {
          if (key === "avatar" && !!value) {
            return;
          }

          user[key] = value;
        }
      });

      if (input.shouldRemoveAvatar && user.avatar) {
        // if (user.avatar.includes("cloudinary")) {
        //     await this.mediaService.deleteFile(user.id);

        //     await this.mediaService.deleteByFolder(`users/${user.id}`);
        //   }

        user.avatar = "";
      }

      // if (input.avatarInput) {
      //   const response = await this.mediaService.uploadFile(
      //     Buffer.from(cleanBase64(input.avatarInput.uri), "base64"),
      //     {
      //       public_id: user.id,
      //       resource_type: "image",
      //       asset_folder: `users/${user.id}/avatar`
      //     }
      //   );

      //   user.avatar = response.secure_url;
      // }

      await user.save();

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async deleteUser(user: User) {
    try {
      user.isDeleted = true;

      // await this.mediaService.deleteByFolder(`users/${user.id}`);

      return await user.save();
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
