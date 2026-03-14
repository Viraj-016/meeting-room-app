# Meeting Room App - Setup Guide

## Prerequisites

Before you start, make sure you have the following installed:

1. **[.NET SDK 10.0](https://dotnet.microsoft.com/en-us/download/dotnet/10.0)** - Required for the backend API
2. **[Node.js 18+](https://nodejs.org/)** - Required for Angular frontend (npm comes with it)
3. **Git** - For cloning the repository

Verify installations:
```bash
dotnet --version
node --version
npm --version
```

---

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Viraj-016/meeting-room-app.git
cd meeting-room-app
```

### 2. Setup Backend (.NET)

```bash
cd MeetingRoomApp.API

# Restore all NuGet dependencies
dotnet restore

# Build the project
dotnet build

# Run the API (default: http://localhost:5000)
dotnet run
```

The API will be available at `https://localhost:7262` or `http://localhost:5000`

### 3. Setup Frontend (Angular)

In a **new terminal**, navigate to the client folder:

```bash
cd meeting-room-client

# Install all npm dependencies
npm install

# Start the development server (default: http://localhost:4200)
ng serve
```

Or use:
```bash
npm start
```

The frontend will be available at `http://localhost:4200`

---

## Running Both Parts

You need **two terminal windows**:

**Terminal 1 (Backend)**
```bash
cd MeetingRoomApp.API
dotnet run
```

**Terminal 2 (Frontend)**
```bash
cd meeting-room-client
npm start
```

Once both are running:
- Open `http://localhost:4200` in your browser
- The app will automatically connect to the API at `http://localhost:5000`

---

## Building for Production

### Backend
```bash
cd MeetingRoomApp.API
dotnet publish -c Release
```

### Frontend
```bash
cd meeting-room-client
npm run build
```

---

## Troubleshooting

### Backend won't start
- Check .NET SDK: `dotnet --version` (should be 10.0 or higher)
- Delete `obj` and `bin` folders, then run `dotnet restore && dotnet build`

### Frontend npm issues
- Delete `node_modules` folder and `package-lock.json`
- Run `npm install` again
- Try `npm cache clean --force`

### Port conflicts
- Change frontend port: `ng serve --port 4300`
- Change backend port: Set `ASPNETCORE_URLS=http://localhost:5001` before running

---

## Project Structure

- **MeetingRoomApp.API/** - .NET 10 backend API
  - Controllers/ - REST endpoints
  - Services/ - Business logic
  - Data/ - Database context and models
  - DTOs/ - Data transfer objects

- **meeting-room-client/** - Angular 17 frontend
  - src/app/ - Angular components and services
  - src/assets/ - Images and static files
  - src/environments/ - Environment configuration

---

For more details, see [DEPENDENCIES.txt](DEPENDENCIES.txt)
