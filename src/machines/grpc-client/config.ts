import { MachineConfig } from 'xstate'
import { IGrpcClientContext, IGrpcClientSchema, IGrpcClientEvents} from './interfaces'

const context: IGrpcClientContext = {
    // host: process.env.HOST || 'localhost',
    host: process.env.HOST || '10.111.2.100',
    port: +(process.env.PORT || 50051),
    proto_path: process.env.PROTO_PATH || `${__dirname}/protos/connection.proto`,
    max_retry_count: +(process.env.RETRY_COUNT || 5),
    retry_count: 0,
    grpc_client: undefined,
    client_wait_time_ms: +(process.env.CLIENT_WAIT_TIME_MS || 5000),
}

const config: MachineConfig<IGrpcClientContext, IGrpcClientSchema, IGrpcClientEvents> = {
    id: 'grpc-client',
    initial: 'initialize',
    context,
    states: {
        initialize: {
            entry: 'logInitializingClient',
            invoke: [
                {
                    id: 'initialize-client',
                    src: 'initializeClient',
                    onDone: {
                        target: 'listening',
                        actions: [
                            'logClientInitialized',
                            'assignGrpcClientInstance',
                            'resetRetryCount'
                        ]
                    },
                    onError: {
                         target: 'retry',
                         actions: ['logClientInitializationError']
                    }
                }
            ]
        },
        listening: {
            invoke: [
                {
                    id: 'start-client-service',
                    src: 'startClientService'
                }
            ],
            on: {
                SEND_MESSAGE_TO_PARENT: {
                    actions: ['sendToParent']
                },
                CLIENT_STREAM_ERROR: {
                    target: 'retry',
                    actions: ['logClientStreamError']
                },
                STREAM_ENDED: {
                    actions: ['logStreamEnded']
                },
                STREAM_TO_SERVER: {
                    actions: ['streamToServer']
                }
            }
        },
        retry: {
            after: {
                3000: [
                    {
                        target: 'error',
                        cond: 'hasReachedMaxClientRetry'
                    },
                    {
                        target: 'initialize',
                        actions: ['incrementRetryCount']
                    }
                ]
            },
            exit: 'retryingLog',
        },
        error: {
            entry: 'logClientStartError',
            type: 'final'
        }
    }
}

export default config