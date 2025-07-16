# Email Verification with Auth0

A modern, production-ready email verification flow using Auth0 authentication.

## Features

- **Real Email Sending**: Uses Auth0's built-in email service
- **Secure Authentication**: Industry-standard OAuth 2.0 / OpenID Connect
- **Email Verification**: Automatic verification email sending and validation
- **Modern UI**: Beautiful, responsive design with smooth animations
- **Error Handling**: Comprehensive error states and user feedback
- **Resend Functionality**: Users can request new verification emails

## Setup Instructions

### 1. Create Auth0 Account

1. Go to [auth0.com](https://auth0.com) and create a free account
2. Create a new tenant (or use existing one)

### 2. Create Application

1. In the Auth0 Dashboard, go to **Applications**
2. Click **Create Application**
3. Choose **Single Page Application**
4. Select **React** as the technology

### 3. Configure Application

In your Auth0 application settings:

**Allowed Callback URLs:**
```
http://localhost:5173, https://your-domain.com
```

**Allowed Logout URLs:**
```
http://localhost:5173, https://your-domain.com
```

**Allowed Web Origins:**
```
http://localhost:5173, https://your-domain.com
```

### 4. Environment Variables

Create a `.env` file in your project root:

```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
```

Replace with your actual Auth0 domain and client ID from the application settings.

### 5. Email Configuration (Optional)

Auth0 provides a default email service, but for production you should:

1. Go to **Branding** → **Email Templates**
2. Customize the verification email template
3. Configure a custom email provider (SendGrid, Mailgun, etc.) in **Authentication** → **Providers**

## How It Works

1. **User Registration**: User enters email and creates account
2. **Email Sent**: Auth0 automatically sends verification email
3. **User Clicks Link**: Verification link in email validates the account
4. **Status Check**: User returns to app and checks verification status
5. **Success**: Account is verified and user can proceed

## Development

```bash
npm install
npm run dev
```

## Production Deployment

1. Update environment variables for production domain
2. Configure Auth0 URLs for production domain
3. Set up custom email provider for better deliverability
4. Customize email templates with your branding

## Security Features

- **Secure Tokens**: Auth0 handles all token generation and validation
- **HTTPS Required**: Production requires HTTPS for security
- **Rate Limiting**: Built-in protection against abuse
- **Email Validation**: Proper email format and domain validation