# Mini AI App Portal

A comprehensive full-stack web application that transforms natural language app descriptions into structured requirements and interactive mock UIs using AI. The platform enables users to describe their app ideas in plain English and receive instant RAOS (Role-Action-Object-Supplementary) analysis along with responsive HTML mockups.

## 🚀 Features

### Core Functionality
- **Natural Language Processing**: Describe your app idea in plain English
- **AI-Powered RAOS Analysis**: Extracts structured requirements using RAOS format
- **Automatic Mock UI Generation**: Creates responsive HTML mockups based on requirements
- **User Authentication**: Secure user registration and login system
- **Project Management**: Create, edit, and manage multiple app prototypes
- **Real-time Generation**: Instant results using OpenRouter AI API

### Advanced Features
- **Character Limit Monitoring**: Input validation with 1000-character limit
- **Project Status Tracking**: "In Process" and "Completed" status indicators
- **Editable Requirements**: Modify RAOS data before UI generation
- **Pagination**: Efficient browsing of project history
- **Search & Filter**: Find projects by name, creator, or status
- **Responsive Design**: Modern UI with gradient backgrounds and glassmorphism effects
- **Permission System**: Only creators can edit and generate UI for their projects

## 🏗️ Project Structure

```
mini-ai-app-portal/
├── backend/
│   ├── models/
│   │   ├── Requirement.js          # MongoDB schema for app requirements
│   │   └── User.js                 # User authentication schema
│   ├── routes/
│   │   ├── requirements.js         # API routes for requirement processing
│   │   └── users.js                # User authentication routes
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication middleware
│   ├── utils/
│   │   └── aiService.js            # AI service integration with OpenRouter
│   ├── .env                        # Environment variables
│   ├── server.js                   # Express server setup
│   └── package.json               # Backend dependencies
└── frontend/
    ├── public/
    │   └── index.html             # HTML template
    ├── src/
    │   ├── components/
    │   │   ├── HomePage.jsx           # Main input interface with character limit monitoring
    │   │   ├── RequirementCapture.jsx # Simple input form component
    │   │   ├── RAOSPage.jsx           # RAOS analysis display and editing
    │   │   ├── MockUIPage.jsx         # Generated UI display
    │   │   ├── HistoryPage.jsx        # Project history with pagination
    │   │   ├── DashboardPage.jsx      # Project dashboard with search/filter
    │   │   ├── UserAuth.jsx           # Authentication components
    │   │   ├── UserEdit.jsx           # User profile management
    │   │   ├── MockAppUI.jsx          # UI display component
    │   │   └── DebugPanel.jsx         # Debug panel for AI API responses
    │   ├── App.js                 # Main React component with routing
    │   └── index.js              # React entry point
    └── package.json              # Frontend dependencies
```

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (required, unique, 3-20 chars),
  password: String (required, min 6 chars, hashed),
  realName: String (required, trimmed),
  dateOfBirth: Date (required),
  description: String (max 500 chars, default: ''),
  avatar: String (required, default: '👤'),
  createdAt: Date (default: Date.now)
}
```

### Requirements Collection
```javascript
{
  _id: ObjectId,
  userDescription: String (required),
  appDescription: String,
  appName: String,
  entities: [String],
  roles: [String],
  features: [String],
  raos: [{
    role: String,
    action: String,
    object: String,
    supplementary: String
  }],
  mockHtml: String,
  createdBy: ObjectId (ref: 'User', required),
  createdAt: Date (default: Date.now)
}
```

### Relationships
- **Requirements → Users**: Many-to-One relationship
  - Each requirement belongs to one user (creator)
  - Users can have multiple requirements
  - Foreign key: `createdBy` field references `User._id`

### Indexes
- **Users Collection**:
  - `username` (unique index)
- **Requirements Collection**:
  - `createdBy` (for efficient user-based queries)
  - `createdAt` (for sorting by creation date)

## 🛠️ Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP client for API calls
- **OpenRouter API** - AI service for natural language processing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API communication
- **DOMPurify** - HTML sanitization
- **CSS3** - Modern styling with gradients and animations

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- OpenRouter API key

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```env
MONGODB_URI=your_mongodb_connection_string
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=5000
JWT_SECRET=your_jwt_secret_key
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

The frontend will be running on `http://localhost:3000`

## 📖 Usage

### Getting Started

1. **Register/Login**: Create an account or login to access the platform
2. **Describe Your App**: Enter your app idea in the text area (max 1000 characters)
3. **AI Analysis**: The system extracts RAOS requirements automatically
4. **Review & Edit**: Review the extracted requirements and edit if needed
5. **Generate UI**: Create a responsive HTML mockup based on your requirements
6. **Manage Projects**: View, search, and manage all your prototypes

### Example App Descriptions

- *"I want an app to manage student courses and grades. Teachers add courses, students enroll, and admins manage reports."*
- *"I need an app where users can log workouts and meals. Trainers assign workout plans, and nutritionists create meal plans. Admins handle subscriptions."*
- *"I want a marketplace where sellers add products, buyers purchase items, and admins manage disputes."*

## 🔌 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user info
- `PUT /api/users/me` - Update user profile
- `DELETE /api/users/me` - Delete user account
- `GET /api/users/check-username/:username` - Check username availability
- `GET /api/users/avatars` - Get available avatar options

### Requirements
- `POST /api/requirements` - Create new requirement (RAOS extraction)
- `GET /api/requirements` - Get all requirements (public)
- `GET /api/requirements/my` - Get user's requirements
- `GET /api/requirements/:id` - Get specific requirement
- `PUT /api/requirements/:id` - Update requirement (creator only)
- `DELETE /api/requirements/:id` - Delete requirement
- `POST /api/requirements/:id/generate-ui` - Generate mock HTML

### System
- `GET /health` - Health check endpoint

## 🤖 AI Integration

The application uses OpenRouter API with the Grok-4-Fast model to:

1. **Extract RAOS Requirements**: Converts natural language descriptions into structured Role-Action-Object-Supplementary format
2. **Generate Mock UIs**: Creates responsive HTML mockups based on extracted requirements
3. **Retry Mechanism**: Implements exponential backoff for API reliability
4. **Rate Limiting**: Manages concurrent requests to prevent API overload

### RAOS Format
- **Role**: Specific role name (e.g., "Admin", "Teacher")
- **Action**: Specific, indivisible verb (e.g., "create", "delete")
- **Object**: Entity or data item (e.g., "Course", "User")
- **Supplementary**: Business rules and constraints

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Server-side validation for all inputs
- **HTML Sanitization**: DOMPurify for safe HTML rendering
- **Permission System**: Users can only edit their own projects
- **Rate Limiting**: Prevents API abuse

## 🎨 User Interface

### Design Features
- **Modern Gradient Backgrounds**: Beautiful visual appeal
- **Glassmorphism Effects**: Contemporary UI design
- **Responsive Layout**: Works on all device sizes
- **Interactive Elements**: Hover effects and smooth transitions
- **Status Indicators**: Clear visual feedback for project status
- **Character Counter**: Real-time input length monitoring

### Pages
- **Home Page**: Main input interface with example prompts
- **RAOS Page**: Requirements analysis and editing interface
- **Mock UI Page**: Generated HTML mockup display
- **History Page**: Project management with pagination
- **Dashboard Page**: Advanced project search and filtering
- **Profile Page**: User account management

## 🚦 Project Status

Projects have two main statuses:
- **In Process**: RAOS extracted, UI not yet generated
- **Completed**: Both RAOS and UI generated successfully

## 🔧 Configuration

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `OPENROUTER_API_KEY`: OpenRouter API key
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5000)

### API Configuration
- **Model**: x-ai/grok-4-fast:free
- **Temperature**: 0.3 (for consistent results)
- **Max Tokens**: 800 for RAOS, 20000 for HTML
- **Timeout**: 60 seconds
- **Retries**: 3 attempts with exponential backoff

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ using React, Node.js, and AI**