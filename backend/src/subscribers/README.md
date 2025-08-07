# Subscribers

This directory contains event subscribers that handle various events in the Medusa application.

## Available Subscribers

### `invite-created.ts`

Handles the `invite.created` and `invite.resent` events to send invitation emails to new users.

### `order-placed.ts`

Handles the `order.placed` event to send order confirmation emails to customers.

### `payment-captured.ts`

Handles the `payment.captured` event to send payment confirmation emails.

### `product-created.ts`

Handles the `product.created` event for product-related notifications.

### `password-reset.ts`

Handles the `auth.password_reset` event to send password reset emails to users.

## Password Reset Flow

When a user requests a password reset:

1. The system generates a password reset token and emits the `auth.password_reset` event
2. The `password-reset.ts` subscriber catches this event and sends an email notification
3. The email contains a link with the reset token and user's email
4. The user clicks the link and is redirected to the reset password page
5. The user enters their new password and submits the form

### Email Template

The password reset email uses the `PASSWORD_RESET` template which includes:

- A personalized greeting with the user's email
- A "Reset Password" button
- A fallback URL that can be copied and pasted
- Security disclaimers and instructions

### URL Configuration

The reset URL is constructed based on the user type:

- **Customers**: Uses `STORE_URL` from environment variables
- **Admin users**: Uses the backend URL with admin path

### Environment Variables Required

Make sure these environment variables are set:

- `STORE_URL`: The URL of your storefront
- `RESEND_API_KEY`: Your Resend API key
- `RESEND_FROM_EMAIL`: The email address to send from

## Testing

To test the password reset flow:

1. Start your Medusa application
2. Go to the admin panel login page
3. Click "Reset" and enter an email address
4. Check the server logs for the event emission
5. Check the email inbox for the reset password email

## Customization

You can customize the email template by modifying `src/modules/email-notifications/templates/password-reset.tsx`.

The template supports the following props:

- `reset_url`: The URL to reset the password
- `email`: The user's email address
- `preview`: The email preview text
