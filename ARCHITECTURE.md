# System Architecture & Database Schema

## 1. System Architecture (MERN Stack Flow)
- **Frontend (React.js/Vite):** Handles UI rendering, state management, and initiates HTTP requests via Axios.
- **Backend (Node.js + Express):** Exposes REST API endpoints, handles business logic, and implements Middlewares for JWT Authentication and Role-Based Access Control (RBAC).
- **Database:** Stores structured application data securely with relational tracking.

---

## 2. Database Schema & Entity Relationships

### Users Collection / Table
- `id` (Primary Key)
- `name` (String)
- `email` (String, Unique)
- `password` (Hashed String)
- `role` (Enum: 'Admin', 'Manufacturer', 'Recycler', 'Sustainability Manager')

### Inventory Collection / Table
- `id` (Primary Key)
- `userId` (Foreign Key -> Users.id)
- `fabricType` (Enum: 'Cotton', 'Polyester', 'Wool', 'Nylon', 'Blend')
- `quantity` (Number, in Kg)
- `status` (Enum: 'Pending', 'Processed', 'Diverted')

### Analytics Collection / Table
- `id` (Primary Key)
- `inventoryId` (Foreign Key -> Inventory.id)
- `carbonSaved` (Number)
- `diversionRate` (Number)

### Notifications Collection / Table
- `id` (Primary Key)
- `recipientId` (Foreign Key -> Users.id)
- `message` (String)
- `isRead` (Boolean, Default: false)

---

## 3. Data Flow Logic
1. **Authentication:** User logs in -> JWT token generated with `role` -> Token saved in frontend headers.
2. **Inventory Logging:** Manufacturer inputs waste data -> Backend captures `req.user.id` via Auth Middleware -> Saves record in **Inventory** linked to that specific User.
3. **Analytics Trigger:** Whenever an Inventory item status changes -> **Analytics** calculations are updated automatically.