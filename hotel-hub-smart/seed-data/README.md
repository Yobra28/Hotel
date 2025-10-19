# Staff Seed Data

This directory contains seed data for creating initial admin and receptionist users in your hotel management system.

## Files

- `staff-users.json` - JSON data containing admin and receptionist user information
- `seedStaff.js` - Node.js script to populate the database with seed data
- `README.md` - This file

## Usage

### Method 1: Using the Node.js Script

1. Make sure you have the required dependencies installed:
   ```bash
   npm install mongoose bcryptjs
   ```

2. Set your MongoDB connection string (optional):
   ```bash
   export MONGODB_URI="mongodb://localhost:27017/your-database-name"
   ```

3. Run the seeding script:
   ```bash
   node seed-data/seedStaff.js
   ```

### Method 2: Manual Import

You can also manually import the JSON data using your preferred method (API endpoints, database tools, etc.).

## Default Login Credentials

### Admin Accounts
| Email | Password | Role | Position |
|-------|----------|------|----------|
| admin@hotel.com | Admin123! | admin | General Manager |
| sarah.admin@hotel.com | Sarah123! | admin | Hotel Administrator |

### Receptionist Accounts
| Email | Password | Role | Position | Shift |
|-------|----------|------|----------|-------|
| receptionist@hotel.com | Reception123! | receptionist | Front Desk Manager | Morning (6:00-14:00) |
| james.receptionist@hotel.com | James123! | receptionist | Receptionist | Afternoon (14:00-22:00) |
| grace.receptionist@hotel.com | Grace123! | receptionist | Night Receptionist | Night (22:00-06:00) |
| peter.receptionist@hotel.com | Peter123! | receptionist | Weekend Receptionist | Weekend (8:00-20:00) |

## User Permissions

### Admin Permissions
- manage_users
- manage_bookings
- manage_rooms
- manage_payments
- view_reports
- manage_inventory
- manage_staff
- system_settings
- financial_reports (General Manager only)
- audit_logs (General Manager only)

### Receptionist Permissions
- manage_bookings
- check_in_out
- view_guest_info
- process_payments
- manage_rooms (Front Desk Manager only)
- guest_services
- handle_complaints (Front Desk Manager only)
- night_audit (Night Receptionist only)

## Important Notes

⚠️ **Security Warning**: 
- Change all default passwords immediately after seeding
- These are development/testing credentials only
- Never use these passwords in production

🔄 **Database Safety**:
- The script checks for existing users before creating new ones
- It will skip users that already exist in the database
- Passwords are automatically hashed using bcryptjs

## Customization

To customize the seed data:

1. Edit `staff-users.json` with your desired user information
2. Adjust the user schema in `seedStaff.js` to match your database model
3. Modify permissions arrays based on your application's permission system
4. Update connection string and database name as needed

## Troubleshooting

- **Connection Error**: Verify your MongoDB connection string
- **Schema Mismatch**: Adjust the schema in `seedStaff.js` to match your User model
- **Duplicate Email**: The script will skip users with existing emails
- **Permission Denied**: Ensure your MongoDB user has write permissions