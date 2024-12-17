# URL Shortener API Documentation

## Overview

This API provides functionality to shorten URLs, redirect users to the original URL, and track analytics for the shortened URLs. The core features include:

- Generating short URLs.
- Redirecting to the original URL using the short ID.
- Tracking click analytics for each shortened URL.

---

## Table of Contents

1. [Endpoints](#endpoints)
2. [Models](#models)
3. [Controllers](#controllers)
4. [Routes](#routes)

---

## Endpoints

### 1. Generate Short URL

**Endpoint:** `POST /`  
**Description:** Generates a short ID for the provided URL.  
**Request Body:**

```json
{
  "url": "https://example.com"
}
```

**Response:**

- **201 Created**:
  ```json
  {
    "statusCode": 201,
    "id": "abc12345"
  }
  ```
- **400 Bad Request**:
  ```json
  {
    "statusCode": 400,
    "error": "URL is required"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "statusCode": 500,
    "error": "Error occurred while creating short url: <error_message>"
  }
  ```

---

### 2. Redirect to Original URL

**Endpoint:** `GET /:shortId`  
**Description:** Redirects to the original URL associated with the provided short ID.  
**Response:**

- **302 Found**: Redirects to the original URL.
- **404 Not Found**:
  ```json
  {
    "statusCode": 404,
    "message": "Short ID not found"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "statusCode": 500,
    "error": "Error Occurred <error_message>"
  }
  ```

---

### 3. Get Analytics

**Endpoint:** `GET /analytics/:shortId`  
**Description:** Retrieves analytics data, including total clicks and timestamps for the short ID.  
**Response:**

- **200 OK**:
  ```json
  {
    "statusCode": 200,
    "totalClicks": 5,
    "analytics": [
      { "timestamp": 1678290000000 },
      { "timestamp": 1678291000000 }
    ]
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "statusCode": 500,
    "message": "Error Occurred <error_message>"
  }
  ```

---

## Models

### URL Schema

**Model Name:** `URL`  
**Description:** MongoDB schema for storing URLs and their metadata.

**Fields:**

- `shortID` (String): Unique identifier for the short URL.
- `redirectURL` (String): The original URL to which the short ID redirects.
- `visitHistory` (Array): Timestamps of when the short link was accessed.

**Options:**

- `timestamps`: Automatically adds `createdAt` and `updatedAt` fields.

```javascript
const urlSchema = new mongoose.Schema(
  {
    shortID: { type: String, required: true, unique: true },
    redirectURL: { type: String, required: true },
    visitHistory: [{ timestamp: { type: Number } }],
  },
  { timestamps: true }
);
export const URL = mongoose.model("URL", urlSchema);
```

---

## Controllers

### handleGenerateShortURL

**Description:** Generates a short ID for the original URL and stores it in the database.

### handleRedirectShortURL

**Description:** Redirects to the original URL and logs the access timestamp in the visit history.

### handleAnalytics

**Description:** Retrieves the total number of clicks and timestamps for a specific short ID.

---

## Routes

**Router:** `urlRouter`

| Method | Endpoint              | Controller               | Description                    |
| ------ | --------------------- | ------------------------ | ------------------------------ |
| POST   | `/`                   | `handleGenerateShortURL` | Generate a short URL.          |
| GET    | `/:shortId`           | `handleRedirectShortURL` | Redirect to the original URL.  |
| GET    | `/analytics/:shortId` | `handleAnalytics`        | Get analytics for a short URL. |

**Code Example:**

```javascript
urlRouter
  .post("/", handleGenerateShortURL)
  .get("/:shortId", handleRedirectShortURL)
  .get("/analytics/:shortId", handleAnalytics);

export default urlRouter;
```

---

## Setup

1. Install dependencies:
   ```bash
   npm install express mongoose nanoid
   ```
2. Import and use the routes in your Express application:

   ```javascript
   import express from "express";
   import urlRouter from "./routes/url.js";

   const app = express();
   app.use(express.json());
   app.use("/api/urls", urlRouter);

   app.listen(3000, () => console.log("Server running on port 3000"));
   ```

---
