import {
  CronCapability,
  HTTPCapability,
  HTTPClient,
  EVMClient,
  ConsensusAggregationByFields,
  identical,
  handler,
  Runner,
  prepareReportRequest,
  bytesToHex,
  ok,
  text,
  type Runtime,
  type HTTPSendRequester,
  type HTTPPayload,
} from "@chainlink/cre-sdk"
import { encodeAbiParameters, parseAbiParameters } from "viem"
import { z } from "zod"

// ─── Config ──────────────────────────────────────────────────────────────────

const configSchema = z.object({
  schedule: z.string(),
  // Base URL of the Distro API (serves the daily on-chain payout batch).
  apiBaseUrl: z.string(),
  // Numeric CRE chain selector (Arc testnet = 3034092155422581607).
  chainSelector: z.string(),
  gasLimit: z.string(),
})

type Config = z.infer<typeof configSchema>

// ─── Distro API batch response ────────────────────────────────────────────────

const batchSchema = z.object({
  dateKey: z.string(),
  chainId: z.number(),
  generatedAt: z.string(),
  jobs: z.array(
    z.object({
      jobId: z.number(),
      reporterAddress: z.string(), // EscrowViewsReporter (the job operator)
      recipients: z.array(
        z.object({
          wallet: z.string(),
          cumulativeViews: z.number(),
        }),
      ),
    }),
  ),
})

// ─── Settlement ──────────────────────────────────────────────────────────────

// Shared by the daily cron and the on-demand HTTP trigger: pull the batch from
// the Distro API and record each job's cumulative views on-chain.
const settle = (runtime: Runtime<Config>): string => {
  const cfg = runtime.config
  const httpClient = new HTTPClient()
  const evmClient = new EVMClient(BigInt(cfg.chainSelector))

  // API key resolves in DON mode; captured into the node-mode fetch closure.
  const apiKey = runtime.getSecret({ id: "DISTRO_API_KEY" }).result().value
  if (!apiKey) throw new Error("DISTRO_API_KEY secret is empty")

  const url = `${cfg.apiBaseUrl}/cre/batch`

  // Every DON node fetches the same persisted daily snapshot, so we require the
  // raw response body to be identical across nodes before acting on it.
  const fetchBatch = (req: HTTPSendRequester): { body: string } => {
    const response = req
      .sendRequest({ url, method: "GET", headers: { "x-cre-api-key": apiKey } })
      .result()
    if (!ok(response)) {
      throw new Error(`Distro API HTTP ${response.statusCode}`)
    }
    return { body: text(response) }
  }

  const consensus = ConsensusAggregationByFields<{ body: string }>({ body: identical })
  const { body } = httpClient.sendRequest(runtime, fetchBatch, consensus)().result()

  const batch = batchSchema.parse(JSON.parse(body))
  runtime.log(`Batch ${batch.dateKey}: ${batch.jobs.length} job(s)`)

  let recorded = 0
  for (const job of batch.jobs) {
    if (job.recipients.length === 0) {
      runtime.log(`Job ${job.jobId}: no recipients, skipping`)
      continue
    }

    const recipients = job.recipients.map((r) => r.wallet as `0x${string}`)
    const views = job.recipients.map((r) => BigInt(Math.trunc(r.cumulativeViews)))

    const encoded = encodeAbiParameters(parseAbiParameters("uint256, address[], uint256[]"), [
      BigInt(job.jobId),
      recipients,
      views,
    ])
    const signedReport = runtime.report(prepareReportRequest(encoded)).result()

    const writeResult = evmClient
      .writeReport(runtime, {
        receiver: job.reporterAddress,
        report: signedReport,
        gasConfig: { gasLimit: cfg.gasLimit },
      })
      .result()

    const txHash = writeResult.txHash ? bytesToHex(writeResult.txHash) : "(none)"
    runtime.log(
      `Job ${job.jobId}: ${recipients.length} recipient(s) -> tx ${txHash} status=${writeResult.txStatus}`,
    )
    recorded++
  }

  return `recorded ${recorded}/${batch.jobs.length} job(s) for ${batch.dateKey}`
}

// ─── Handlers ──────────────────────────────────────────────────────────────────

const onCronTrigger = (runtime: Runtime<Config>): string => settle(runtime)

// On-demand trigger (e.g. for a live demo): POST to the DON's trigger URL runs
// the same settlement immediately, in addition to the daily cron.
const onHttpTrigger = (runtime: Runtime<Config>, _payload: HTTPPayload): string => settle(runtime)

const initWorkflow = (config: Config) => {
  const cron = new CronCapability()
  const http = new HTTPCapability()
  return [
    handler(cron.trigger({ schedule: config.schedule }), onCronTrigger),
    // Empty authorizedKeys accepts any caller — fine for testnet/demo. For a
    // hardened deployment, list the authorized sender public keys here.
    handler(http.trigger({ authorizedKeys: [] }), onHttpTrigger),
  ]
}

export async function main() {
  const runner = await Runner.newRunner<Config>({
    configParser: (bytes) => configSchema.parse(JSON.parse(new TextDecoder().decode(bytes))),
  })
  await runner.run(initWorkflow)
}

await main()
