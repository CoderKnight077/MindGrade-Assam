# Aspirants Academy

Static learning resources for Assam board students in Classes 9 and 10, with an OpenAI-powered study helper served through a Vercel serverless function.

## Deploy

1. Import this repository into Vercel and deploy it with the repository root as the project root.
2. In the Vercel project settings, add `OPENAI_API_KEY` as an environment variable for the deployment environments you use, then redeploy.
3. Keep the key only in Vercel's environment settings. Never add it to the browser code, repository, or a public `.env` file.

The homepage is static and the `/api/chat` function makes requests to OpenAI using the `gpt-4o-mini` model. The AI helper will report that it is not configured until the server-side key is set. Model usage may incur OpenAI charges; configure provider spending limits and Vercel rate limiting before sharing the public endpoint. Questions submitted in the helper are sent to OpenAI; students should avoid entering personal or sensitive information. The helper is an aid, not a substitute for checking class notes or asking a teacher.

## Responsive layout

The homepage includes a collapsible navigation menu, responsive subject and feature cards, and a study helper that adapts to narrow screens.