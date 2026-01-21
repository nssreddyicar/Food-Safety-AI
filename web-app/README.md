# Web App (Admin & Authority Panel)

## Purpose
Browser-based administration panel for Super Admins, District Officers, and Commissioners to manage officers, jurisdictions, system settings, and view reports.

## What This Folder Contains
- `landing-page.html` - Landing page for the application
- `admin-panel.html` - Administrative dashboard
- `setup-wizard.html` - Initial system setup wizard
- `assets/` - Static assets (CSS, images)

## What This Folder MUST NOT Contain
- Backend business logic
- Direct database access
- Workflow rule enforcement
- Mobile app code

## Deployment
- Deploy to any static web hosting (Nginx, Apache, CDN)
- Configure to proxy API requests to backend server

## Architecture Rules
- All data comes from backend API
- Role-based UI rendering
- No direct database queries
- Authentication via server tokens
