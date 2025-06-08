# Zed Extensions GitHub Action

This action for automatically bump Zed Extensions version after a release.

## Usage

Create a `release.yml` file in `.github/workflows` directory with the following content:

```yml
on:
  push:
    tags:
      - 'v*'

jobs:
  homebrew:
    name: Release Zed Extension
    runs-on: ubuntu-latest
    steps:
      - uses: huacnlee/zed-extension-action@v1
        with:
          extension-name: your-extension-name
          # extension-path: extensions/${{ extension-name }}
          push-to: your-name/extensions
        env:
          # the personal access token should have "repo" & "workflow" scopes
          COMMITTER_TOKEN: ${{ secrets.COMMITTER_TOKEN }}
```

## Inputs

| Name             | Description                                                  | Required | Default                          |
| ---------------- | ------------------------------------------------------------ | -------- | -------------------------------- |
| `extension-name` | The name of your Zed extension.                              | `true`   | -                                |
| `extension-path` | If you have a different path, you can set it.                | `false`  | `extensions/${ extension-name }` |
| `push-to`        | The forked repository of the zed-industries/extensions repo. | `true`   | -                                |
| `ref`            | Git reference (tag, branch, commit SHA, or full ref) to use for the extension update | `false` | Currently pushed ref |
| `tag-name`       | The git tag name to bump the formula to                     | `false`  | Extracted from ref or current tag |

### Git Reference Support

The `ref` parameter allows you to specify any valid git reference:

- **Tag names**: `v1.0.0` or `refs/tags/v1.0.0`
- **Branch names**: `main` or `refs/heads/main`
- **Commit SHAs**: `abc123...` (7-40 characters)
- **Full refs**: `refs/heads/feature-branch`

When using a non-tag reference (branch or commit), you must also provide the `tag-name` parameter to specify the version number.

### Examples

**Using a specific tag:**
```yaml
- uses: huacnlee/zed-extension-action@v1
  with:
    extension-name: your-extension-name
    ref: v1.2.3
    push-to: your-name/extensions
```

**Using a branch with explicit tag name:**
```yaml
- uses: huacnlee/zed-extension-action@v1
  with:
    extension-name: your-extension-name
    ref: main
    tag-name: v1.2.3
    push-to: your-name/extensions
```

**Using a commit SHA:**
```yaml
- uses: huacnlee/zed-extension-action@v1
  with:
    extension-name: your-extension-name
    ref: abc1234567890abcdef1234567890abcdef123456
    tag-name: v1.2.3
    push-to: your-name/extensions
```

The `COMMITTER_TOKEN` is a personal access token with `repo` and `workflow` scopes. You can create one in your [GitHub settings](https://github.com/settings/tokens).

## How it works

When a new tag is pushed, the action will:

1. Check if the tag is a valid version number.
2. Create a Pull Request with the new version to [Zed Extensions](https://github.com/zed-industries/extensions/pulls) repository.
3. Merge the Pull Request if it's approved, then the extension version will released.

See example: https://github.com/zed-industries/extensions/pull/217

## License

MIT
