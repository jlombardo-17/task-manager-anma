-- Actualización de esquema para base de datos existente
-- Este script actualiza las tablas existentes sin eliminarlas

-- Verificar y actualizar tabla projects
-- Usar procedimientos para comprobar si existen las columnas
-- Columna estimated_cost
SET @exist_estimated_cost = (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'estimated_cost'
);
SET @alter_estimated_cost = IF(@exist_estimated_cost = 0, 
    'ALTER TABLE projects ADD COLUMN estimated_cost DECIMAL(15, 2) DEFAULT 0', 
    'SELECT "Column estimated_cost already exists"'
);
PREPARE stmt_estimated_cost FROM @alter_estimated_cost;
EXECUTE stmt_estimated_cost;
DEALLOCATE PREPARE stmt_estimated_cost;

-- Columna budgeted_cost
SET @exist_budgeted_cost = (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'budgeted_cost'
);
SET @alter_budgeted_cost = IF(@exist_budgeted_cost = 0, 
    'ALTER TABLE projects ADD COLUMN budgeted_cost DECIMAL(15, 2) DEFAULT 0', 
    'SELECT "Column budgeted_cost already exists"'
);
PREPARE stmt_budgeted_cost FROM @alter_budgeted_cost;
EXECUTE stmt_budgeted_cost;
DEALLOCATE PREPARE stmt_budgeted_cost;

-- Columna actual_cost
SET @exist_actual_cost = (
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'actual_cost'
);
SET @alter_actual_cost = IF(@exist_actual_cost = 0, 
    'ALTER TABLE projects ADD COLUMN actual_cost DECIMAL(15, 2) DEFAULT 0', 
    'SELECT "Column actual_cost already exists"'
);
PREPARE stmt_actual_cost FROM @alter_actual_cost;
EXECUTE stmt_actual_cost;
DEALLOCATE PREPARE stmt_actual_cost;

-- Verificar y crear tabla project_resources si no existe
CREATE TABLE IF NOT EXISTS project_resources (
  project_id INT NOT NULL,
  resource_id INT NOT NULL,
  assigned_hours DECIMAL(10, 2) DEFAULT 0,
  PRIMARY KEY (project_id, resource_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- Verificar y crear tabla task_resources si no existe
CREATE TABLE IF NOT EXISTS task_resources (
  task_id INT NOT NULL,
  resource_id INT NOT NULL,
  assigned_hours DECIMAL(10, 2) DEFAULT 0,
  PRIMARY KEY (task_id, resource_id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
);

-- Añadir índices si no existen utilizando procedimientos
-- Índice idx_project_resources_project_id
SET @exist_idx1 = (
    SELECT COUNT(*) FROM information_schema.statistics 
    WHERE table_name = 'project_resources' AND index_name = 'idx_project_resources_project_id'
);
SET @create_idx1 = IF(@exist_idx1 = 0, 
    'CREATE INDEX idx_project_resources_project_id ON project_resources(project_id)', 
    'SELECT "Index idx_project_resources_project_id already exists"'
);
PREPARE stmt_idx1 FROM @create_idx1;
EXECUTE stmt_idx1;
DEALLOCATE PREPARE stmt_idx1;

-- Índice idx_project_resources_resource_id
SET @exist_idx2 = (
    SELECT COUNT(*) FROM information_schema.statistics 
    WHERE table_name = 'project_resources' AND index_name = 'idx_project_resources_resource_id'
);
SET @create_idx2 = IF(@exist_idx2 = 0, 
    'CREATE INDEX idx_project_resources_resource_id ON project_resources(resource_id)', 
    'SELECT "Index idx_project_resources_resource_id already exists"'
);
PREPARE stmt_idx2 FROM @create_idx2;
EXECUTE stmt_idx2;
DEALLOCATE PREPARE stmt_idx2;

-- Índice idx_tasks_project_id
SET @exist_idx3 = (
    SELECT COUNT(*) FROM information_schema.statistics 
    WHERE table_name = 'tasks' AND index_name = 'idx_tasks_project_id'
);
SET @create_idx3 = IF(@exist_idx3 = 0, 
    'CREATE INDEX idx_tasks_project_id ON tasks(project_id)', 
    'SELECT "Index idx_tasks_project_id already exists"'
);
PREPARE stmt_idx3 FROM @create_idx3;
EXECUTE stmt_idx3;
DEALLOCATE PREPARE stmt_idx3;

-- Índice idx_tasks_dates
SET @exist_idx4 = (
    SELECT COUNT(*) FROM information_schema.statistics 
    WHERE table_name = 'tasks' AND index_name = 'idx_tasks_dates'
);
SET @create_idx4 = IF(@exist_idx4 = 0, 
    'CREATE INDEX idx_tasks_dates ON tasks(start_date, end_date)', 
    'SELECT "Index idx_tasks_dates already exists"'
);
PREPARE stmt_idx4 FROM @create_idx4;
EXECUTE stmt_idx4;
DEALLOCATE PREPARE stmt_idx4;

-- Índice idx_tasks_priority
SET @exist_idx5 = (
    SELECT COUNT(*) FROM information_schema.statistics 
    WHERE table_name = 'tasks' AND index_name = 'idx_tasks_priority'
);
SET @create_idx5 = IF(@exist_idx5 = 0, 
    'CREATE INDEX idx_tasks_priority ON tasks(priority)', 
    'SELECT "Index idx_tasks_priority already exists"'
);
PREPARE stmt_idx5 FROM @create_idx5;
EXECUTE stmt_idx5;
DEALLOCATE PREPARE stmt_idx5;

-- Índice idx_tasks_status
SET @exist_idx6 = (
    SELECT COUNT(*) FROM information_schema.statistics 
    WHERE table_name = 'tasks' AND index_name = 'idx_tasks_status'
);
SET @create_idx6 = IF(@exist_idx6 = 0, 
    'CREATE INDEX idx_tasks_status ON tasks(status)', 
    'SELECT "Index idx_tasks_status already exists"'
);
PREPARE stmt_idx6 FROM @create_idx6;
EXECUTE stmt_idx6;
DEALLOCATE PREPARE stmt_idx6;
