SkillSync API
Overview

SkillSync API is the backend powering a platform for skill-based collaboration.
Facilitates authentication, match-making, and real-time interactions.
Built with NestJS and TypeScript for scalability and maintainability.
Code quality ensured with ESLint and Prettier.

Features

User Authentication
Manages traditional login and registration flows.


Match-Making System
Implements star, match, and matchmaking algorithms.


Real-Time Support
Provides backend logic for real-time messaging.



Tech Stack

Framework: NestJS
Language: TypeScript
Linting: ESLint
Formatting: Prettier
Frontend: SkillSync Web
Frontend: React
Build Tool: Vite
State Management: Recoil
Routing: TanStack Router
API Integration: Apollo Client
Authentication & Messaging: Firebase
Styling: Tailwind CSS



Getting Started
Prerequisites

Node.js: Version >= 16.x
Yarn: Package manager for dependencies
MongoDB or PostgreSQL: Database (version >= 4.x or 13, respectively)
A code editor (e.g., Visual Studio Code)

Installation

Clone the Repository
git clone https://github.com/skillsync-alu/skillsync-api.git
cd skillsync-api


Install Dependencies
yarn install


Set Up Environment Variables

Create a .env file with:PORT=[e.g., 3000]
DATABASE_URL=[Your database connection string]
JWT_SECRET=[Your JWT secret key]


Refer to .env.example for additional variables.


Run the Application
yarn start


Access at http://localhost:[PORT, e.g., 3000].



Development

Run in development mode with hot reloading:yarn start:dev



Testing

Execute tests:yarn test



Project Structure
Structure skillsync-api/├── src/ # 1. Source code directory│   ├── [controllers/] # 2. Request handlers for API endpoints│   ├── [models/] # 3. Database schemas and models│   ├── [routes/] # 4. API route definitions│   ├── [services/] # 5. Business logic for authentication and match-making│   ├── [middleware/] # 6. Authentication and other middleware│   └── main.ts # 7. Main application entry point├── tests/ # 8. Test files├── .eslintrc.js # 9. ESLint configuration├── .prettierrc # 10. Prettier configuration├── .env.example # 11. Example environment variables├── .gitignore # 12. Files and folders to ignore in git├── nest-cli.json # 13. NestJS CLI configuration├── package.json # 14. Project dependencies and scripts├── tsconfig.json # 15. TypeScript configuration└── yarn.lock # 16. Yarn dependency lock file  
Core Workflows

User Authentication
Handles registration and login processes.


Match-Making
Executes star, match, and matchmaking logic.


Real-Time Messaging
Supports backend operations for real-time communication.



License
This project is licensed under the MIT License. See the LICENSE file for details.
