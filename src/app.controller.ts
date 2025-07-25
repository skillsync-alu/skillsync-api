import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

// This controller handles the root route of the app
@Controller()
export class AppController {
  // Injecting the AppService so we can use its methods
  constructor(private readonly appService: AppService) {}

  /**
   * This function handles GET requests to the root URL ('/')
   * It just returns a hello message from the service
   */
  @Get()
  getHello(): string {
    // Call the service to get the hello message
    return this.appService.getHello();
  }
}
