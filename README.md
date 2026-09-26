# Nabad

## Deployment

The frontend is live at **https://nabad-psi.vercel.app** (Vercel project `nabad`, team `nabad3`).

To redeploy to production, run this from the `frontend/` folder:

```bash
npx vercel --prod
```

(On Windows PowerShell, use `npx.cmd vercel --prod` if `npx` is blocked.) The first time on a new machine, run `npx vercel login`, then `npx vercel link --project nabad` to connect the folder to the project. You need to be a member of the `nabad3` Vercel team.
