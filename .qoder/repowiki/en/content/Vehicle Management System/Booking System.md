# Booking System

<cite>
**Referenced Files in This Document**
- [vehicleBookingModel.js](file://backend/model/vehicleBookingModel.js)
- [vehicleDetailModel.js](file://backend/model/vehicleDetailModel.js)
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js)
- [bookingRoutes.js](file://backend/router/bookingRoutes.js)
- [vehicleBookingSlice.js](file://frontend/src/appRedux/redux/bookingSlice/vehicleBookingSlice.js)
- [VehicleBookingDetails.jsx](file://frontend/src/pages/VehicleBookingPage/VehicleBookingDetails.jsx)
- [server.js](file://backend/server.js)
- [notificationThroughMessageBroker.js](file://backend/utils/notificationThroughMessageBroker.js)
- [runTransaction.js](file://backend/model/runTransaction.js)
- [auditLogSchema.js](file://backend/model/auditLogSchema.js)
- [createAuditLog.js](file://backend/utils/createAuditLog.js)
- [errorHandlingMiddleware.js](file://backend/utils/errorHandlingMiddleware.js)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document describes the vehicle booking system end-to-end. It covers the booking workflow from vehicle selection through reservation confirmation, availability checking algorithms, conflict resolution for overlapping reservations, creation and modification of bookings, cancellation with refund/partial calculations, notification workflows, booking model schema, list management, analytics, Redux state management, real-time updates via Socket.IO, and RabbitMQ integration for asynchronous notifications.

## Project Structure
The system comprises:
- Backend: Express server, Mongoose models, controllers, routers, utilities, and middleware
- Frontend: React application with Redux Toolkit slices for booking operations
- Messaging: RabbitMQ producer for notifications
- Real-time: Socket.IO server integrated into the backend

```mermaid
graph TB
subgraph "Frontend"
FE_UI["React UI<br/>VehicleBookingDetails.jsx"]
FE_RS["Redux Toolkit<br/>vehicleBookingSlice.js"]
end
subgraph "Backend"
BE_SRV["Express Server<br/>server.js"]
BE_RT["Routing<br/>bookingRoutes.js"]
BE_CTL["Controller<br/>vehicleBookingController.js"]
BE_MDL_BK["Model<br/>vehicleBookingModel.js"]
BE_MDL_VEH["Model<br/>vehicleDetailModel.js"]
BE_UTIL_TX["Transaction Utility<br/>runTransaction.js"]
BE_UTIL_AUD["Audit Log Utility<br/>createAuditLog.js"]
BE_UTIL_ERR["Error Handler<br/>errorHandlingMiddleware.js"]
BE_UTIL_NTF["RabbitMQ Producer<br/>notificationThroughMessageBroker.js"]
end
subgraph "Messaging"
RMQ["RabbitMQ Exchange<br/>notifications_topic"]
end
FE_UI --> FE_RS
FE_RS --> BE_RT
BE_RT --> BE_CTL
BE_CTL --> BE_MDL_BK
BE_CTL --> BE_MDL_VEH
BE_CTL --> BE_UTIL_TX
BE_CTL --> BE_UTIL_NTF
BE_UTIL_NTF --> RMQ
BE_SRV --> RMQ
```

**Diagram sources**
- [server.js](file://backend/server.js#L34-L76)
- [bookingRoutes.js](file://backend/router/bookingRoutes.js#L1-L31)
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L1-L861)
- [vehicleBookingModel.js](file://backend/model/vehicleBookingModel.js#L1-L105)
- [vehicleDetailModel.js](file://backend/model/vehicleDetailModel.js#L1-L145)
- [runTransaction.js](file://backend/model/runTransaction.js#L1-L43)
- [notificationThroughMessageBroker.js](file://backend/utils/notificationThroughMessageBroker.js#L1-L69)
- [errorHandlingMiddleware.js](file://backend/utils/errorHandlingMiddleware.js#L1-L233)

**Section sources**
- [server.js](file://backend/server.js#L34-L76)
- [bookingRoutes.js](file://backend/router/bookingRoutes.js#L1-L31)

## Core Components
- Booking Model: Embeds per-vehicle booking details with unique booking identifiers, pricing, and timestamps.
- Vehicle Model: Stores vehicle groups with embedded specific vehicles and their booked periods.
- Controller: Implements booking creation, cancellation, rescheduling, and completion with MongoDB transactions.
- Frontend Redux: Async thunks for booking actions and state management.
- Notifications: RabbitMQ producer for sending notifications.
- Transactions: Utility to wrap multiple DB operations atomically.

**Section sources**
- [vehicleBookingModel.js](file://backend/model/vehicleBookingModel.js#L9-L104)
- [vehicleDetailModel.js](file://backend/model/vehicleDetailModel.js#L6-L105)
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L235-L466)
- [vehicleBookingSlice.js](file://frontend/src/appRedux/redux/bookingSlice/vehicleBookingSlice.js#L1-L203)
- [notificationThroughMessageBroker.js](file://backend/utils/notificationThroughMessageBroker.js#L1-L69)
- [runTransaction.js](file://backend/model/runTransaction.js#L1-L43)

## Architecture Overview
The booking lifecycle spans frontend UI, Redux actions, backend routes/controllers, models, transactions, and messaging.

```mermaid
sequenceDiagram
participant U as "User"
participant FE as "Frontend UI"
participant RS as "Redux Slice"
participant RT as "Express Router"
participant CTL as "Controller"
participant TX as "runTransaction"
participant BK as "vehicleBookingModel"
participant VH as "vehicleDetailModel"
participant MQ as "RabbitMQ"
U->>FE : "Select dates and confirm"
FE->>RS : "dispatch createBooking()"
RS->>RT : "POST /addbooking"
RT->>CTL : "createBookingDetails()"
CTL->>TX : "start transaction"
TX->>VH : "find vehicle group and check availability"
TX->>BK : "create booking doc"
TX->>VH : "push bookedPeriods"
TX->>CTL : "commit"
CTL->>MQ : "sendNotification()"
MQ-->>U : "notification delivered"
CTL-->>RS : "response"
RS-->>FE : "state updated"
```

**Diagram sources**
- [VehicleBookingDetails.jsx](file://frontend/src/pages/VehicleBookingPage/VehicleBookingDetails.jsx#L115-L144)
- [vehicleBookingSlice.js](file://frontend/src/appRedux/redux/bookingSlice/vehicleBookingSlice.js#L24-L37)
- [bookingRoutes.js](file://backend/router/bookingRoutes.js#L7-L7)
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L235-L466)
- [runTransaction.js](file://backend/model/runTransaction.js#L4-L18)
- [vehicleDetailModel.js](file://backend/model/vehicleDetailModel.js#L38-L43)
- [vehicleBookingModel.js](file://backend/model/vehicleBookingModel.js#L16-L59)
- [notificationThroughMessageBroker.js](file://backend/utils/notificationThroughMessageBroker.js#L33-L64)

## Detailed Component Analysis

### Booking Model Schema
The booking document embeds an array of vehicle-specific booking entries. Each entry includes:
- Customer and vehicle metadata
- Pricing fields: base price, extra expenditure, tax, total price
- Unique identifiers: uniqueBookingId, uniqueVehicleId
- Status and timestamps
- Availability blocking via vehicle model’s bookedPeriods

```mermaid
erDiagram
BOOKING {
string userEmail
mixed userDetails
date createdAt
date updatedAt
}
VEHICLE_BOOKING_DETAIL {
string name
string model
string description
string vehicleType
number uniqueVehicleId
boolean vehicleStatus
string location
string vehicleNumber
number vehicleMilage
array filePath
string bookingStatus
date pickupDate
date dropOffDate
number price
number extraExpenditure
number tax
number totalPrice
number damage
number uniqueBookingId
date createdAt
}
BOOKING ||--o{ VEHICLE_BOOKING_DETAIL : "contains"
```

**Diagram sources**
- [vehicleBookingModel.js](file://backend/model/vehicleBookingModel.js#L9-L66)

**Section sources**
- [vehicleBookingModel.js](file://backend/model/vehicleBookingModel.js#L9-L104)

### Vehicle Model Schema and Availability
Each vehicle group stores embedded specific vehicles with:
- Unique identifiers and status
- Location, registration number, mileage
- Booked periods array used for overlap checks

Availability is enforced by ensuring no overlap exists between requested dates and existing bookedPeriods.

```mermaid
erDiagram
VEHICLE_GROUP {
string name
string description
string vehicleType
string model
array bookingPrice
number uniqueGroupId
array filePath
mixed createdBy
date createdAt
date updatedAt
}
SPECIFIC_VEHICLE {
string location
boolean vehicleStatus
string vehicleNumber
number vehicleMilage
string notAvailableReason
number uniqueVehicleId
array bookedPeriods
date createdAt
date updatedAt
}
VEHICLE_GROUP ||--o{ SPECIFIC_VEHICLE : "has many"
```

**Diagram sources**
- [vehicleDetailModel.js](file://backend/model/vehicleDetailModel.js#L55-L105)

**Section sources**
- [vehicleDetailModel.js](file://backend/model/vehicleDetailModel.js#L6-L145)

### Booking Creation Workflow
- Validation: Required fields, date ordering, user authorization
- Transaction: Atomicity across booking creation, vehicle period blocking, and user stats update
- Availability: Confirms no overlapping periods for the selected vehicle
- Persistence: Saves booking document and updates vehicle’s bookedPeriods
- Notifications: Sends internal notification and emails via RabbitMQ exchange

```mermaid
flowchart TD
Start(["Create Booking"]) --> Validate["Validate Inputs<br/>Dates, Fields, User"]
Validate --> Txn["Start MongoDB Transaction"]
Txn --> FindGroup["Find Vehicle Group"]
FindGroup --> CheckAvail{"Any Available Vehicle?"}
CheckAvail --> |No| ErrAvail["Throw 'No vehicle available'"]
CheckAvail --> |Yes| Build["Build Booking Detail"]
Build --> Upsert["Upsert Booking Doc"]
Upsert --> Block["Push bookedPeriods to Vehicle"]
Block --> Stats["Update User Stats"]
Stats --> Commit["Commit Transaction"]
Commit --> Notify["Send Notification + Email"]
Notify --> Done(["Success"])
ErrAvail --> Rollback["Abort Transaction"]
Rollback --> Done
```

**Diagram sources**
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L235-L466)
- [runTransaction.js](file://backend/model/runTransaction.js#L4-L18)
- [vehicleDetailModel.js](file://backend/model/vehicleDetailModel.js#L38-L43)
- [notificationThroughMessageBroker.js](file://backend/utils/notificationThroughMessageBroker.js#L33-L64)

**Section sources**
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L235-L466)
- [runTransaction.js](file://backend/model/runTransaction.js#L1-L43)

### Availability Checking and Conflict Resolution
- Overlap detection uses interval overlap logic against bookedPeriods
- Conflict resolution: if overlap exists, return “No available vehicle” error
- On successful booking, push the new period; on cancellation/reschedule, pull/remove old period and push new period

```mermaid
flowchart TD
Req(["Reschedule Request"]) --> Find["Find Booking Detail"]
Find --> Query["Query Vehicle by uniqueVehicleId"]
Query --> Avail{"No overlap with bookedPeriods?"}
Avail --> |No| Conflict["Conflict: Not Available"]
Avail --> |Yes| Block["Push New Period"]
Block --> Pull["Pull Old Period"]
Pull --> Save["Save Updated Booking"]
Save --> Done(["Updated"])
Conflict --> Done
```

**Diagram sources**
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L664-L758)
- [vehicleDetailModel.js](file://backend/model/vehicleDetailModel.js#L38-L43)

**Section sources**
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L664-L758)

### Booking Modification Workflows
- Rescheduling: Validates new slot availability, blocks new slot, removes old slot, updates booking dates
- Completion: Admin-only endpoint to mark booking as completed within transaction boundaries

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant RS as "Redux Slice"
participant RT as "Router"
participant CTL as "Controller"
participant TX as "runTransaction"
participant VH as "vehicleDetailModel"
participant BK as "vehicleBookingModel"
FE->>RS : "dispatch rescheduleBooking()"
RS->>RT : "PATCH /rescheduleBooking"
RT->>CTL : "rescheduleBooking()"
CTL->>TX : "start transaction"
TX->>BK : "find booking by uniqueBookingId"
TX->>VH : "check availability for new slot"
TX->>VH : "push new bookedPeriods"
TX->>VH : "pull old bookedPeriods"
TX->>BK : "update pickupDate/dropOffDate"
TX->>CTL : "commit"
CTL-->>RS : "success"
RS-->>FE : "state updated"
```

**Diagram sources**
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L664-L758)
- [runTransaction.js](file://backend/model/runTransaction.js#L4-L18)

**Section sources**
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L664-L758)

### Booking Cancellation Procedures
- Authorization: Admin can cancel any booking; user can cancel within allowed window
- Window calculation: Cancellation allowed if more than threshold hours remain before pickup
- Atomicity: Cancels booking, frees vehicle slot, decrements user stats
- Notifications: Sends internal notification and email

```mermaid
flowchart TD
Start(["Cancel Booking"]) --> Auth["Verify User/Admin"]
Auth --> CheckWin{"Within Cancellation Window?"}
CheckWin --> |No| Deny["Deny: Window Closed"]
CheckWin --> |Yes| Txn["Start Transaction"]
Txn --> Find["Find Booking Detail"]
Find --> SetStat["Set Status = cancelled"]
SetStat --> Free["Pull bookedPeriods from Vehicle"]
Free --> Dec["Decrement User Stats"]
Dec --> Commit["Commit"]
Commit --> Notify["Send Notification + Email"]
Notify --> Done(["Success"])
Deny --> Done
```

**Diagram sources**
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L480-L632)
- [runTransaction.js](file://backend/model/runTransaction.js#L4-L18)
- [notificationThroughMessageBroker.js](file://backend/utils/notificationThroughMessageBroker.js#L56-L64)

**Section sources**
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L470-L632)

### Booking Model Schema Details
- Embedded vehicleDetails array with per-entry pricing and status
- Index on uniqueBookingId for uniqueness enforcement
- Auto-incremented uniqueBookingId generation via a counter document

```mermaid
classDiagram
class BookingDetail {
+string userEmail
+mixed userDetails
+vehicleDetails[]
+createdAt
+updatedAt
}
class VehicleBookingDetail {
+string name
+string model
+string description
+string vehicleType
+number uniqueVehicleId
+boolean vehicleStatus
+string location
+string vehicleNumber
+number vehicleMilage
+array filePath
+string bookingStatus
+date pickupDate
+date dropOffDate
+number price
+number extraExpenditure
+number tax
+number totalPrice
+number damage
+number uniqueBookingId
+date createdAt
}
BookingDetail --> VehicleBookingDetail : "embeds"
```

**Diagram sources**
- [vehicleBookingModel.js](file://backend/model/vehicleBookingModel.js#L9-L66)

**Section sources**
- [vehicleBookingModel.js](file://backend/model/vehicleBookingModel.js#L68-L97)

### Frontend Booking UI and Redux State Management
- UI collects dates, calculates price breakdown, and dispatches createBooking thunk
- Redux slice defines async thunks for create, cancel, complete, and fetch operations
- State tracks loading, success messages, and errors for each operation

```mermaid
sequenceDiagram
participant UI as "VehicleBookingDetails.jsx"
participant RS as "vehicleBookingSlice.js"
participant API as "Express Backend"
UI->>RS : "dispatch createBooking(bookingData)"
RS->>API : "POST /addbooking"
API-->>RS : "200 OK with data"
RS-->>UI : "state updated with success"
```

**Diagram sources**
- [VehicleBookingDetails.jsx](file://frontend/src/pages/VehicleBookingPage/VehicleBookingDetails.jsx#L115-L144)
- [vehicleBookingSlice.js](file://frontend/src/appRedux/redux/bookingSlice/vehicleBookingSlice.js#L24-L37)
- [bookingRoutes.js](file://backend/router/bookingRoutes.js#L7-L7)

**Section sources**
- [VehicleBookingDetails.jsx](file://frontend/src/pages/VehicleBookingPage/VehicleBookingDetails.jsx#L1-L372)
- [vehicleBookingSlice.js](file://frontend/src/appRedux/redux/bookingSlice/vehicleBookingSlice.js#L1-L203)

### Real-time Updates via Socket.IO
- Socket.IO server is initialized and attached to the HTTP server
- Frontend can integrate listeners to receive live updates on booking events

```mermaid
sequenceDiagram
participant BE as "server.js"
participant IO as "Socket.IO Server"
participant CL as "Connected Clients"
BE->>IO : "initialize with CORS"
IO-->>CL : "accept connections"
IO-->>CL : "emit booking-related events"
```

**Diagram sources**
- [server.js](file://backend/server.js#L52-L60)

**Section sources**
- [server.js](file://backend/server.js#L52-L60)

### RabbitMQ Integration for Notifications
- Producer connects to RabbitMQ, asserts topic exchange, publishes persistent notifications
- Routing keys differ for admin vs user targets

```mermaid
sequenceDiagram
participant CTL as "vehicleBookingController.js"
participant MQ as "notificationThroughMessageBroker.js"
participant RMQ as "RabbitMQ Broker"
CTL->>MQ : "sendNotification(userId, role, message, title, type)"
MQ->>RMQ : "publish(exchange='notifications_topic', routingKey)"
RMQ-->>MQ : "ack"
```

**Diagram sources**
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L431-L457)
- [notificationThroughMessageBroker.js](file://backend/utils/notificationThroughMessageBroker.js#L33-L64)

**Section sources**
- [notificationThroughMessageBroker.js](file://backend/utils/notificationThroughMessageBroker.js#L1-L69)
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L431-L457)

### Booking List Management and History
- Endpoint retrieves a user’s booking details; optional status filtering
- Frontend Redux slice fetches and stores booking lists

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant RS as "vehicleBookingSlice.js"
participant RT as "Router"
participant CTL as "Controller"
FE->>RS : "dispatch getBookingListData()"
RS->>RT : "GET /getBookingdetails?Status=<optional>"
RT->>CTL : "getBookingDetails()"
CTL-->>RS : "filtered vehicleDetails[]"
RS-->>FE : "state updated with list"
```

**Diagram sources**
- [vehicleBookingSlice.js](file://frontend/src/appRedux/redux/bookingSlice/vehicleBookingSlice.js#L7-L19)
- [bookingRoutes.js](file://backend/router/bookingRoutes.js#L8-L12)
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L635-L662)

**Section sources**
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L635-L662)
- [vehicleBookingSlice.js](file://frontend/src/appRedux/redux/bookingSlice/vehicleBookingSlice.js#L7-L19)

### Audit Trails
- Audit log schema captures action, entity type, identifiers, performer, and IP/user agent
- Utilities support transaction-aware audit logging

```mermaid
classDiagram
class AuditLog {
+string action
+string entityType
+string entityId
+object performedBy
+object oldValue
+object newValue
+string ipAddress
+string userAgent
+date createdAt
+date updatedAt
}
```

**Diagram sources**
- [auditLogSchema.js](file://backend/model/auditLogSchema.js#L3-L61)

**Section sources**
- [auditLogSchema.js](file://backend/model/auditLogSchema.js#L1-L64)
- [createAuditLog.js](file://backend/utils/createAuditLog.js#L1-L31)

## Dependency Analysis
- Controllers depend on models, transaction utility, and notification utilities
- Frontend Redux slices depend on backend routes
- Server integrates Socket.IO and exposes routes

```mermaid
graph LR
FE_RS["vehicleBookingSlice.js"] --> BE_RT["bookingRoutes.js"]
BE_RT --> BE_CTL["vehicleBookingController.js"]
BE_CTL --> BE_MDL_BK["vehicleBookingModel.js"]
BE_CTL --> BE_MDL_VEH["vehicleDetailModel.js"]
BE_CTL --> BE_UTIL_TX["runTransaction.js"]
BE_CTL --> BE_UTIL_NTF["notificationThroughMessageBroker.js"]
BE_SRV["server.js"] --> BE_RT
BE_SRV --> BE_UTIL_ERR["errorHandlingMiddleware.js"]
```

**Diagram sources**
- [vehicleBookingSlice.js](file://frontend/src/appRedux/redux/bookingSlice/vehicleBookingSlice.js#L1-L203)
- [bookingRoutes.js](file://backend/router/bookingRoutes.js#L1-L31)
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L1-L861)
- [vehicleBookingModel.js](file://backend/model/vehicleBookingModel.js#L1-L105)
- [vehicleDetailModel.js](file://backend/model/vehicleDetailModel.js#L1-L145)
- [runTransaction.js](file://backend/model/runTransaction.js#L1-L43)
- [notificationThroughMessageBroker.js](file://backend/utils/notificationThroughMessageBroker.js#L1-L69)
- [server.js](file://backend/server.js#L34-L76)
- [errorHandlingMiddleware.js](file://backend/utils/errorHandlingMiddleware.js#L1-L233)

**Section sources**
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L1-L861)
- [vehicleBookingSlice.js](file://frontend/src/appRedux/redux/bookingSlice/vehicleBookingSlice.js#L1-L203)

## Performance Considerations
- Use MongoDB indexes on frequently queried fields (e.g., uniqueBookingId, uniqueVehicleId) to speed up lookups
- Batch vehicle availability queries when scaling
- Limit concurrent booking requests per vehicle to reduce contention
- Use transactions judiciously; keep them short-lived to minimize lock duration
- Offload heavy computations (e.g., pricing) to the frontend or precompute ranges to reduce backend load

## Troubleshooting Guide
Common issues and resolutions:
- Duplicate booking conflict: Ensure uniqueBookingId uniqueness and proper transaction usage
- Availability mismatch: Verify interval overlap logic and timezone handling
- Cancellation denied: Confirm cancellation window rules and user/admin permissions
- Notification delivery failures: Check RabbitMQ connectivity and exchange assertions
- Error handling: Centralized error handler formats operational vs unexpected errors

**Section sources**
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L470-L632)
- [errorHandlingMiddleware.js](file://backend/utils/errorHandlingMiddleware.js#L117-L232)
- [notificationThroughMessageBroker.js](file://backend/utils/notificationThroughMessageBroker.js#L8-L30)

## Conclusion
The booking system enforces strong consistency via MongoDB transactions, robust availability checks, and a clear separation of concerns across frontend and backend. RabbitMQ and Socket.IO enable scalable notifications and real-time updates. Extending the system should focus on audit coverage, analytics hooks, and capacity planning aligned with vehicle group sizes and demand patterns.

## Appendices

### API Definitions
- POST /addbooking
  - Authenticated user creates a booking with pickupDate, dropOffDate, price, extraExpenditure, tax, totalPrice, uniqueGroupId, bookingStatus
  - Returns created booking document
- GET /getBookingdetails?Status=<optional>
  - Returns user’s booking details, optionally filtered by status
- PATCH /updateBookingDetails
  - Cancels a booking by setting status to cancelled (with cancellation window checks)
- PATCH /rescheduleBooking
  - Reschedules booking dates after availability verification
- PATCH /completeBooking (admin-only)
  - Marks a booking as completed

**Section sources**
- [bookingRoutes.js](file://backend/router/bookingRoutes.js#L7-L28)

### Common Scenarios
- New booking: Select dates, compute price, submit via Redux thunk, receive success and notification
- Reschedule: Choose new dates, verify availability, update booking
- Cancel: Within allowed window, admin can cancel immediately; otherwise enforce window rules
- Completion: Admin marks ride as completed

**Section sources**
- [VehicleBookingDetails.jsx](file://frontend/src/pages/VehicleBookingPage/VehicleBookingDetails.jsx#L115-L144)
- [vehicleBookingController.js](file://backend/Controller/vehicleBookingController.js#L664-L800)