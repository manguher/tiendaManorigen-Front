-- Verificar si existe la restricción única en el email
-- (Para PostgreSQL)
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE' 
    AND tc.table_name = 'usuarios'
    AND kcu.column_name = 'email';

-- Si no existe, crear la restricción manualmente:
-- ALTER TABLE usuarios ADD CONSTRAINT usuarios_email_unique UNIQUE (email);

-- Para MySQL:
-- SHOW INDEX FROM usuarios WHERE Column_name = 'email';

-- Para SQLite:
-- PRAGMA index_list('usuarios');
-- PRAGMA index_info('index_name');
