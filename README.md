# AI-Textile-Waste-Intelligence-Platform
Infosys Springboard Internship Project - AI Textile Waste Intelligence Platform
**Author:** Durgesh Nandini  
**Project Verification State:** Milestone 1 (`dn28github`)

Core Platform: Authentication & RBAC Status
| Feature / Task Spec | Implementation Mechanism | Status |
| :--- | :--- | :---: |
| **User Registration & Login** | Custom FastAPI routes utilizing Passlib & Pydantic validation schemas. | **✔️ Completed** |
| **Password Hashing Security** | Strict one-way cryptography using the **Bcrypt** algorithm. No plain text storage. | **✔️ Completed** |
| **Stateless JWT Generation** | Backend issues cryptographically signed JSON Web Tokens containing role claims. | **✔️ Completed** |
| **Global Network Interceptor**| Custom Axios Request Interceptor automatically injects `Bearer <token>` to headers. | **✔️ Completed** |
| **Role-Based Access Control** | Frontend layout handles dynamic visual masking based on active parsed localStorage roles. | **✔️ Completed** |
| **Multi-Tenant Data Isolation**| SQL queries dynamically execute `filter(Inventory.user_id == current_user.id)` to block leaks. | **✔️ Completed** |
| **Relational Database Sync** | Dual-end back-populates ORM mappings successfully synced with live PostgreSQL server. | **✔️ Completed** |
| **Clean UI Architecture** | Professional standard interface layout deployed across all custom dashboard panels. | **✔️ Completed** |

Textile Waste Inventory Management Status
| Feature / Task Spec | Implementation Mechanism | Status |
| :--- | :--- | :---: |
| **Waste Registration Form** | Dynamic React inputs capturing Batch ID, Fabric Type, Quantity, and Material Condition. | **✔️ Completed** |
| **Strict Data Validation** | Backend constraints enforced via specialized SQL Enums for Fabric Types and Material States. | **✔️ Completed** |
| **Live Database Auditing** | Data committed via forms is verified live inside the PostgreSQL `inventory` table via pgAdmin 4. | **✔️ Completed** |
| **Lifecycle State Machine** | Automatic workflow state assignment tracking parameters starting from a **'Pending'** state. | **✔️ Completed** |