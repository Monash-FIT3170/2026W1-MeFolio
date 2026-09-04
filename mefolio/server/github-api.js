import { Meteor } from "meteor/meteor";

const GITHUB_API_BASE = "https://api.github.com";
const REQUEST_TIMEOUT_MS = 5000;

// Validates and extracts owner and repository from GitHub link
function parseRepositoryUrl(githubLink) {
  let url;

  try {
    url = new URL(githubLink);
  } catch {
    throw new Meteor.Error("invalid-github-link", "Invalid GitHub URL.");
  }

  if (
    url.protocol !== "https:" ||
    !["github.com", "www.github.com"].includes(url.hostname)
  ) {
    throw new Meteor.Error(
      "invalid-github-link",
      "The link must point to github.com.",
    );
  }

  const parts = url.pathname
    .split("/")
    .filter(Boolean)
    .map((part) => decodeURIComponent(part));

  if (parts.length !== 2) {
    throw new Meteor.Error(
      "invalid-github-link",
      "The link must point to a GitHub repository.",
    );
  }

  const [owner, repository] = parts;
  const repo = repository.endsWith(".git")
    ? repository.slice(0, -4)
    : repository;

  if (!owner || !repo) {
    throw new Meteor.Error("invalid-github-link", "Invalid repository link.");
  }

  return { owner, repo };
}

// Calls GitHub REST API to fetch repo stats
export async function fetchGitHubRepoStats(githubLink) {
  const { owner, repo } = parseRepositoryUrl(githubLink);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "MeFolio",
    };

    const token = Meteor.settings?.private?.github?.apiToken;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const repositoryUrl = `${GITHUB_API_BASE}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    const commitsUrl = `${repositoryUrl}/commits?per_page=1`;
    const requestOptions = { headers, signal: controller.signal };
    const [response, commitsResponse] = await Promise.all([
      fetch(repositoryUrl, requestOptions),
      fetch(commitsUrl, requestOptions),
    ]);

    if (response.status === 404) {
      throw new Meteor.Error(
        "github-repository-not-found",
        "Repository not found.",
      );
    }

    if (response.status === 403 || response.status === 429) {
      throw new Meteor.Error(
        "github-rate-limit",
        "GitHub API rate limit exceeded.",
      );
    }

    if (!response.ok) {
      throw new Meteor.Error(
        "github-request-failed",
        "GitHub could not return repository data.",
      );
    }

    if (!commitsResponse.ok) {
      throw new Meteor.Error(
        "github-request-failed",
        "GitHub could not return commit data.",
      );
    }

    const repository = await response.json();
    const commits = await commitsResponse.json();
    const commitsLink = commitsResponse.headers.get("link") || "";
    const lastPageMatch = commitsLink.match(/[?&]page=(\d+)>; rel="last"/);
    const commitCount = lastPageMatch
      ? Number(lastPageMatch[1])
      : commits.length;

    return {
      name: repository.name,
      fullName: repository.full_name,
      description: repository.description,
      stars: repository.stargazers_count,
      commits: commitCount,
      forks: repository.forks_count,
      openIssues: repository.open_issues_count,
      language: repository.language,
      updatedAt: repository.updated_at,
      htmlUrl: repository.html_url,
    };
  } catch (error) {
    if (error instanceof Meteor.Error) {
      throw error;
    }

    if (error.name === "AbortError") {
      throw new Meteor.Error(
        "github-timeout",
        "GitHub did not respond in time.",
      );
    }

    throw new Meteor.Error(
      "github-request-failed",
      "Unable to fetch GitHub repository data.",
    );
  } finally {
    clearTimeout(timeout);
  }
}
