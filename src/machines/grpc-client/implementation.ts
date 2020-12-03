import { MachineOptions, actions, assign, sendParent, send } from 'xstate'
import { loadPackageDefinition, credentials } from 'grpc'
import { loadSync } from '@grpc/proto-loader'
import { IGrpcClientContext } from './interfaces'
const { log } = actions

const implementation: MachineOptions<IGrpcClientContext, any> = {
    actions: {
        logInitializingClient: log('*** GRPC Client Initializing ***'),
        logClientInitialized: log('*** GRPC Client Initialized ***'),
        logClientInitializationError: log((_, event: any) => event.data),
        assignGrpcClientInstance: assign({
            grpc_client: (_, { data }: any) => data
        }),
        incrementRetryCount: assign({
            retry_count: (context) => context.retry_count + 1
        }),
        resetRetryCount: assign<IGrpcClientContext>({
            retry_count: 0
        }),
        logClientStartError: log(`*** GRPC Client Start Error ***`),
        retryingLog: log((context) => `*** Retrying GRPC Client ${context.retry_count}/${context.max_retry_count} ***`),
        sendToParent: sendParent((_, { payload }: any) => ({
            ...payload
        })),
        logClientStreamError: log((_, { error }: any) => error),
        logStreamEnded: log('*** STREAM ENDED ***'),
        eventLogs:  log((_:any, event: any) => `${event.type} event logs: ${JSON.stringify(event, null, 4)}`),
        streamToServer: ({ grpc_client }, { payload }) => grpc_client?.write(payload)
    },
    services: {
        initializeClient: (context) => async () => {
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
        startClientService: ({ grpc_client }) => (send) => {
            grpc_client!.on('data', (payload: any) => {
                console.log('Data: ', payload)
                const parse_payload = {
                    ...payload,
                    payload: payload.payload ? JSON.parse(payload.payload) : ''
                }
                send({
                    type: 'SEND_MESSAGE_TO_PARENT',
                    payload: parse_payload
                })
            })

            grpc_client!.on('error', (error: any) => {
                console.log('Error: ', error)
                send({
                    type: 'CLIENT_STREAM_ERROR',
                    error
                })
            })

            grpc_client!.on('end', () => {
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