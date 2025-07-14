import { Test, TestingModule } from "@nestjs/testing";
import { StarResolver } from "./star.resolver";
import { StarService } from "../services/star.service";

describe("StarResolver", () => {
  let resolver: StarResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StarResolver, StarService]
    }).compile();

    resolver = module.get<StarResolver>(StarResolver);
  });

  it("should be defined", () => {
    expect(resolver).toBeDefined();
  });
});
