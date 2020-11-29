import { MachineOptions, actions, assign, sendParent } from 'xstate'
import { loadPackageDefinition, credentials } from 'grpc'
import { loadSync } from '@grpc/proto-loader'
import { rejects } from 'assert'
import { type } from 'os'
const { log } = actions

const implementation: MachineOptions<any, any> = {
    actions: {
        logInitializingClient: log('*** GRPC Client Initializing ***'),
        logClientInitialized: log('*** GRPC Client Initialized ***'),
        logClientInitializationError: log((_: any, event: any) => event.data),
        assignGrpcClientInstance: assign({
            grpc_client: (_: any, { data }: any) => data
        }),
        incrementRetryCount: assign({
            retry_count: (context: any) => context.retry_count + 1
        }),
        resetRetryCount: assign({
            retry_count: 0
        }),
        logClientStartError: log(`*** GRPC Client Start Error ***`),
        retryingLog: log((context: any) => `*** Retrying GRPC Client ${context.retry_count}/${context.max_retry_count} ***`),
        sendToParent: sendParent((_:any, { payload }: any) => ({
            type: 'RECEIVED_DATA',
            payload
        })),
        logClientStreamError: log((_:any, { error }: any) => error),
        logStreamEnded: log('*** STREAM ENDED ***')
    },
    services: {
        initializeClient: (context: any) => async () => {
            const { host, port, proto_path, client_wait_time_ms } = context

            const packageDefinition = loadSync(
                proto_path,
                {
                    keepCase: true,
                    longs: String,
                    enums: String,
                    defaults: true,
                    oneofs: true
                }
            )

            const connection_proto: any = loadPackageDefinition(packageDefinition).connection

            const client = await new connection_proto.Connection(
                `${host}:${port}`,
                credentials.createInsecure()
            )

            const stream = await new Promise((resolve,reject) => {
                client.waitForReady(new Date().getTime() + client_wait_time_ms, (error: any) => {
                    if(!error) {
                        const stream = client.connectToServer()
                        resolve(stream)
                    }

                    reject(error)
                })
            })

            return stream
        },
        startClientService: ({ grpc_client }: any) => (send) => {
            grpc_client.on('data', (payload: any) => {
                console.log('Data: ', payload)
                send({
                    type: 'SEND_DATA_TO_PARENT',
                    payload
                })
            })

            grpc_client.on('error', (error: any) => {
                console.log('Error: ', error)
                send({
                    type: 'CLIENT_STREAM_ERROR',
                    error
                })
            })

            grpc_client.on('end', () => {
                send('STREAM_ENDED')
            })
        }
    },
    guards: {
        hasReachedMaxClientRetry: ({ retry_count, max_retry_count }: any) => retry_count >= max_retry_count,
    },
    activities: {},
    delays: {}
}

export default implementation