# NaviCampus - Smart Indoor Navigation System
> Premium iPhone-Inspired Indoor Navigation System with Java 21, Tomcat 11, MySQL & Firebase

![NaviCampus](https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80)

NaviCampus is an enterprise-grade full-stack smart indoor positioning and navigation platform built for university campuses, hospitals, shopping malls, libraries, and corporate offices. It delivers high-precision multi-floor route planning using Dijkstra's shortest path algorithm, wheelchair-accessible routing, dynamic obstacle/closure avoidance, interactive SVG architectural floor maps, and real-time cloud synchronization powered by Google Firebase.

---

## 1. System Architecture

```
┌────────────────────────────────────────────────────────┐
│               Frontend (Client Devices)                │
│  - iOS / Android Mobile Web (Apple Human Interface)    │
│  - Interactive SVG Indoor Floor Plans (Pan / Zoom)     │
│  - Firebase JS SDK (Auth, Firestore Favorites Sync)    │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / JSON & Bearer Token
┌──────────────────────────▼─────────────────────────────┐
│          Java 21 / Tomcat 11 Web Application           │
│  - Jakarta Servlet 6.0 REST Endpoints                  │
│  - Firebase Admin SDK Token Verifier (Bearer Filter)   │
│  - Dijkstra Graph Navigation Engine (Adjacency List)   │
│  - Multi-floor Vertical Transition Engine (Elev/Stairs)│
│  - Dynamic Obstacle & Corridor Rerouting               │
└──────────────────────────┬─────────────────────────────┘
                           │ JDBC / HikariCP Pool
┌──────────────────────────▼─────────────────────────────┐
│             MySQL 8.0 Navigation Database              │
│  - Buildings, Floors, Rooms, POIs                      │
│  - Navigation Nodes (x, y coordinates)                 │
│  - Navigation Edges (distance, accessibility, status)  │
│  - Administrator Roles & Campus Announcements          │
└────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

- **Frontend:** HTML5, CSS3, Modern ES6+ / TypeScript, Bootstrap 5 / Tailwind CSS, Motion animations, Responsive iOS mobile UI.
- **Backend:** Java 21 LTS, Jakarta EE 10 / Servlet 6.0, Apache Tomcat 11, Maven 3.9+.
- **Database:** MySQL 8.0+ for authoritative architectural building and navigation graph topology.
- **Cloud & Auth:** Firebase Authentication (Google Sign-In, Email/Password), Cloud Firestore (User profiles, favorite locations, recent routes, cross-device sync), Firebase Admin SDK for Java.
- **Routing Engine:** Priority-Queue Dijkstra algorithm with multi-floor elevator/stair transitions and wheelchair accessibility constraints.

---

## 3. Directory Structure

```
smart-indoor-navigation/
├── pom.xml                               # Maven project descriptor
├── database/
│   └── schema.sql                        # MySQL DDL & sample 3-floor building data
├── firebase/
│   └── firestore.rules                   # Production Cloud Firestore Security Rules
├── firebase-blueprint.json               # Firebase Intermediate Representation
├── src/
│   ├── main/
│   │   ├── java/com/indoor/
│   │   │   ├── controller/               # Jakarta Servlets (Routes, Buildings, Search)
│   │   │   ├── dao/                      # Database Access Objects & HikariCP
│   │   │   ├── model/                    # Building, Floor, Node, Edge, Route models
│   │   │   ├── security/                 # FirebaseTokenVerifier & AuthFilter
│   │   │   ├── service/                  # DijkstraService navigation engine
│   │   │   └── util/                     # JsonUtil (Gson)
│   │   └── webapp/
│   │       └── WEB-INF/
│   │           └── web.xml               # Jakarta Servlet mappings & filters
│   └── test/
│       └── java/com/indoor/
│           └── DijkstraServiceTest.java  # JUnit 5 Dijkstra unit tests
└── README.md
```

---

## 4. Local Setup Guide (macOS, IntelliJ IDEA, MySQL, Tomcat 11)

### Prerequisites
- Java 21 JDK (Amazon Corretto 21 or Eclipse Temurin 21)
- Apache Tomcat 11.0+
- MySQL 8.0+
- Maven 3.9+
- IntelliJ IDEA Ultimate or Community Edition

### Step 1: Database Setup
1. Start MySQL server:
   ```bash
   brew services start mysql
   ```
2. Execute the schema and seed data:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

### Step 2: Firebase Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Authentication** (Google provider and Email/Password).
3. Create a **Cloud Firestore** database in test/production mode.
4. Deploy the security rules from `firebase/firestore.rules`.
5. Under Project Settings -> Service Accounts, generate a private key and save as `serviceAccountKey.json`.
6. Export the environment variable:
   ```bash
   export FIREBASE_SERVICE_ACCOUNT_KEY="/path/to/serviceAccountKey.json"
   ```

### Step 3: Maven Build & Run
1. Clean and package the WAR:
   ```bash
   mvn clean package
   ```
2. Deploy the generated `target/indoor-nav.war` to Tomcat's `webapps/` folder, or run directly within IntelliJ IDEA Run Configurations using the Tomcat Server plugin.

---

## 5. REST API Specifications

### Compute Shortest Route
- **Endpoint:** `POST /api/routes`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "buildingId": "b-tech",
    "startNodeId": "node-f1-entrance",
    "targetNodeId": "node-f2-robotics",
    "wheelchairAccessible": true
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "totalDistance": 64.0,
    "estimatedMinutes": 2.4,
    "hasFloorTransfer": true,
    "isWheelchairAccessible": true,
    "floorsInvolved": [1, 2],
    "steps": [
      {
        "stepNumber": 1,
        "instruction": "Start at Main Entrance (Floor 1)",
        "distance": 15.0,
        "floorNumber": 1,
        "icon": "straight"
      },
      {
        "stepNumber": 2,
        "instruction": "Take Elevator Bank A from Floor 1 to Floor 2",
        "distance": 14.0,
        "floorNumber": 1,
        "transitionType": "elevator",
        "targetFloor": 2,
        "icon": "elevator"
      },
      {
        "stepNumber": 3,
        "instruction": "Arrive at destination: AI & Robotics Lab Door (Floor 2)",
        "distance": 0.0,
        "floorNumber": 2,
        "icon": "arrive"
      }
    ]
  }
  ```

---

## 6. Security & Firebase ID Token Verification
All protected endpoints (`/api/users/*`, `/api/admin/*`) require a valid Firebase ID token in the header:
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```
The Java `AuthFilter` intercepts the request and verifies the token against Google's public cryptographic keys via `FirebaseTokenVerifier`.
