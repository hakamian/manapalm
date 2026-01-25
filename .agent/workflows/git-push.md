---
description: how to commit and push changes to the repository
---

To save and push your latest changes to the Git repository, follow these steps in your terminal:

1. Stage all changes:
```powershell
git add .
```

2. Commit the changes with a descriptive message:
```powershell
git commit -m "Refactor: Optimized AppContext, revamped AuthModal design, and fixed Cart UI issues"
```

3. Push to the remote repository:
```powershell
git push
```

Note: If this is your first time pushing or you are on a new branch, you might need:
```powershell
git push -u origin main
```
