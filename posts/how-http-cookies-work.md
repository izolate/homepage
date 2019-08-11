---
title: "How HTTP Cookies Work"
description: "Brief overview of how HTTP cookies work, outlining some of the gotchas that I learnt the hard way while creating a cookie middleware"
date: "2019-08-11"
template: posts
public: true
---

An HTTP cookie is a tiny (4 KB) piece of data that a client (e.g. browser)
stores locally.

Since HTTP is a stateless protocol, cookies act as a shared state that enable
some truly great things (persistent login sessions), and some other not-so-great
ones (ad-tracking).

<br>

## Creating cookies

A cookie's life is conceived when a server responds to a request and instructs
the client to set a cookie, using the aptly-named `Set-Cookie` HTTP header
in the response.

```http
HTTP/1.1 200 OK
Set-Cookie: user_id=123
```

A cookie can have several optional attributes too, which are separated by a
semicolon (`;`), and appended to the end of the cookie value.

```http
Set-Cookie: user_id=123; Expires=Wed, 11 Aug 2019 00:00:00 GMT; Secure; HttpOnly
```

This sets the expiry date of the cookie (`Expiry`), ensures it's only sent to
the server via HTTPS (`Secure`), and doesn't expose it to the DOM APIs (`HttpOnly`).

Upon parsing the response header, the browser saves the cookie locally.

<br>

## Setting multiple cookies

Cookies are standardised by the Internet Engineering Task Force (IETF) and
explained in a RFC Document.

Initially, the behaviour of cookies was outlined in
[RFC 2109](https://tools.ietf.org/html/rfc2109), which allowed multiple cookies
to be "folded" into a single `Set-Cookie` header separated by a comma.

<small style="color:#ccc; margin-bottom:-45px; display:block">❌ &nbsp;The wrong way</small>
```http
Set-Cookie: user_id=123, app_theme=dark, likes_apples=true
```


As you can imagine, setting multiple cookies (along with their attributes)
created long, unsightly header values. Probably realising this needed
improvement, the IETF released [RFC 6265](https://tools.ietf.org/html/rfc6265)
in 2011, which notably set a new rule:

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

The cookie's journey back to the server is through the `Cookie` header in the
HTTP request.

```http
GET /index.html HTTP/1.1
Cookie: user_id=123
```

In contrast to `Set-Cookie`, multiple cookies are folded into the same
header value, and are a bit confusingly separated by a semicolon.

```http
Cookie: user_id=123; app_theme=dark; likes_apples=true
```

You don't have to worry about setting cookie attributes in the request, because
they are never returned back to the server. It's a one-way street for them,
from server to client.

<br>

## Conclusion

This was a brief overview of how HTTP cookies work, outlining some of the gotchas
that I learnt the hard way while building a cookie middleware for a web server.

If you'd like to learn more about cookie attributes, or other areas not covered
in this article, I recommend reading more at [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies).
