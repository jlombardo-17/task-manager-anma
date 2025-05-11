-- Script SQL simplificado para actualizar las tablas existentes

-- 1. Crear la tabla project_resources si no existe
CREATE TABLE IF NOT EXISTS project_resources (
  project_id INT NOT NULL,
  resource_id INT NOT NULL,
  assigned_hours DECIMAL(10, 2) DEFAULT 0,
  PRIMARY KEY (project_id, resource_id),
  CONSTRAINT fk_pr_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_pr_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- 2. Crear la tabla task_resources si no existe
CREATE TABLE IF NOT EXISTS task_resources (
  task_id INT NOT NULL,
  resource_id INT NOT NULL,
  assigned_hours DECIMAL(10, 2) DEFAULT 0,
  PRIMARY KEY (task_id, resource_id),
  CONSTRAINT fk_tr_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_tr_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- 3. Verificar si la columna estimated_cost existe y agregarla si no existe
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

-- 4. Verificar si la columna budgeted_cost existe y agregarla si no existe
SELECT COUNT(*) INTO @column_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND table_name = 'projects' 
AND column_name = 'budgeted_cost';

SET @sql = IF(@column_exists = 0, 
    'ALTER TABLE projects ADD COLUMN budgeted_cost DECIMAL(15, 2) DEFAULT 0', 
    'SELECT "Column budgeted_cost already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Verificar si la columna actual_cost existe y agregarla si no existe
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
