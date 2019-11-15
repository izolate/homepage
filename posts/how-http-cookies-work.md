---
title: "How HTTP Cookies Work"
description: "Brief overview of how HTTP cookies work, outlining some of the gotchas that I learnt the hard way while creating a cookie middleware"
date: "2019-08-11"
template: posts
public: true
---

An HTTP cookie is a tiny (4 KB) piece of data that a client (e.g. your browser)
stores locally.

Since HTTP is a stateless protocol, cookies act as a shared, persistent state
between the client and sever, enabling you to build complex applications.
For example, cookies allow you to preserve login sessions when closing a
browser tab.

<br>

## Creating cookies

While cookies can also be created by the client, server-originating
cookies are the most common, so this article will focus on that.

The client stores a cookie when the server instructs it to do so.
This instruction comes by the way of a specific header in the **response**
to the client's HTTP request:

```http
HTTP/1.1 200 OK
Set-Cookie: user_id=123
```

This creates a cookie with name of `user_id` and value of `123`.

A cookie may have several attributes too, which are separated by a
semicolon (`;`), and appended to the end of the header value.

```http
Set-Cookie: user_id=123; Domain=example.com; HttpOnly
```

This creates a new cookie with the following attributes:

* Name: `user_id`
* Value: `123`
* Domain: `example.com`
* HttpOnly: `true`

### Common attributes

Name | Description
--- | ---
`Expiry` | Date at which the cookie expires
`MaxAge` | Number of seconds until the cookie expires
`Domain` | Host to where the cookie is sent
`Path` | Path that must exists in the URL for the client to return the cookie
`HttpOnly` | Client can only send the cookie back to the server over HTTPS
`Secure` | Forbids the DOM APIs (JavaScript) from accessing the cookie

<br>

## Creating multiple cookies

A little bit of history; there is an old, deprecated way and a new standard.
Cookies are standardised by the Internet Engineering Task Force (IETF)
and explained in a Request For Comments (RFC) Document.

Initially, the behaviour of cookies was outlined in
[RFC 2109](https://tools.ietf.org/html/rfc2109), which allowed multiple cookies
to be "folded" into a single `Set-Cookie` header separated by a comma.

<small style="color:#ccc; margin-bottom:-45px; display:block">❌ &nbsp;DEPRECATED</small>

```http
Set-Cookie: user_id=123, app_theme=dark, likes_apples=true
```

As you can imagine, setting multiple cookies (along with their attributes)
created long, unsightly header values. Probably realising this needed
improvement, in 2011 the IETF released [RFC 6265](https://tools.ietf.org/html/rfc6265),
which notably set a new rule:

> Origin servers SHOULD NOT fold multiple Set-Cookie header fields into a single header field.

This was quickly adopted by all major browsers, and now allows for a much
cleaner approach to creating multiple cookies.

<small style="color:#ccc; margin-bottom:-45px; display:block">✔️ &nbsp;The correct way</small>

```http
Set-Cookie: user_id=123
Set-Cookie: app_theme=dark
Set-Cookie: likes_apples=true
```

<br>

## Returning cookies

Once a cookie is created, the client sends the cookie back to the server on
every request. The cookie's journey back to the server is through the `Cookie`
header in the HTTP request.

```http
GET /index.html HTTP/1.1
Cookie: user_id=123
```

In contrast to `Set-Cookie`, multiple cookies are folded into the same
header value, and are (a bit confusingly) separated by a semicolon.

```http
Cookie: user_id=123; app_theme=dark; likes_apples=true
```

Cookie attributes are never returned to the server. They are instructions meant
for the client from the server.

<br>

## Conclusion

This was a brief overview of how HTTP cookies work, outlining some of the gotchas
that I learnt the hard way while building a cookie middleware for a web server.

If you'd like to learn more about cookie attributes, or other areas not covered
in this article, I recommend reading more at [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).
