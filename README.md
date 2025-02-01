# Frontend Service

The **Frontend Service** is the user interface for the Pharmakart platform. It is built using **Next.js** with **TypeScript** and provides a seamless experience for users to browse, order, and manage medications.

---

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Prerequisites](#prerequisites)
4. [Setup and Installation](#setup-and-installation)
5. [Running the Application](#running-the-application)
6. [Development](#development)
7. [Environment Variables](#environment-variables)
8. [Contributing](#contributing)
9. [License](#license)

---

## Overview

The Frontend Service is a **Next.js** application that serves as the user interface for Pharmakart. It includes:
- A responsive and user-friendly interface.
- Integration with the backend API for data fetching and processing.
- TypeScript for type safety and better developer experience.

---

## Features

- **User Authentication**: Login and registration flows.
- **Medication Browsing**: Browse and search for medications.
- **Order Management**: Place and track medication orders.
- **Prescription Upload**: Securely upload prescriptions for medication orders.
- **Responsive Design**: Optimized for desktop and mobile devices.

---

## Prerequisites

Before setting up the project, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn** (v1.22 or higher)
- **Docker** (optional, for containerized deployment)

---

## Setup and Installation

### 1. Clone the Repository
Clone the repository and navigate to the `frontend-svc` directory:
```bash
git clone https://github.com/PharmaKart/frontend-svc.git
cd frontend-svc
```

### 2. Install Dependencies
Install the required dependencies:
```bash
npm install
```
or
```bash
yarn install
```

---

## Running the Application

### Start the Development Server
To run the application in development mode:
```bash
npm run dev
```
or
```bash
yarn dev
```

The application will be available at:
- **Local Development**: `http://localhost:3000`

### Build for Production
To build the application for production:
```bash
npm run build
```
or
```bash
yarn build
```

### Start the Production Server
To start the production server:
```bash
npm start
```
or
```bash
yarn start
```

---

## Development

### Linting and Formatting
- **ESLint**: Check for linting errors:
  ```bash
  npm run lint
  ```
  or
  ```bash
  yarn lint
  ```

- **Prettier**: Format the code:
  ```bash
  npm run format
  ```
  or
  ```bash
  yarn format
  ```

### Testing
Run unit tests:
```bash
npm test
```
or
```bash
yarn test
```

---

## Environment Variables

The application requires the following environment variables. Create a `.env.local` file in the root directory and add the following:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080  # Backend API URL
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your-ga-id  # Google Analytics ID (optional)
```

---

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Submit a pull request with a detailed description of your changes.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Support

For any questions or issues, please open an issue in the repository or contact the maintainers.