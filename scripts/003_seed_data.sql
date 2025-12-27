-- Insert default equipment categories
insert into public.equipment_categories (name, description) values
  ('Machinery', 'Production machinery and industrial equipment'),
  ('Vehicles', 'Company vehicles and transportation'),
  ('IT Equipment', 'Computers, servers, and IT infrastructure'),
  ('HVAC', 'Heating, ventilation, and air conditioning systems'),
  ('Electrical', 'Electrical systems and equipment'),
  ('Plumbing', 'Plumbing systems and fixtures')
on conflict (name) do nothing;

-- Insert default maintenance teams
insert into public.teams (name, description) values
  ('Mechanics', 'Mechanical maintenance and repairs'),
  ('Electricians', 'Electrical systems and installations'),
  ('IT Support', 'IT equipment and software support'),
  ('HVAC Technicians', 'Climate control systems'),
  ('General Maintenance', 'General facility maintenance')
on conflict (name) do nothing;
