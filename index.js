const core = require('@actions/core')
const github = require('@actions/github')
const { request } = require('@octokit/request')

async function main() {
  try {
    const prefix = core.getInput('prefix')
    const ticketRegex = core.getInput('ticket-regex')
    const ticketUrlTemplate = core.getInput('ticket-url-template')
    const testUrlTemplate = core.getInput('test-url-template')
    const titleTemplate = core.getInput('title-template')
    const bodyTemplate = core.getInput('body-template')
    const baseBranch = core.getInput('base-branch')
    const token = core.getInput('token')
    const draft = core.getInput('draft')

    const ref = github.context.payload.ref
    const branch = ref.substring(ref.lastIndexOf('/') + 1)

    if (!branch.startsWith(prefix)) {
      core.info(`Branch does not start with prefix ${prefix}.`)
      return
    }

    const match = branch.match(new RegExp(ticketRegex))

    if (!match) {
      core.warn(`Could not determine ticket number from branch name ${branch}.`)
    }

    const ticketNum = match[1]

    core.info(`Found ticket number ${ticketNum}.`)

    const ticketUrl = ticketUrlTemplate.replace('{branch}', branch).replace('{ticketNum}', ticketNum)
    const testUrl = testUrlTemplate.replace('{branch}', branch).replace('{ticketNum}', ticketNum)

    const title = (
      titleTemplate
      .replace('{branch}', branch)
      .replace('{ticketNum}', ticketNum)
      .replace('{ticketUrl}', ticketUrl)
      .replace('{testUrl}', testUrl))

    const body = (
      bodyTemplate
      .replace('{branch}', branch)
      .replace('{ticketNum}', ticketNum)
      .replace('{ticketUrl}', ticketUrl)
      .replace('{testUrl}', testUrl))

    core.info(JSON.stringify({
      titleTemplate,
      bodyTemplate,
      title,
      body,
    }, null))

    const {
      data: { html_url }
    } = await request(`POST /repos/${process.env.GITHUB_REPOSITORY}/pulls`, {
      headers: {
        authorization: `token ${token}`
      },
      title,
      body,
      head: branch,
      base: baseBranch
      draft,
    })

    core.info(`Pull request created: ${html_url}`);

  } catch (error) {
    core.setFailed(error.message)
  }
}

main()
