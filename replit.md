# Food Safety Inspector - Government-Grade Regulatory System

## Overview
This project is a government-grade regulatory system designed for Food Safety Officers (FSOs) to manage inspection, sample collection, and prosecution workflows. It ensures compliance with FSSAI regulations and generates court-admissible records with strict immutability rules. The system aims to streamline regulatory processes, enhance legal compliance, and provide robust tools for food safety management.

## User Preferences
- Prefer detailed explanations
- Iterative development approach
- Ask before major changes
- Do not modify `server/templates` folder

## System Architecture

### Architectural Principles
The system adheres to core principles for a government-grade system: explicit updates, clear layer boundaries, domain-driven design with business rules enforced in the domain layer, immutability for closed records and legal compliance, and a comprehensive audit trail for all changes.

### Project Structure
The project is structured into distinct layers:
- **Presentation Layer**: `android-app/` (Flutter for production), `client/` (Expo for development/testing), and `web-app/` (React Admin for future web interface).
- **Backend Layer**: `server/` containing `domain/` for business logic, `data/` for data access (repository pattern), and `services/` for infrastructure.
- **Shared Layer**: `shared/` for common types and contracts.
- **Infrastructure**: `infra/` for Docker and deployment.

### UI/UX and Features
The mobile applications (Flutter and Expo) provide a comprehensive suite of features including:
- Officer authentication and profile management.
- Dashboard for key metrics and urgent actions.
- Management of FBO and Institutional inspections with detailed forms (e.g., 35-indicator FSSAI assessment).
- Sample tracking with chain-of-custody.
- Complaint management with public submission capabilities and evidence collection.
- Court case management with hearing tracking.
- Action dashboard for follow-ups.
- QR/Barcode scanning, GPS tracking, and PDF report generation.
- Anti-fraud watermarking for evidence images, embedding GPS and timestamps.
- Dynamic form configuration for inspections and complaints via admin panels.

### Backend Architecture
The backend uses Express.js with a strict layered architecture:
- **API Layer**: Handles HTTP endpoints.
- **Domain Layer**: Encapsulates business logic and rules, including legal compliance such as immutability for closed inspections and dispatched samples, jurisdiction-bound data, and audit trails.
- **Data Access Layer**: Manages database operations.
- **Services Layer**: Provides infrastructure services like PDF generation and file storage.
- **Configuration Layer**: Manages application settings.

## External Dependencies
- **Database**: PostgreSQL (managed via Drizzle ORM).
- **PDF Generation**: pdfkit.
- **File Storage**: Local filesystem with custom API endpoints.
- **Authentication**: Session-based for admin, token-based for mobile.
- **Potential Integration**: Twilio (for Mobile OTP Authentication).