# Task Manager Application

A full-stack task management application for client projects.

## Features

- **Client Management**: Create and manage clients
- **Project Management**: Track projects with start/end dates, estimated hours, and costs
- **Task Management**: Create tasks with dates, hours, assigned resources, and priorities
- **Resource Management**: Track people resources with hourly rates and roles
- **Scheduling**: Visualize tasks in a timeline/calendar view for planning

## Tech Stack

### Backend
- **Node.js** with Express
- **MySQL** database
- **JWT** for authentication
- **REST API** architecture

### Frontend
- **React** with Hooks and functional components
- **Vite** as build tool
- **Material UI** for the component library
- **React Router** for navigation
- **Recharts** for data visualization

## Prerequisites

- Node.js (v14+)
- MySQL (v8+)
- npm or yarn

## Setup Instructions

### Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE task_manager;
```

2. Import the database schema:
```bash
mysql -u your_username -p task_manager < backend/src/config/database.sql
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MySQL credentials and JWT secret

5. Start the backend server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API server will run on http://localhost:5000 by default.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
touch .env
```

4. Add the API URL to the `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

5. Start the frontend development server:
```bash
npm run dev
```

The React application will run on http://localhost:5173 by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user profile

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Create a new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects/client/:clientId` - Get projects by client ID
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/hours` - Get total hours spent on a project

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `GET /api/tasks/project/:projectId` - Get tasks by project ID
- `GET /api/tasks/resource/:resourceId` - Get tasks by resource ID
- `GET /api/tasks/dates` - Get tasks by date range
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Resources
- `GET /api/resources` - Get all resources
- `GET /api/resources/:id` - Get resource by ID
- `GET /api/resources/task/:taskId` - Get resources by task ID
- `GET /api/resources/role/:role` - Get resources by role
- `POST /api/resources` - Create a new resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

## Default Login

After setting up the database, you can use the following credentials to login:

- **Email**: admin@example.com
- **Password**: admin123

## License

This project is licensed under the MIT License.