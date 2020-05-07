const core = require('@actions/core')
const github = require('@actions/github')

try {
  const prefix = core.getInput('prefix')
  const ticketRegex = core.getInput('ticket-regex')
  const ticketUrlTemplate = core.getInput('ticket-base-url')
  const testUrlTemplate = core.getInput('test-base-url')

  const ref = github.context.payload.ref
  const branch = ref.substring(ref.lastIndexOf('/') + 1)

  if (!branch.startsWith(prefix)) {
    console.log(`Branch does not start with prefix ${prefix}.`)
    return
  }

  const match = branch.match(new RegExp(ticketRegex))

  if (!match) {
    console.warn(`Could not determine ticket number from branch name ${branch}.`)
  }

  const ticketNum = match[1]

  console.log(`Found ticket number ${ticketNum}.`)

  const ticketUrl = ticketUrlTemplate.replace('{branch}', branch).replace('{ticketNum}', ticketNum)
  const testUrl = testUrlTemplate.replace('{branch}', branch).replace('{ticketNum}', ticketNum)

  console.log({
    ticketUrl,
    testurl,
  })

} catch (error) {
  core.setFailed(error.message)
}
