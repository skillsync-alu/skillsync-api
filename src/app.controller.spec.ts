import { Test, TestingModule } from "@nestjs/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

/*
  This file tests the AppController to make sure it works as expected.
  We're using Jest and NestJS's testing utilities.
*/
describe("AppController", () => {
  let appController: AppController;

  // Before each test, set up a fresh testing module
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService]
    }).compile();

    // Get an instance of the controller from the testing module
    appController = app.get<AppController>(AppController);
  });

  // Test the root route
  describe("root", () => {
    it('should return "Hello World!"', () => {
      // We expect the getHello() method to return the string "Hello World!"
      expect(appController.getHello()).toBe("Hello World!");
    });
  });
});
