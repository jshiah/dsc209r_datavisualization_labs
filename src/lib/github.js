// src/lib/github.js
export async function fetchGitHubData(username) {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) {
        throw new Error('Failed to fetch data from GitHub API');
    }
    return await response.json();
}