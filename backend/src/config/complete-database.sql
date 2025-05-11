-- Script completo de base de datos para Task Manager Application
-- Este script combina la creación inicial y las actualizaciones en un solo archivo

-- Verificar y crear tablas si no existen, sino modificarlas para agregar las columnas necesarias

-- 1. Comprobar y crear tabla users si no existe
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Comprobar y crear tabla clients si no existe
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  address VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Comprobar y crear tabla resources si no existe
CREATE TABLE IF NOT EXISTS resources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  availability INT DEFAULT 100, -- Porcentaje de disponibilidad
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Comprobar y crear tabla projects si no existe
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  client_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  estimated_hours DECIMAL(10, 2) NOT NULL,
  description TEXT,
  status ENUM('pending', 'in_progress', 'completed', 'on_hold', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 5. Agregar columnas de costos a projects si no existen
-- Columna estimated_cost
SELECT COUNT(*) INTO @column_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'projects' 
AND column_name = 'estimated_cost';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE projects ADD COLUMN estimated_cost DECIMAL(15, 2) DEFAULT 0', 
    'SELECT "Column estimated_cost already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Columna budgeted_cost (opcional)
SELECT COUNT(*) INTO @column_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'projects' 
AND column_name = 'budgeted_cost';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE projects ADD COLUMN budgeted_cost DECIMAL(15, 2) DEFAULT NULL', 
    'SELECT "Column budgeted_cost already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Columna actual_cost
SELECT COUNT(*) INTO @column_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'projects' 
AND column_name = 'actual_cost';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE projects ADD COLUMN actual_cost DECIMAL(15, 2) DEFAULT 0', 
    'SELECT "Column actual_cost already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Agregar foreign key a projects si no existe
SELECT COUNT(*) INTO @fk_exists 
FROM information_schema.table_constraints 
WHERE table_schema = DATABASE() 
AND table_name = 'projects' 
AND constraint_name = 'fk_projects_client';

SET @sql = IF(@fk_exists = 0, 
    'ALTER TABLE projects ADD CONSTRAINT fk_projects_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE', 
    'SELECT "FK fk_projects_client already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 7. Comprobar y crear tabla tasks si no existe
CREATE TABLE IF NOT EXISTS tasks (
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 8. Agregar foreign key a tasks si no existe
SELECT COUNT(*) INTO @fk_exists 
FROM information_schema.table_constraints 
WHERE table_schema = DATABASE() 
AND table_name = 'tasks' 
AND constraint_name = 'fk_tasks_project';

SET @sql = IF(@fk_exists = 0, 
    'ALTER TABLE tasks ADD CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE', 
    'SELECT "FK fk_tasks_project already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 9. Verificar y crear tabla project_resources si no existe
CREATE TABLE IF NOT EXISTS project_resources (
  project_id INT NOT NULL,
  resource_id INT NOT NULL,
  assigned_hours DECIMAL(10, 2) DEFAULT 0,
  PRIMARY KEY (project_id, resource_id),
  CONSTRAINT fk_pr_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_pr_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- 10. Verificar y crear tabla task_resources si no existe
CREATE TABLE IF NOT EXISTS task_resources (
  task_id INT NOT NULL,
  resource_id INT NOT NULL,
  assigned_hours DECIMAL(10, 2) DEFAULT 0,
  PRIMARY KEY (task_id, resource_id),
  CONSTRAINT fk_tr_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_tr_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- 11. Comprobar y crear índices para optimización de rendimiento
-- Índice idx_clients_name
SELECT COUNT(*) INTO @idx_exists 
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name = 'clients' 
AND index_name = 'idx_clients_name';

SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_clients_name ON clients(name)', 
    'SELECT "Index idx_clients_name already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice idx_projects_client_id
SELECT COUNT(*) INTO @idx_exists 
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name = 'projects' 
AND index_name = 'idx_projects_client_id';

SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_projects_client_id ON projects(client_id)', 
    'SELECT "Index idx_projects_client_id already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice idx_projects_dates
SELECT COUNT(*) INTO @idx_exists 
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name = 'projects' 
AND index_name = 'idx_projects_dates';

SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_projects_dates ON projects(start_date, end_date)', 
    'SELECT "Index idx_projects_dates already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice idx_tasks_project_id
SELECT COUNT(*) INTO @idx_exists 
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name = 'tasks' 
AND index_name = 'idx_tasks_project_id';

SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_tasks_project_id ON tasks(project_id)', 
    'SELECT "Index idx_tasks_project_id already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice idx_tasks_dates
SELECT COUNT(*) INTO @idx_exists 
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name = 'tasks' 
AND index_name = 'idx_tasks_dates';

SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_tasks_dates ON tasks(start_date, end_date)', 
    'SELECT "Index idx_tasks_dates already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice idx_tasks_priority
SELECT COUNT(*) INTO @idx_exists 
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name = 'tasks' 
AND index_name = 'idx_tasks_priority';

SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_tasks_priority ON tasks(priority)', 
    'SELECT "Index idx_tasks_priority already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice idx_tasks_status
SELECT COUNT(*) INTO @idx_exists 
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name = 'tasks' 
AND index_name = 'idx_tasks_status';

SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_tasks_status ON tasks(status)', 
    'SELECT "Index idx_tasks_status already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice idx_resources_role
SELECT COUNT(*) INTO @idx_exists 
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name = 'resources' 
AND index_name = 'idx_resources_role';

SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_resources_role ON resources(role)', 
    'SELECT "Index idx_resources_role already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice idx_project_resources_project_id
SELECT COUNT(*) INTO @idx_exists 
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name = 'project_resources' 
AND index_name = 'idx_project_resources_project_id';

SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_project_resources_project_id ON project_resources(project_id)', 
    'SELECT "Index idx_project_resources_project_id already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índice idx_project_resources_resource_id
SELECT COUNT(*) INTO @idx_exists 
FROM information_schema.statistics 
WHERE table_schema = DATABASE() 
AND table_name = 'project_resources' 
AND index_name = 'idx_project_resources_resource_id';

SET @sql = IF(@idx_exists = 0, 
    'CREATE INDEX idx_project_resources_resource_id ON project_resources(resource_id)', 
    'SELECT "Index idx_project_resources_resource_id already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 12. Insertar usuario administrador por defecto si no existe (password: admin123)
SELECT COUNT(*) INTO @admin_exists 
FROM users 
WHERE username = 'admin';

SET @sql = IF(@admin_exists = 0, 
    "INSERT INTO users (username, email, password, role) VALUES ('admin', 'admin@example.com', '$2b$10$l.hPZVk5dT6QI2q.S7qupOXWcR2dE4vxXAxvptx0RVHb/ttrBV3X2', 'admin')", 
    'SELECT "Admin user already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Mensaje de finalización
SELECT 'Base de datos actualizada exitosamente' AS 'Status';
