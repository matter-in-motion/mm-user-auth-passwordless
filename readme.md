# Matter In Motion. User passwordless authentication via email extension

[![NPM Version](https://img.shields.io/npm/v/mm-user-auth-passwordless.svg?style=flat-square)](https://www.npmjs.com/package/mm-user-auth-passwordless)
[![NPM Downloads](https://img.shields.io/npm/dt/mm-user-auth-passwordless.svg?style=flat-square)](https://www.npmjs.com/package/mm-user-auth-passwordless)

This extension adds a **passwordless** method to authenticate users in your app. It works like this:

1. User enters email
2. App sends a token to user's email
3. User clicks on the link inside the email
4. The app checks the token and returns an authentication token
5. Done!

## Usage

[Extensions installation instructions](https://github.com/matter-in-motion/mm/blob/master/docs/extensions.md)

## Dependencies

* __[user](https://github.com/matter-in-motion/mm-user)__
* __[mail](https://github.com/matter-in-motion/mm-mail)__

## Settings

First, you need to define user authentication provider as [here](https://github.com/matter-in-motion/mm/blob/master/docs/authentication.md)

This extension adds settings to the user settings.

* **login**
  - expiresIn: '15 mins' — string, login token expiration time
  - subject — string, login token email subject (Tip: if no subject defined `mail` takes the subject from the `<title>` tag in the email)
  - template — string, the path to login token email template


## API

### user.sendAuthentication

Sends authentication token to the email

**Request**

* **email** — user's email
* data — additional data to add to the token
  - redirect — redirect URL. You can use it to return a user to the page he logged in from.

**Response**

* true — if token send
* `NotFound` error, code 4540 — when user not found

### user.authenticate

Authenticates the user and returns authentication token to use with API.

**Request**

token from email

**Response**

* **token** — authentication token
* **expires** — timestamp when token will expire
* redirect — URL, where the user logged in from

* `Unauthorized` error, code 4100 — when no user authenticated

License MIT;
