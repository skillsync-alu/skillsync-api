import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";

// Gets the current user from the request (works for both HTTP and GraphQL)
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    if (context.getType() === "http") {
      // For REST requests
      return context.switchToHttp().getRequest().user;
    }
    // For GraphQL requests
    return GqlExecutionContext.create(context).getContext().req.user;
  }
);
