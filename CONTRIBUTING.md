# Contributing to Dax

Thank you for considering contributing to Dax! This document outlines the process for contributing to the project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the [Issues](https://github.com/yourusername/dax/issues)
- Use the bug report template when creating a new issue
- Include detailed steps to reproduce the bug
- Include screenshots if applicable
- Specify your operating system and browser

### Suggesting Features

- Check if the feature has already been suggested in the [Issues](https://github.com/yourusername/dax/issues)
- Use the feature request template
- Describe the feature in detail and why it would be valuable
- Consider how the feature fits with the existing product

### Code Contributions

1. Fork the repository
2. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Run tests to ensure your changes don't break anything:
   ```bash
   npm run test
   ```
5. Commit your changes using [conventional commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m "feat: add new feature"
   ```
6. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Create a pull request to the `main` branch of the original repository

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dax.git
   cd dax
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Coding Guidelines

- Follow the ESLint and Prettier configuration of the project
- Write tests for new features
- Update documentation when necessary
- Keep components small and focused
- Use TypeScript types for all components and functions

## Pull Request Process

1. Update the README.md or documentation with details of changes if appropriate
2. Update the CHANGELOG.md with details of changes
3. The PR should work on the latest version of Node.js
4. The PR will be merged once it has been reviewed and approved by a maintainer

## Creating a New Component

When creating a new component:

1. Place it in the appropriate directory under `/components`
2. Follow the naming convention of the project
3. Include TypeScript typings
4. Write tests for the component
5. Document the component's props and usage

Thank you for contributing to Dax! 