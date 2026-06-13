import {
  CronCapability,
  HTTPClient,
  EVMClient,
  ConsensusAggregationByFields,
  median,
  handler,
  Runner,
  prepareReportRequest,
  bytesToHex,
  ok,
  json,
  type Runtime,
  type HTTPSendRequester,
} from "@chainlink/cre-sdk"
import { encodeAbiParameters, parseAbiParameters } from "viem"
import { z } from "zod"

// ─── Config ──────────────────────────────────────────────────────────────────

const videoSchema = z.object({
  videoId: z.string(),
  recipient: z.string(), // 0x-prefixed clipper wallet
})

const configSchema = z.object({
  schedule: z.string(),
  youtubeApiBaseUrl: z.string(),
  // Numeric CRE chain selector (Arc testnet = 3034092155422581607).
  chainSelector: z.string(),
  // EscrowViewsReporter adapter — set as the job operator on DistroEscrow.
  reporterAddress: z.string(),
  jobId: z.string(), // uint256 as string
  gasLimit: z.string(),
  videos: z.array(videoSchema).min(1),
})

type Config = z.infer<typeof configSchema>

// ─── YouTube API response ─────────────────────────────────────────────────────

const youtubeResponseSchema = z.object({
  items: z.array(z.object({ statistics: z.object({ viewCount: z.string() }) })).min(1),
})

// ─── Handler ───────────────────────────────────────────────────────────────────

const onCronTrigger = (runtime: Runtime<Config>): string => {
  const cfg = runtime.config
  const httpClient = new HTTPClient()
  const evmClient = new EVMClient(BigInt(cfg.chainSelector))

  // Secrets resolve in DON mode; the value is captured into the node-mode
  // closure below (getSecret itself is not callable inside node mode).
  const apiKey = runtime.getSecret({ id: "YOUTUBE_API_KEY" }).result().value
  if (!apiKey) throw new Error("YOUTUBE_API_KEY secret is empty")

  const recipients: `0x${string}`[] = []
  const cumulativeViews: bigint[] = []

  for (const video of cfg.videos) {
    const url = `${cfg.youtubeApiBaseUrl}?part=statistics&id=${video.videoId}&key=${apiKey}`

    // Runs on each DON node; nodes median the view count so a minority seeing a
    // stale/different value cannot skew the recorded total.
    const fetchViews = (sendRequester: HTTPSendRequester): { views: number } => {
      const response = sendRequester.sendRequest({ url, method: "GET" }).result()
      if (!ok(response)) {
        throw new Error(`YouTube HTTP ${response.statusCode} for video ${video.videoId}`)
      }
      const data = youtubeResponseSchema.parse(json(response))
      return { views: Number(data.items[0].statistics.viewCount) }
    }

    const consensus = ConsensusAggregationByFields<{ views: number }>({ views: median })
    const { views } = httpClient.sendRequest(runtime, fetchViews, consensus)().result()

    recipients.push(video.recipient as `0x${string}`)
    cumulativeViews.push(BigInt(Math.trunc(views)))
    runtime.log(`Video ${video.videoId} -> ${video.recipient}: ${views} views`)
  }

  // Encode exactly what EscrowViewsReporter.onReport decodes.
  const encodedPayload = encodeAbiParameters(parseAbiParameters("uint256, address[], uint256[]"), [
    BigInt(cfg.jobId),
    recipients,
    cumulativeViews,
  ])

  const signedReport = runtime.report(prepareReportRequest(encodedPayload)).result()

  // The SDK converts `receiver` (hex) → bytes and `gasConfig` (JSON) internally.
  const writeResult = evmClient
    .writeReport(runtime, {
      receiver: cfg.reporterAddress,
      report: signedReport,
      gasConfig: { gasLimit: cfg.gasLimit },
    })
    .result()

  const txHash = writeResult.txHash ? bytesToHex(writeResult.txHash) : "(none)"
  runtime.log(`Recorded views for job ${cfg.jobId} — tx ${txHash} status=${writeResult.txStatus}`)
  return txHash
}

const initWorkflow = (config: Config) => {
  const cron = new CronCapability()
  return [handler(cron.trigger({ schedule: config.schedule }), onCronTrigger)]
}

export async function main() {
  const runner = await Runner.newRunner<Config>({
    configParser: (bytes) => configSchema.parse(JSON.parse(new TextDecoder().decode(bytes))),
  })
  await runner.run(initWorkflow)
}

await main()
