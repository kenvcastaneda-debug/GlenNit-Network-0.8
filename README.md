# AI Video Studio — real generator

This project is an Android-friendly web app with a Node.js/Express server. The browser **never receives your Runway API key**. It calls `/api/generate`; the server reads `RUNWAYML_API_SECRET` from its environment and calls Runway.

## Put your API key in the server

1. Copy `.env.example` and name the copy `.env`.
2. Open `.env`.
3. Replace `put_your_runway_api_key_here` with your Runway API key.
4. Save the file.

Example:

```text
RUNWAYML_API_SECRET=YOUR_RUNWAY_KEY_HERE
PORT=3000
```

**Never put the real key in `index.html`, JavaScript running in the browser, screenshots, or messages.**

## Android-only setup

You need an online Node.js hosting/coding environment because the browser cannot safely hold the secret key. Upload this project, run `npm install`, make the `.env` file as described above, then run `npm start`. Open the resulting public web address on your Android phone.

## Generate a video

The app sends the prompt, duration, aspect ratio, and style to `/api/generate`. The server calls Runway's `seedance2_5` text-to-video model and waits for the task to finish before returning the video URL.

The current Runway documentation lists Seedance 2.5 as supporting text-to-video, with 4–30 second durations and 480p/720p/1080p output. This app uses 480p for the starter configuration to keep API usage lower.

## Security

The page intentionally displays this message:

> Your API key is not stored in this page. The browser calls your server, and the server calls the video API.

That is a security explanation, not a place to paste the key. The actual secret belongs in the server's environment variable `RUNWAYML_API_SECRET`.

## Important

Video generation consumes API credits according to the provider's current pricing and account limits.
