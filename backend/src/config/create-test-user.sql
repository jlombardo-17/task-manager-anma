-- Create a test user with a known password
USE anma;

-- Insert test user (password: test123)
INSERT INTO users (username, email, password, role)
VALUES ('test', 'test@example.com', '$2a$10$9wzYPfOvPp0AHnSeHk.PGek5YPMfOsvcshb4Hmq9DPxJ1VJqbG4YC', 'admin');

-- Verify the user was inserted
SELECT * FROM users WHERE email='test@example.com';
