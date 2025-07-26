# SkillSync API

**Empowering skill-based collaboration through a robust backend**

---

## Overview

- SkillSync API is the backend powering a platform for skill-based collaboration across Africa.
- Facilitates authentication, match-making, real-time interactions, and password management with OTP.
- Built with NestJS and TypeScript for scalability and maintainability.
- Code quality ensured with ESLint and Prettier.
- Explore the frontend at [SkillSync Web](https://github.com/skillsync-alu/skillsync-web.git).

- **Authentication**: Handles secure user registration, login, and password reset with OTP.
- **Match-Making**: Connects users based on selected skills.
- **Real-Time Support**: Facilitates backend logic for messaging infrastructure.

---

## Features

### User Authentication
- Supports traditional login and registration flows.
- Ensures secure account management.
- Integrates forget and reset password functionality with OTP via Brevo API.

### Match-Making System
- Implements star, match, and matchmaking algorithms.
- Connects users based on skill compatibility.

### Real-Time Support
- Provides backend infrastructure for real-time messaging.
- Ensures efficient data handling for communication.

---

## Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Linting**: [ESLint](https://eslint.org/)
- **Formatting**: [Prettier](https://prettier.io/)

---

## Getting Started

### Prerequisites

- **Node.js**: Version >= 16.x
- **Yarn**: Package manager for dependencies
- **MongoDB or PostgreSQL**: Database (version >= 4.x or 13, respectively)
- A code editor (e.g., Visual Studio Code)

### Installation

```bash
git clone https://github.com/skillsync-alu/skillsync-api.git
cd skillsync-api
yarn install
```

---

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URI=your_database_connection_string

# Port Number to run
PORT=*****

# Environment type (local, development, production)
ENVIRONMENT=local

# Brevo api key for sending mails
BREVO_API_KEY=xkeysib-*******

# JWT Configuration
JWT_SECRET=***********

#Firebase
FIREBASE_PRIVATE_KEY=***********
```

---

## Running Locally

### Development Mode
```bash
# Start the development server
yarn start:dev
```

### Production Mode
```bash
# Build the application
yarn build

# Start the production server
yarn start:prod
```

### Testing
```bash
# Run unit tests
yarn test

# Run e2e tests
yarn test:e2e

# Run test coverage
yarn test:cov
```

---

## Project Structure

```
src/
├── authentication/                 # Authentication module
├── users/               # User management
├── matches/            # Match-making algorithms
├── feedbacks/           # Real-time messaging
├── shared/              # Shared utilities and decorators
├── config/              # Configuration files
└── main.ts             # Application entry point
```

---

## Core Workflows

### User Authentication
- Processes registration and login requests.
- Validates user credentials securely.
- Manages forget and reset password flows with OTP via Brevo API.

### Match-Making
- Executes algorithms to match users based on skills.
- Manages star and match logic.

### Real-Time Messaging
- Handles backend operations for real-time communication.
- Ensures data consistency and availability.

---

## License

MIT
