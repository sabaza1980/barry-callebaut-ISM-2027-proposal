# Deployment Playbook: New CVs and New Role Pages

This guide is the standard process for publishing new CV files and new role pages to `abaza.nl`.

## Scope

Use this when you add or update:
- A role page (example: `events-director/index.html`)
- A CV HTML/PDF asset (example: `raa-application/raa-cv-updated.pdf`)
- Related route mappings in `vercel.json`

## Prerequisites

- Repo remote should point to:
  - `https://github.com/sabaza1980/barry-callebaut-ISM-2027-proposal.git`
- Vercel project should be:
  - `barry-callebaut-ism-2027`
- Vercel scope should be:
  - `sherifs-projects-4627960f`

Quick checks:

```powershell
git remote -v
vercel projects ls
```

## 1. Make content changes

Typical files:
- New page: `some-role/index.html`
- New CV PDF: `some-role/some-cv-updated.pdf`
- Optional source CV HTML/build scripts

Important page rules:
- Use absolute/route-safe asset paths when needed (for example image paths like `/events-director/profile.jpg`).
- Point download links to the intended latest file (for example `.../raa-cv-updated.pdf`).

## 2. Add route mapping in `vercel.json` (if new path)

If this is a new route, add a rewrite:

```json
{ "source": "/new-role", "destination": "/new-role/index.html" }
```

If CV should have a clean route too:

```json
{ "source": "/new-role-cv", "destination": "/new-role/new-cv.html" }
```

## 3. Use a clean deploy worktree (recommended)

This avoids unrelated local changes being committed.

```powershell
git fetch origin
git worktree add ..\ism-hotfix origin/master
```

Copy only files you want to publish into `..\ism-hotfix`.

## 4. Commit and push

From `..\ism-hotfix`:

```powershell
git status --short
git add <only the intended files>
git commit -m "Publish <role/page/cv update>"
git push origin HEAD:master
```

## 5. Ensure Vercel is linked to the correct project

From `..\ism-hotfix`:

```powershell
vercel link --yes --project barry-callebaut-ism-2027 --scope sherifs-projects-4627960f
vercel pull --yes --environment=production --scope sherifs-projects-4627960f
```

Note: If Vercel shows a different project name (for example `ism-hotfix`), remove `.vercel` and relink.

```powershell
Remove-Item -Recurse -Force .vercel
vercel link --yes --project barry-callebaut-ism-2027 --scope sherifs-projects-4627960f
```

## 6. Deploy to production

```powershell
vercel deploy --prod --yes --scope sherifs-projects-4627960f
```

Expected result should include alias to `https://abaza.nl`.

## 7. Verify live URLs

Run quick checks:

```powershell
try { (Invoke-WebRequest -Uri https://abaza.nl/new-role -UseBasicParsing).StatusCode } catch { $_.Exception.Response.StatusCode.value__ }
try { (Invoke-WebRequest -Uri https://abaza.nl/new-role/profile.jpg -UseBasicParsing).StatusCode } catch { $_.Exception.Response.StatusCode.value__ }
try { (Invoke-WebRequest -Uri https://abaza.nl/new-role/new-cv-updated.pdf -UseBasicParsing).StatusCode } catch { $_.Exception.Response.StatusCode.value__ }
```

For link verification in page HTML:

```powershell
$page = Invoke-WebRequest -Uri https://abaza.nl/new-role -UseBasicParsing
($page.Content | Select-String -Pattern 'new-cv-updated.pdf').Count
```

## 8. Common failure modes and fixes

- 404 on clean route (`/new-role`):
  - Missing rewrite in `vercel.json`.
- Assets not loading:
  - Relative path issue. Use route-safe absolute path.
- Deploy succeeded but domain unchanged:
  - Deployed to wrong Vercel project. Relink to `barry-callebaut-ism-2027` and redeploy.
- Correct file uploaded but old file linked:
  - Update page download links to the latest PDF filename.

## Quick publish checklist

- [ ] Files updated for page/CV
- [ ] `vercel.json` rewrite added/updated
- [ ] Commit includes only intended files
- [ ] Pushed to `master` in `barry-callebaut-ISM-2027-proposal`
- [ ] Production deploy run on `barry-callebaut-ism-2027`
- [ ] Live URL and file URLs return `200`
