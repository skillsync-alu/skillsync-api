SkillSync API
Overview
SkillSync API is the backend for a platform designed to facilitate skill-based collaboration through match-making and real-time interactions. It provides endpoints for user authentication, star/match functionality, and a matchmaking algorithm. Built with NestJS and TypeScript, the API ensures a scalable and maintainable architecture with robust code quality enforced by ESLint and Prettier.
Features

User Authentication: Supports traditional authentication flows for secure user registration and login.
Match-Making System: Implements star, match, and matchmaking algorithm flows to connect users based on skills or preferences.
Real-Time Messaging: Enables real-time communication between matched users.
Scalable Architecture: Designed for efficient data handling and extensibility using NestJS.

Technologies Used

NestJS: Framework for building scalable server-side applications.
TypeScript: For type-safe JavaScript development.
ESLint & Prettier: For consistent code quality and formatting.
MongoDB/PostgreSQL: For storing user and match data (update with actual database used).

Getting Started
Prerequisites

Node.js: Version >= 16.x
Yarn: Package manager for dependency installation
MongoDB >= 4.x or PostgreSQL >= 13: Ensure the database is installed and running
A code editor like Visual Studio Code

Installation

Clone the Repository:
git clone https://github.com/skillsync-alu/skillsync-api.git
cd skillsync-api


Install Dependencies:
yarn install


Set Up Environment Variables: Create a .env file in the root directory and add the following:
PORT=[Specific Port, e.g., 3000]
DATABASE_URL=[Your Database Connection String]
JWT_SECRET=[Your JWT Secret Key]
[Other Variables, e.g., REDIS_URL, WEBSOCKET_URL]

Refer to .env.example (if available) for a full list of required variables.

Run the Application:
yarn start

The API will be available at http://localhost:[Specific Port, e.g., 3000].


Development
To run the API in development mode with hot reloading:
yarn start:dev

Testing
Run unit and integration tests (if available):
yarn test

API Endpoints
Below are key endpoints based on recent features (update with actual endpoints from your codebase):



Method
Endpoint
Description



POST
/auth/register
Register a new user


POST
/auth/login
Authenticate a user


POST
/match/make
Initiate a match-making process


GET
/match/stars
Retrieve user stars or matches


For detailed API documentation, refer to [Postman Documentation Link or /docs endpoint, if applicable].
Project Structure
skillsync-api/
├── src/
│   ├── [controllers/]       # Request handlers for API endpoints
│   ├── [models/]           # Database schemas/models
│   ├── [routes/]           # API route definitions
│   ├── [services/]         # Business logic for auth and match-making
│   ├── [middleware/]       # Authentication and other middleware
│   └── main.ts             # Main application entry point
├── tests/                  # Test files
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── .env.example            # Example environment variables
├── .gitignore              # Files/folders to ignore in git
├── nest-cli.json           # NestJS CLI configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── yarn.lock               # Yarn dependency lock file

