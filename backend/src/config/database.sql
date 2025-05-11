-- Database schema for Task Manager Application

-- Drop tables if they exist
DROP TABLE IF EXISTS task_resources;
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create clients table
CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  address VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create resources table (people)
CREATE TABLE resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  availability INT DEFAULT 100, -- Percentage of availability
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  client_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  estimated_hours DECIMAL(10, 2) NOT NULL,
  estimated_cost DECIMAL(15, 2) NOT NULL,
  budgeted_cost DECIMAL(15, 2) NOT NULL,
  actual_cost DECIMAL(15, 2) DEFAULT 0,
  description TEXT,
  status ENUM('pending', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Create tasks table
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  estimated_hours DECIMAL(10, 2) NOT NULL,
  hours_spent DECIMAL(10, 2) DEFAULT 0,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  status ENUM('pending', 'in_progress', 'completed', 'blocked') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create project_resources junction table
CREATE TABLE project_resources (
  project_id INT NOT NULL,
  resource_id INT NOT NULL,
  assigned_hours DECIMAL(10, 2) DEFAULT 0,
  PRIMARY KEY (project_id, resource_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- Create task_resources junction table
CREATE TABLE task_resources (
  task_id INT NOT NULL,
  resource_id INT NOT NULL,
  assigned_hours DECIMAL(10, 2) DEFAULT 0,
  PRIMARY KEY (task_id, resource_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- Add indexes for performance optimization
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_dates ON tasks(start_date, end_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_resources_role ON resources(role);
CREATE INDEX idx_project_resources_project_id ON project_resources(project_id);
CREATE INDEX idx_project_resources_resource_id ON project_resources(resource_id);

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@example.com', '$2a$10$BLMZFAnCPXX0cVRmdPP3Meu3NR/xDVGZ.YT8xzrxxfLkKiTjRZyia', 'admin');

-- Insert sample data (uncomment if needed)
/*
-- Sample clients
INSERT INTO clients (name, email, phone, address) VALUES 
('Acme Corporation', 'contact@acme.com', '123-456-7890', '123 Main St'),
('Globex Industries', 'info@globex.com', '987-654-3210', '456 Tech Dr'),
('Wayne Enterprises', 'contact@wayne.com', '555-123-4567', '1 Wayne Tower');

-- Sample resources
INSERT INTO resources (name, role, hourly_rate, email) VALUES 
('John Smith', 'Developer', 75.00, 'john@example.com'),
('Jane Doe', 'Designer', 65.00, 'jane@example.com'),
('Mike Johnson', 'Project Manager', 85.00, 'mike@example.com'),
('Sarah Williams', 'QA Engineer', 60.00, 'sarah@example.com');

-- Sample projects
INSERT INTO projects (name, client_id, start_date, end_date, estimated_hours, total_cost, description, status) VALUES 
('Website Redesign', 1, '2025-06-01', '2025-07-15', 120.00, 9000.00, 'Complete website redesign with new CMS integration', 'in_progress'),
('Mobile App Development', 2, '2025-06-15', '2025-08-30', 240.00, 18000.00, 'iOS and Android mobile app development', 'pending'),
('E-commerce Platform', 3, '2025-07-01', '2025-09-30', 300.00, 22500.00, 'Full e-commerce platform with payment integration', 'pending');
*/
