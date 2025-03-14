# Resource Management System (Frontend)

A comprehensive cloud resource management application built with React and Material UI. This system allows users to book, track, and manage various resources across an organization.

> **Important**: This repository is a sub-module of the main repository [cloud-resource-reservation](https://github.com/giovannimirarchi420/cloud-resource-reservation), which contains the complete project including backend services, database and Keycloak initialization scripts, and Docker configuration.

![Dashboard Preview](./img/dashboard.png)
![Calendar Preview](./img/calendar.png)

## Features

- **Resource Booking**: Schedule and manage resource reservations with an intuitive calendar interface
- **Resource Management**: Add, edit, and maintain resources and resource types
- **User Management**: Manage users with different permission levels (admins and regular users)
- **Dashboard**: Visualize resource usage with interactive charts and statistics
- **Multi-language Support**: Full internationalization support for English and Italian
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **Frontend**: React 19.0.0, Material UI 6.4.7
- **State Management**: React Context API
- **Authentication**: Keycloak integration
- **Visualization**: Recharts for data visualization
- **Calendar**: React Big Calendar for booking interface
- **Internationalization**: i18next for multi-language support

## Getting Started

### Prerequisites

- Node.js (v16.x or higher)
- npm or yarn

> **Recommended**: For a complete environment including backend, database, and authentication services, we recommend cloning the main repository [cloud-resource-reservation](https://github.com/giovannimirarchi420/cloud-resource-reservation) which includes this frontend as a sub-module along with Docker Compose configuration for easy setup.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/giovannimirarchi420/reservation-fe.git
   cd reservation-fe
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:8080/api
   REACT_APP_KEYCLOAK_URL=http://localhost:8180
   REACT_APP_KEYCLOAK_REALM=resource-management
   REACT_APP_KEYCLOAK_CLIENT_ID=resource-management-app
   ```

4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

## Project Structure

The project follows a component-based architecture:

```
/
├── public/                       # Static assets
│   ├── index.html                # Main HTML file
│   ├── manifest.json             # Web app manifest
│   ├── robots.txt                # Robots configuration
│   └── silent-check-sso.html     # Keycloak SSO support
│
├── src/                          # Source code
│   ├── components/               # UI components
│   │   ├── Admin/                # Admin panel components
│   │   ├── Auth/                 # Authentication components
│   │   ├── Booking/              # Booking-related components
│   │   ├── Common/               # Shared/common components
│   │   ├── Dashboard/            # Dashboard components
│   │   ├── LanguageSelector/     # Internationalization UI
│   │   ├── Layout/               # Layout components
│   │   ├── Notifications/        # Notification components
│   │   ├── Profile/              # User profile management
│   │   ├── Resources/            # Resource-related components
│   │   └── Users/                # User management components
│   ├── config/                   # Configuration files
│   │   └── keycloak.js           # Keycloak configuration
│   ├── context/                  # React context providers
│   ├── hooks/                    # Custom React hooks
│   ├── i18n/                     # Internationalization
│   │   └── locales/              # Language files
│   ├── services/                 # API services
│   ├── styles/                   # CSS and styling
│   ├── utils/                    # Utility functions
│   ├── App.jsx                   # Main App component
│   ├── App.test.js               # App tests
│   ├── index.jsx                 # Application entry point
│   ├── logo.svg                  # App logo
│   └── theme.js                  # Material UI theme configuration
```

## Main Features

### Resource Booking Calendar

The booking calendar allows users to:
- View resources and existing bookings
- Create new bookings
- Edit or delete existing bookings
- Filter resources by type or status

### Admin Panel

Administrators have access to:
- Resource management (add, edit, delete)
- Resource type configuration
- User management
- System settings

### Dashboard

The dashboard provides visual analytics on:
- Resource utilization rates
- Booking trends over time
- Resource status overview
- Upcoming reservations

## Deployment

### Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `build/` directory.

### Deployment Options

The application can be deployed to:
- Static hosting services (Netlify, Vercel, etc.)
- AWS S3 + CloudFront
- Traditional web servers (Apache, Nginx)

### Full Stack Deployment

For a complete deployment with all services:

1. Clone the main repository which contains this frontend as a sub-module:
   ```bash
   git clone https://github.com/giovannimirarchi420/cloud-resource-reservation.git
   cd cloud-resource-reservation
   ```

2. Initialize and update submodules:
   ```bash
   git submodule init
   git submodule update
   ```

3. Use Docker Compose to start all services:
   ```bash
   docker-compose up -d
   ```

This will set up the complete environment including:
- Frontend (this repository)
- Backend API services
- Database
- Keycloak authentication server

## Authentication and Authorization

The application uses Keycloak for authentication and role-based access control:
- **Administrators**: Full access to all features
- **Users**: Can view resources and manage their own bookings

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Material UI for the component library
- React team for the amazing framework
- All contributors who have helped shape this project