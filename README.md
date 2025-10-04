# Ecommerce Backend API

A professional Node.js/Express.js backend API for ecommerce applications

## Installation

```bash
npm install
```

## Development Scripts

### Running the Application

```bash
npm start       # Start the production server
npm run dev     # Start the development server
```

### Code Quality & Linting

```bash
npm run lint            # Run ESLint on all files
npm run lint:fix        # Run ESLint and auto-fix issues
npm run lint:check      # Run ESLint with no warnings allowed
npm run format          # Format all files with Prettier
npm run format:check    # Check if files are formatted correctly
```

## Commit Convention

This project uses **Conventional Commits** specification for commit messages. All commits are automatically validated by Husky hooks.

### Commit Message Format

```
<type>(#<task-number>): <description>

[optional body]

[optional footer(s)]
```

**Important**: All commit messages must include a scope with a task/issue number using the `#` prefix.

### Examples

```bash
feat(#2344): add user authentication endpoint
fix(#1205): resolve memory leak in database connection
docs(#3456): update API documentation
style(#4567): fix code formatting issues
refactor(#5678): simplify user validation logic
test(#6789): add unit tests for auth middleware
chore(#7890): update dependencies
```

### Commit Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools and libraries
- **ci**: Changes to CI configuration files and scripts
- **build**: Changes that affect the build system or external dependencies
- **revert**: Reverts a previous commit

### Commit Message Rules

- **Scope is mandatory**: Must include task/issue number with `#` prefix (e.g., `#1234`)
- Type must be lowercase
- Subject must not end with a period
- Header must not exceed 72 characters
- Body lines must not exceed 100 characters
- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")

### Commit Message Rules

- Type must be lowercase
- **Scope is required** for `feat`, `fix`, `perf`, and `refactor` commits
- Use task/issue numbers for scope when applicable (e.g., `task-123`, `issue-456`)
- Subject must not end with a period
- Header must not exceed 72 characters
- Body lines must not exceed 100 characters
- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")

**Note**: Invalid commit messages will be rejected by the commit-msg hook.

## API Endpoints

- `GET /` - Welcome message
- `GET /api` - API welcome message

## Environment Variables

- `PORT` - Server port (default: 8088)

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/amazing-feature`
3. Make your changes
4. Ensure all linting passes: `npm run lint:check`
5. Ensure code is formatted: `npm run format:check`
6. 6. Commit your changes using conventional commits: `git commit -m "feat(#1234): add amazing feature"`
7. Push to the branch: `git push origin feat/amazing-feature`
8. Create a Pull Request

### Commit Guidelines

- Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification
- Use the present tense ("add feature" not "added feature")
- Use the imperative mood ("move cursor to..." not "moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### Automated Checks

The following checks run automatically on every commit:

1. **Pre-commit hooks**: Code linting and formatting
2. **Commit-msg hook**: Commit message format validation
3. **Code quality**: ESLint with security and best practice rules

All checks must pass before code can be committed or merged.
