# Discogs PWA

A PWA app to explore the [Discogs](https://discogs.com) universe. You can see it
running here: https://discogs-pwa.netlify.com

## Local Installation

First, pop over to [Discogs](https://discogs.com) and sign up for an account. Next, click on your Profile > Settings > Developer > Create application. Fill out the form and note the Key+Secret generated for you.

Secondly, to enable the app to run over SSL, you'll need a localhost SSL certificate and key. This is for service worker registration and HTTP2 via SPDY.

I recommend this guide for creating one so Chrome doesn't reject it. Remember to put it inside your keychain and grant it SSL trust rights if on OSX.

https://stackoverflow.com/a/43666288

Thirdly, to run the app you'll need to create an `.env` file in the root of the project and fill in the following keys:

```bash
API_KEY='YOUR_KEY'
API_SECRET='YOUR_SECRET'
USER_AGENT='YOUR_USER_AGENT'
SSL_KEY='path/to/ssl/key'
SSL_CERT='path/to/ssl/certificate'
```

Finally, navigate to the root of the project in your favourite terminal and execute `npm run start:dev` and navigate to https://localhost:8080.

Note: front-end modifications are injected via HMR, and server modifications are picked up by `webpack --watch`, while the node server is auto-restarted to reflect them. F5 your way to glory...

## Motivation

As with all web technologies, the best way to learn how to use them is to implement something. I became interested in offline PWAs mainly after re-reading about their potential on @jakearchibald's [website](https://jakearchibald.com/2014/offline-cookbook/).

There's also an interesting example by @jeffposnick on the [Google Developer site](https://developers.google.com/web/updates/2018/05/beyond-spa), and a [timely Medium post](https://slack.engineering/service-workers-at-slack-our-quest-for-faster-boot-times-and-offline-support-3492cf79c88) by Slack Engineering about how they reduced boot times by using a Service Worker.

This hobby project has served as my playground for learning more about:

- Service Workers
- HTTP2
- Express.js
- Netlify serverless lambdas
- CSS Grid
- Async/await flow control
- Webpack 4
- Nock & Supertest
- Webpack 4 (and associated plugins)
- Husky (git hooks)

That's a lot of buzzwords! 😅

### The Goal

To build an exemplar PWA with offline support, backed by the [Discogs API](https://www.discogs.com/developers).

#### Project Scoping

There are many ways to go about this, however, in an attempt focus on the fundamentals of the aforementioned technologies I stuck to a few guidelines:

- Favour vanilla technologies over frameworks (less abstraction).
- Target evergreen browsers/latest runtimes (reduce test surface area).
- Implement an MVP feature list (done over perfect).
- Minimal UI (not the focus)

Even given the last item, there's still quite a bit to think about! However, these guidelines ensured I didn't lose sight of the forest for the trees, and as an added bonus helped keep my client-side code lean!

#### (Discarded) Tech Stack

There are many worthy frameworks that can (and may in the future) be added to this app to improve it, but as the primary purpose was for learning, I feel the guidelines served me well. Technologies considered and parked include:

- Workbox for auto-generated Service Workers
- CSS frameworks; e.g. Bootstrap/Foundation/Tachyons
- CSS-in-JS frameworks; e.g. Styled Components/Emotion
- Component frameworks; e.g. React/Preact/Vue/Svelte/Angular
- Utility frameworks; e.g. jQuery/lodash
- State containers; e.g. Redux/Mobx
- Template engines; e.g. Jade/Handlebars/Pug
- Serverless hosting; e.g. Now/Firebase
- Middleware proxy caches; e.g Nginx/Varnish

All of the above are interesting and valuable in their own right, but I felt they were overkill for a simple "fetch-and-show" app. Besides - Node.js and browser engines already ship with many features out of the box!

#### Future Plans

There are plenty of features and small improvements to make to the app, but in the spirit of learning for me there are two major areas to explore:

- Authentication: Allow Discog users to login and curate their collection
- Streams: Return streamed API JSON responses and stitch these together on the client. The main use case here is performance (quicker TTFC) over slow networks.

Other areas for exploration would be to augment the Discogs content with further 3rd party data (e.g. You Tube, Spotify, Amazon, etc...).

### Implementation

**TLDR;** On the front-end the app is laid out with CSS Grid with some light DOM scripting for fetching data from the server. It is not a SPA as such, but does use the `history` object to manage navigation.

The front-end uses standard `fetch` to pull data in from the express.js backend (or rather middleware layer), which essentially proxies access to the Discogs API.

All this is deployed as a Netlify lambda function which auto-magically the content over SSL and HTTP2. Lovely.

_To follow: Various notes regarding the implementation - i.e. the info I could have used *before* starting!_
