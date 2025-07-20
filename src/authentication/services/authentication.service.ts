import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { EncryptionService } from "../../shared/services/encryption/services/encryption.service";
import { User, UserRepository } from "../../users/models/user.model";
import { CreateUserInput } from "../inputs/create-user.input";
import { inTransaction } from "../../utilities/transaction";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Connection, Types } from "mongoose";
import { isAdmin, isAdminType } from "../../users/constants/user.constant";
import { LoginUserInput } from "../inputs/login-user.input";
import {
  Password_Incorrect_Message,
  User_Notfound_Message
} from "../messages/authentication.message";
import { SocialLoginInput } from "../inputs/social-login.input";
import { SocialLoginType } from "../interfaces/authentication.interface";
import { Auth, google } from "googleapis";
import { AuthResponse } from "../responses/authentication.response";
// import { WalletService } from "../../wallets/services/wallet.service";
import { Currency } from "../../shared/interfaces/shared.interface";
import { getClientIp } from "@supercharge/request-ip";
import { currencyCountries } from "../../shared/constants/shared.constant";
import { lookup } from "geoip-country";
import { stringify } from "../../utilities/stringify-json";
import { CountryCode } from "libphonenumber-js";
import { ForgotPasswordInput } from "../inputs/forgot-password.input";
import { parse } from "platform";
import { ResetPasswordInput } from "../inputs/reset-password.input";
import { ChangePasswordInput } from "../inputs/change-password.input";
import { minLength } from "class-validator";

@Injectable()
export class AuthenticationService {
  private readonly googleService: Auth.OAuth2Client;

  constructor(
    private readonly loggerService: Logger,
    // private readonly walletService: WalletService,
    private readonly encryptionService: EncryptionService,
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(User.name) private readonly userRepository: UserRepository
  ) {
    this.googleService = new google.auth.OAuth2();
  }

  getCurrency(context: any): Currency {
    try {
      const ip = getClientIp(context.req as Request);

      return currencyCountries[lookup(ip)?.country] || Currency.NGN;
    } catch (error) {
      this.loggerService.log(stringify({ error }), "Currency Error");

      return Currency.NGN;
    }
  }

  getPhoneCode(context: any): CountryCode {
    try {
      return (
        (lookup(getClientIp(context.req as Request)).country as CountryCode) ||
        "NG"
      );
    } catch (error) {
      this.loggerService.log(stringify({ error }), "Phone Code Error");

      return "NG";
    }
  }

  private async generateUserTokens(user: User) {
    try {
      const payload = { id: user.id, type: user.type };

      const accessToken = await this.encryptionService.sign(payload, {
        expiresIn: isAdmin(user) ? "1d" : "1w"
      });

      const refreshToken = await this.encryptionService.sign(payload, {
        expiresIn: "4w"
      });

      return { accessToken, refreshToken };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private async generateUsername(input: {
    firstName: string;
    lastName: string;
  }) {
    let username = "";

    while (!username) {
      const name = `${(input.firstName || "")?.toLowerCase()}${
        input.lastName ? `_${input.lastName.toLowerCase()}` : ""
      }${Math.floor(Math.random() * 100)}`;

      const existingUserName = await this.userRepository.exists({
        username: name
      });

      if (!existingUserName) {
        username = name;
      }
    }

    return username;
  }

  private async generateProviderPassword(provider: SocialLoginType) {
    return await this.encryptionService.hash(provider);
  }

  private decodeProviderPassword(password: string): SocialLoginType {
    let provider: SocialLoginType;

    Object.values(SocialLoginType).forEach(type => {
      if (this.encryptionService.compare(type, password)) {
        provider = type;
      }
    });

    return provider;
  }

  async createUser(input: CreateUserInput, context: any) {
    return await inTransaction(this.connection, async session => {
      try {
        let username = input?.username || "";

        if (isAdminType(input.type)) {
          throw new UnauthorizedException();
        }

        if (!input.username) {
          username = await this.generateUsername(input);
        }

        if (!input.phoneCode) {
          input.phoneCode = this.getPhoneCode(context);
        }

        const newUser = { ...input, username };

        if (newUser?.referredBy) {
          const referrer = await this.userRepository.existsByIdentity(
            newUser.referredBy
          );

          if (!referrer) {
            throw new NotFoundException("This referrer doesn't exist");
          } else {
            newUser.referredBy = referrer._id;
          }
        }

        const [user] = await this.userRepository.create([newUser], { session });

        // await this.walletService.createWallet(user, session);

        await session.commitTransaction();

        return await this.generateUserTokens(user);
      } catch (error) {
        await session.abortTransaction();

        throw new InternalServerErrorException(error);
      }
    });
  }

  async createUserBySocialMedia(input: SocialLoginInput, context: any) {
    return await inTransaction(this.connection, async session => {
      try {
        let user: User, existingUser: User;

        if (!input.userType) {
          throw new BadRequestException(
            "Please provide user type before creating account"
          );
        }

        switch (input.type) {
          case SocialLoginType.Google: {
            const { userinfo: client } = google.oauth2("v2");

            this.googleService.setCredentials({ access_token: input.token });

            const response = await client.get({ auth: this.googleService });

            if (!response.data) {
              break;
            }

            const currentUser = await this.userRepository.findOne(
              { email: response.data.email, isDeleted: false },
              "id type email"
            );

            if (currentUser) {
              existingUser = currentUser;

              break;
            }

            const userInput = {
              email: response.data.email,
              firstName: response.data.given_name,
              lastName: response.data.family_name || "",
              phoneCode: this.getPhoneCode(context),
              username: await this.generateUsername({
                firstName: response.data.given_name,
                lastName: response.data.family_name || ""
              }),
              type: input.userType,
              avatar: response.data.picture.replace(/=s\d+-c$/, ""),
              password: await this.generateProviderPassword(input.type)
            };

            [user] = await this.userRepository.create([userInput], { session });

            break;
          }

          default: {
            throw new BadRequestException("Please provide a social login type");
          }
        }

        if (existingUser) {
          await session.commitTransaction();

          return await this.generateUserTokens(existingUser);
        }

        if (!user) {
          throw new BadRequestException("No User was created");
        }

        // await this.walletService.createWallet(user, session);

        await session.commitTransaction();

        return await this.generateUserTokens(user);
      } catch (error) {
        await session.abortTransaction();
        throw new InternalServerErrorException(error);
      }
    });
  }

  async loginUser(input: LoginUserInput) {
    try {
      const { identifier, password } = input;

      const identity = await this.userRepository.findByIdentity(
        identifier,
        "+password"
      );

      if (!identity) {
        throw new ConflictException(Password_Incorrect_Message);
      }

      const isPasswordCorrect = await this.encryptionService.compare(
        password,
        identity.password
      );

      if (!isPasswordCorrect) {
        throw new ConflictException(Password_Incorrect_Message);
      }

      return await this.generateUserTokens(identity);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async loginUserBySocialMedia(input: SocialLoginInput) {
    try {
      let user: User;

      switch (input.type) {
        case SocialLoginType.Google: {
          const tokenInfo = await this.googleService.getTokenInfo(input.token);

          if (!tokenInfo.email) {
            break;
          }

          user = await this.userRepository.findOne(
            { email: tokenInfo.email, isDeleted: false },
            "id type email"
          );

          break;
        }

        default:
          break;
      }

      if (!user) {
        throw new BadRequestException(User_Notfound_Message);
      }

      return await this.generateUserTokens(user);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async forgotPassword(input: ForgotPasswordInput, context: any) {
    try {
      const { identifier } = input;

      const user = await this.userRepository.findByIdentity(identifier);

      if (!user) {
        return new AuthResponse(
          true,
          "We have sent a mail to this user contingent that this user exists"
        );
      }

      const device = parse(context?.req?.headers?.["user-agent"]);

      const agent = `${device.name || ""} ${device.os.version || ""} device`;

      // const code = await this.otpService.generate(identifier);

      const params = { code: "", agent, name: user.firstName };

      //   await this.mailService.send({
      //     params,
      //     to: user.email,
      //     template: MailTemplate.ForgotPassword,
      //     subject: `Hello ${user.firstName}, you requested for a Password Reset`
      //   });

      // #TODO: change this!
      return new AuthResponse(!!params);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async resetPassword(input: ResetPasswordInput) {
    try {
      // const identifier = await this.otpService.verifyOtp(input.code);

      const identifier = "";

      const user = await this.userRepository.findByIdentity(identifier);

      if (!user) {
        throw new NotFoundException(User_Notfound_Message);
      }

      user.password = input.password;

      return new AuthResponse(Boolean(await user.save()));
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async changePassword(input: ChangePasswordInput, userId: Types.ObjectId) {
    try {
      const user = await this.userRepository.findById(userId, "+password");

      const isPasswordCorrect = await this.encryptionService.compare(
        input.oldPassword,
        user.password
      );

      if (!isPasswordCorrect) {
        throw new UnauthorizedException(Password_Incorrect_Message);
      }

      if (!minLength(input.newPassword, 8)) {
        throw new BadRequestException(
          "Please ensure that your password is at least 8 characters long"
        );
      }

      user.password = input.newPassword;

      return new AuthResponse(Boolean(await user.save()));
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async checkUsername(username: string, user: User) {
    try {
      if (!username) {
        return new AuthResponse(false, "Please provide a username");
      }

      if (username === user.username) {
        return new AuthResponse(true, "This is your current username");
      }

      const usernameExists = !Boolean(
        await this.userRepository.exists({ username })
      );

      if (!usernameExists) {
        return new AuthResponse(
          usernameExists,
          "This username is not available"
        );
      }

      return new AuthResponse(usernameExists, "This username is available! 🚀");
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
