import { UserType } from "../../users/interfaces/user.interface";
import { ExecutionContext, mixin } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Guard } from "./authentication.guard";

// This guard allows only users of certain types to access a route
export const Roles = (userTypes: UserType[]): any => {
  return mixin(
    class ScopesAuth extends Guard {
      async canActivate(context: ExecutionContext): Promise<boolean> {
        if (!userTypes?.length) {
          return true;
        }
        const GraphQLContext = GqlExecutionContext.create(context);
        let req = GraphQLContext.getContext()?.req;
        if (!req) {
          req = context.switchToHttp().getRequest();
        }
        // Only allow if the user's type is in the allowed list
        return userTypes.includes(req?.user?.type);
      }
    }
  );
};
