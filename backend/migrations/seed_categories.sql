-- Seed initial gaming categories for the first admin user
-- This will be automatically seeded during setup when the first admin user is created
-- Admin can edit/add/remove categories later through the dashboard

INSERT INTO categories (admin_id, name, description) VALUES
  (
    (SELECT id FROM users WHERE role='admin' ORDER BY id LIMIT 1),
    'Keyboard',
    'Gaming keyboards with mechanical switches and RGB lighting'
  ),
  (
    (SELECT id FROM users WHERE role='admin' ORDER BY id LIMIT 1),
    'Mouse',
    'High-precision gaming mice with adjustable DPI'
  ),
  (
    (SELECT id FROM users WHERE role='admin' ORDER BY id LIMIT 1),
    'Headphones',
    'Gaming headsets with surround sound and noise cancellation'
  ),
  (
    (SELECT id FROM users WHERE role='admin' ORDER BY id LIMIT 1),
    'MousePads',
    'Large gaming mouse pads with precision surfaces'
  ),
  (
    (SELECT id FROM users WHERE role='admin' ORDER BY id LIMIT 1),
    'Monitors',
    'High refresh rate gaming monitors with low response time'
  )
ON CONFLICT (admin_id, name) DO NOTHING;

