# Night School App Backend

This repository contains the backend code for the Night School App, built using [NestJS](https://nestjs.com/), [TypeORM](https://typeorm.io/), and [cache-manager](https://github.com/BryanDonovan/node-cache-manager). The backend provides a robust API for managing calendar events and other functionalities.

## Features

- **RESTful API Endpoints:** Manage calendar events and more.
- **Database Integration:** Uses TypeORM for interacting with a relational database.
- **Caching:** Implements caching via cache-manager to improve performance.
- **Resilient Operations:** Uses a retry mechanism for critical operations.
- **Logging & Metrics:** Includes interceptors and logging for monitoring performance.

## Getting Started

### Prerequisites

- **Node.js** (>=14.x)
- **npm** (>=6.x) or **yarn**
- A supported relational database (e.g., PostgreSQL)
- Do not support Typescript Version above 5.0.X


### Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/gijaeAhn/NightSchool_Management.git
   npm install 
