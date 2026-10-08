---
title: "Protecting your domains with Cloudflare: the settings that actually matter"
description: "Proxy, origin guard, strict TLS, WAF, rate limiting, Under Attack mode and email: a method for protecting an API and its front ends without breaking the mobile app or the webhooks."
date: 2026-10-04
tags: [Cloudflare, Security, DNS, Go]
---

Take a common setup: a website, a PWA and an admin console served by a front-end hosting platform, an API hosted elsewhere, a mobile app, and the whole DNS zone behind Cloudflare. In the examples, the domain is `example.com`, reserved for documentation.

Putting Cloudflare in front of a domain takes ten minutes. Configuring it so it really protects you, without breaking the mobile app, the payment webhooks or link previews, takes more method. Here is the order I recommend.

## 1. Proxy, then close the back door

The orange cloud on a DNS record routes traffic through Cloudflare: WAF, rate limiting, caching, IP masking. It is the first step, but it is not enough.

Most hosts give your service a public address of their own, something like `my-api.host.app`. Anyone who finds it bypasses Cloudflare and all its rules. The proxy cannot hide a host that has its own public address.

The fix: a secret shared between Cloudflare and the origin.

1. A **Transform Rule** (*Modify Request Header*), scoped to the API host, adds a header carrying a long random value to every request.
2. The API rejects any request that does not carry that value, with a bare `403`. Only a health route, if you have one, is exempt, for the host's probes, provided it returns nothing sensitive.

Pick the header name yourself, and nothing obvious: the harder it is to guess, the fewer attempts it attracts. In Go, the guard fits in a few lines. The comparison runs in constant time, so response timing reveals nothing about the secret:

```go
// header is for example "X-Origin-Secret"; choose your own.
func OriginGuard(header, secret string) func(http.Handler) http.Handler {
	expected := []byte(secret)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			got := []byte(r.Header.Get(header))
			if subtle.ConstantTimeCompare(got, expected) != 1 {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
```

The secret lives in two places: the Cloudflare rule and an environment variable on the host, never in the repository. To rotate it without downtime, have the API accept two values during the switch, update the rule, then remove the old value.

Depending on your hosting, there are sturdier options:

- **Authenticated Origin Pulls**: Cloudflare presents a client certificate (mTLS) that the origin verifies. You need control over TLS on the origin side, which a host's shared domain usually does not allow.
- **Cloudflare Tunnel**: on a VPS, the origin exposes no port at all; it opens an outbound connection to Cloudflare itself. This is the option to prefer as soon as you control the machine.

## 2. TLS: Full (strict), never Flexible

Under *SSL/TLS*, **Flexible** mode encrypts the leg from the visitor to Cloudflare, but leaves the leg from Cloudflare to the origin in plain HTTP. With a host that redirects to HTTPS on its own, it also causes a redirect loop.

The right settings:

- **Full (strict)** mode: encrypted end to end, and the origin's certificate is verified;
- **Always Use HTTPS** enabled;
- **minimum TLS version** set to 1.2;
- **HSTS** enabled only once every subdomain is served over HTTPS: a browser that has received it will then refuse any HTTP access.

## 3. WAF and rate limiting, host by host

Cloudflare's managed rules already filter known attacks. Add custom rules, always scoped by host:

- block probes that match no technology you use (`/wp-admin`, `/.env`, `/.git`): if you do not run WordPress, none of these URLs is legitimate;
- apply a **rate limit** to routes that cost money or expose accounts: SMS OTP delivery, password reset, login.

The free plan offers few rate-limiting rules: save them for routes that trigger a cost, such as an SMS. Everything else is limited in the API itself, with a per-IP limiter on every public route. The two levels complement each other: Cloudflare stops most of the traffic at the edge, and the API keeps a limit that holds even if a rule goes away. Do not publish your thresholds: they tell an attacker exactly which pace stays under the radar.

## 4. Under Attack and Bot Fight Mode: where to enable them, and where not to

**Under Attack** mode presents a JavaScript challenge to every visitor. On a site read by browsers, it protects well. On an API, it breaks everything that is not a browser:

- the **mobile app**, whose HTTP client does not run JavaScript;
- the payment provider's **webhooks**, which receive the challenge instead of the expected response;
- the **servers** that call the API.

So keep Under Attack for hosts read by browsers, and protect the API another way: origin guard, WAF, rate limiting. Webhooks are verified by signature (HMAC) in the API, not by a Cloudflare challenge.

### Common trap: server-to-server calls

A front end that calls the API from its own servers (server-side rendering, *serverless* functions) does so from data-centre IP addresses. That is exactly what **Bot Fight Mode** targets: the mobile app works, the website gets `403`s.

Two ways out:

- call the API **from the browser**, with strict CORS: no more server in the middle;
- or, if the server call is unavoidable, authenticate it with a dedicated secret and exempt it with a precise WAF rule, never by turning the protection off for everyone.

To diagnose a `403`, look at the raw response with `curl -i` against your own domain:

- a `cf-mitigated: challenge` header means Cloudflare;
- a response without that header comes from your origin, for instance from the guard described above.

### Common trap: link previews

Sharing a page in a messaging app should show a preview: title, image, description. But some messaging apps build that preview from the phone, without running the JavaScript challenge. With Under Attack on, previews disappear.

Two solutions:

- a custom WAF rule with the **Skip** action, limited to preview bots (`WhatsApp`, `facebookexternalhit`, `TelegramBot`) and to shareable pages only;
- serve the `og:*` tags from a host that is not challenged, and redirect those bots to it.

A user agent is easy to fake: the Skip rule must only open public pages, never a route that writes or returns private data.

## 5. DNS and email

If your domain sends email, a few rules:

- the **SPF**, **DKIM** and **DMARC** records stay DNS only (grey cloud): they are not web hosts;
- **DMARC** starts at `p=none` so you can read the reports, then moves to `quarantine` once everything is aligned;
- enable **DNSSEC** in Cloudflare and publish the DS record at your registrar;
- delete orphaned records (old hosts, experiments): a CNAME pointing to an abandoned service allows a subdomain takeover.

## 6. What you do not publish

One last rule, which applies to a blog post as much as to a README or an error page: do not publish the map of your infrastructure. Internal subdomain names, the origin's direct address, the secret header's name, rate-limit thresholds, hosts exempted from challenges: each of these saves an attacker time. Security must not rely on keeping these details secret, but nothing forces you to hand them out.

## The checklist

| Setting | Where | Why |
| --- | --- | --- |
| Proxy on (orange cloud) | DNS, web hosts | Route traffic through the WAF |
| Origin secret (Transform Rule) | API | Prevent bypass through the host's address |
| Full (strict), TLS 1.2 minimum, HSTS | SSL/TLS | Encrypt and verify end to end |
| Managed rules and blocked probes | WAF | Filter the noise before the origin |
| Rate limit on OTP and login | WAF and API | Protect accounts and the SMS bill |
| Under Attack on browser hosts only | Security | Never challenge the mobile app or the webhooks |
| Skip for preview bots, public pages only | WAF | Keep link previews |
| SPF, DKIM, DMARC, DNSSEC | DNS | Protect the domain and deliverability |

None of this is exotic. What matters is knowing, for each host, **who calls it**: a browser, an app, a server or a bot. The right protection follows from that.
