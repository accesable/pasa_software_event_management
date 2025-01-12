<details>
<summary>View commands</summary>

```bash copy
npm install
```


```bash copy
npm run dev
```

```bash copy
npm run build
```

</details>

# File structure
## Where to modify
- SignIn at `src\pages\authentication\SignIn.tsx`

<details>
<summary>View file tree</summary>

```files
📂 antd-multi-dashboard/
┣ 📂 .github/                   # GitHub's folder configs **
┣ 📂 .husky/                    # Husky's folder
┃ ┣ 📃 commit-msg               # Commitlint git hook
┃ ┗ 📃 pre-commit               # Lint-staged git hook
┣ 📂 .vscode/                   # VSCode's workspace **
┣ 📂 .idea/                     # Intellij's webstorm workspace **
┣ 📂 .storybook/                # Storybook folder config **
┣ 📂 public/                    # Public folder
┃ ┣ 📂 mocks/                   # Mock data folder **
┃ ┣ 📂 showcase/                # Showcase images folder **
┃ ┣ 📃 favicon.ico              # Icon tab browser
┣ 📂 src/
┃ ┣ 📂 assets/                  # Assets folder **
┃ ┣ 📂 components/              # App Components **
┃ ┣ 📂 constants/               # App Components **
┃ ┃ ┗ 📃 routes.tsx              # All routes declarations **
┃ ┣ 📂 context/                 # React state conexts **
┃ ┣ 📂 hooks/                   # React Hooks **
┃ ┃ ┗ 📃 useFetch.ts            # Data fetch hook (optional) **
┃ ┣ 📂 layouts/                 # Page layouts folder **
┃ ┣ 📂 pages/                   # Pages **
┃ ┣ 📂 routes/                  # Routes config folder **
┃ ┣ 📂 stories/                 # Storybook folder **
┃ ┣ 📂 types/                   # Typescript types/interfaces **
┃ ┣ 📂 utils/                   # Useful functions folder **
┣ 📃 .editorconfig              # Editor config
┣ 📃 .eslintrc                  # ESLint config
┣ 📃 .gitignore                 # Git ignore
┣ 📃 .prettierignore            # Prettier ignore
┣ 📃 .prettierrc                # Prettier ignore
┣ 📃 .versionrc                 # Versioning config
┣ 📃 .commitlintrc              # Commitlint config
┣ 📃 CHANGELOG.md               # Changelogs
┣ 📃 CONTRIBUTING.md            # Contributing
┣ 📃 LICENSE                    # License of the project
┣ 📃 vite.config.js             # Vite config
┣ 📃 README.md                  # Main README
┣ 📃 renovate.json              # Renovate Bot config **
┣ 📃 tsconfig.json              # TypeScript config
```

</details>
