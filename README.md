# Atti Backend API Documentation

## Introduction

Welcome to the API documentation for Atti Backend, a system for managing admin users. This documentation provides an overview of the available endpoints, their functionalities, request/response formats, and other essential details required to interact with the API.

## Table of Contents

- [Introduction](#introduction)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Admin Management](#admin-management)
    - [Login Admin](#login-admin)
    - [Register Admin](#register-admin)
    - [Get All Admins](#get-all-admins)
    - [Get Admin by ID](#get-admin-by-id)
    - [Update Admin by ID](#update-admin-by-id)
    - [Delete Admin by ID](#delete-admin-by-id)
  - [Password Management](#password-management)
    - [Send Password Reset OTP](#send-password-reset-otp)
    - [Validate Password Reset OTP](#validate-password-reset-otp)
    - [Update Admin Password by OTP](#update-admin-password-by-otp)
    - [Update Admin Password by Old Password](#update-admin-password-by-old-password)
- [Error Handling](#error-handling)
- [Logging](#logging)

## Authentication

The Atti Backend uses JWT (JSON Web Token) for authentication. Upon successful login or registration, an access token is provided, which should be included in the `Authorization` header for all subsequent requests requiring authentication.

## Endpoints

### Admin Management

#### Login Admin

**URL**: `/api/admins/login`

**Method**: `POST`

**Description**: Authenticates an admin user.

**Request Body**:

```json
{
  "data": "{\"email\":\"admin@example.com\", \"password\":\"password123\"}"
}
```

**Response**:

```json
{
  "status": 200,
  "message": "Admin logged in successfully",
  "data": {
    "email": "admin@example.com",
    "fullName": "Admin User",
    "accessToken": "jwt_token_here"
  }
}
```

#### Register Admin

**URL**: `/api/admins/register`

**Method**: `POST`

**Description**: Registers a new admin user.

**Request Body**:

```json
{
  "data": "{\"fullName\":\"Admin User\", \"email\":\"admin@example.com\", \"password\":\"password123\"}"
}
```

**Response**:

```json
{
  "status": 201,
  "message": "Admin registered successfully",
  "data": {
    "email": "admin@example.com",
    "fullName": "Admin User",
    "accessToken": "jwt_token_here"
  }
}
```

#### Get All Admins

**URL**: `/api/admins`

**Method**: `GET`

**Description**: Retrieves all admin users.

**Response**:

```json
{
  "status": 200,
  "message": "Admins retrieved successfully",
  "data": [
    {
      "email": "admin1@example.com",
      "fullName": "Admin User 1"
    },
    {
      "email": "admin2@example.com",
      "fullName": "Admin User 2"
    }
  ]
}
```

#### Get Admin by ID

**URL**: `/api/admins/:id`

**Method**: `GET`

**Description**: Retrieves a single admin user by ID.

**Parameters**:

- `id` (string): The ID of the admin.

**Response**:

```json
{
  "status": 200,
  "message": "Admin retrieved successfully",
  "data": {
    "email": "admin@example.com",
    "fullName": "Admin User",
    "profileImage": "https://via.placeholder.com/150",
    "createdAt": 1234567890
  }
}
```

#### Update Admin by ID

**URL**: `/api/admins/:id`

**Method**: `PUT`

**Description**: Updates an admin user's information.

**Parameters**:

- `id` (string): The ID of the admin.

**Request Body**:

```json
{
  "data": "{\"fullName\":\"Updated Admin User\", \"password\":\"newpassword123\"}"
}
```

**Response**:

```json
{
  "status": 200,
  "message": "Admin updated successfully",
  "data": {
    "email": "admin@example.com",
    "fullName": "Updated Admin User",
    "profileImage": "https://via.placeholder.com/150"
  }
}
```

#### Delete Admin by ID

**URL**: `/api/admins/:id`

**Method**: `DELETE`

**Description**: Deletes an admin user by ID.

**Parameters**:

- `id` (string): The ID of the admin.

**Response**:

```json
{
  "status": 200,
  "message": "Admin deleted successfully with id: admin_id"
}
```

### Password Management

#### Send Password Reset OTP

**URL**: `/api/admins/password-reset-otp`

**Method**: `POST`

**Description**: Sends a password reset OTP to the admin's email.

**Request Body**:

```json
{
  "data": "{\"email\":\"admin@example.com\"}"
}
```

**Response**:

```json
{
  "status": 200,
  "message": "OTP sent successfully"
}
```

#### Validate Password Reset OTP

**URL**: `/api/admins/validate-otp`

**Method**: `POST`

**Description**: Validates the OTP sent to the admin's email.

**Request Body**:

```json
{
  "data": "{\"email\":\"admin@example.com\", \"otp\":\"123456\"}"
}
```

**Response**:

```json
{
  "status": 200,
  "message": "OTP validated successfully"
}
```

#### Update Admin Password by OTP

**URL**: `/api/admins/update-password-otp`

**Method**: `POST`

**Description**: Updates the admin's password using OTP.

**Request Body**:

```json
{
  "data": "{\"email\":\"admin@example.com\", \"otp\":\"123456\", \"newPassword\":\"newpassword123\"}"
}
```

**Response**:

```json
{
  "status": 200,
  "message": "Password updated successfully"
}
```

#### Update Admin Password by Old Password

**URL**: `/api/admins/update-password-old/:email`

**Method**: `POST`

**Description**: Updates the admin's password using the old password.

**Parameters**:

- `email` (string): The email of the admin.

**Request Body**:

```json
{
  "data": "{\"oldPassword\":\"oldpassword123\", \"newPassword\":\"newpassword123\"}"
}
```

**Response**:

```json
{
  "status": 200,
  "message": "Password updated successfully"
}
```

## Error Handling

The API uses a standardized error response format:

**Error Response**:

```json
{
  "status": errorCode,
  "message": "Error message"
}
```

Common error codes include:

- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## Logging

The API uses Winston for logging various events and errors. Logs are categorized by severity levels (info, error, etc.) and provide detailed insights into the API's operations.

---

This concludes the API documentation for Atti Backend. For any further queries or support, please contact the development team.
