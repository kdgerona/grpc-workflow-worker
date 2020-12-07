import { MachineConfig  } from 'xstate'
import { IGrpcServerContext, IGrpcServerSchema, IGrpcServerEvents} from './interfaces'

const context: IGrpcServerContext = {
    host: process.env.GRPC_SERVER_HOST || 'localhost',
    port: +(process.env.GRPC_SERVER_PORT || 60051),
    proto_path: process.env.GRPC_SERVER_PROTO_PATH || `${__dirname}/protos/message.proto`,
    max_retry_count: +(process.env.GRPC_SERVER_RETRY_COUNT || 5),
    retry_count: 0,
    grpc_server: undefined,
    clients: {}
}

const config: MachineConfig<IGrpcServerContext,IGrpcServerSchema,IGrpcServerEvents> = {
    id: 'grpc-server',
    initial: 'initialize',
    context,
    states: {
        idle: {
            on: {
                START_GRPC_SERVER: 'initialize'
            }
        },
        initialize: {
            entry: 'logInitializingServer',
            invoke: [
                {
                    id: 'initialize-server',
                    src: 'initializeServer',
                    onDone: {
                        actions: [
                            'logServerInitialized',
                            'assignGrpcServerInstance',
                            'resetRetryCount'
                        ],
                        target: 'running'
                    },
                    onError: {
                        actions: ['logInitializationError'],
                        target: 'retry'
                    }
                }
            ]
        },
        running: {
            entry: 'logServerRunning',
            invoke: {
                id: 'start-server-service',
                src: 'startServerService'
            },
            on: {
                NEW_CONNECTION: {
                    actions: [
                        'logNewClientConnected',
                        'sendParentClientStream'
                    ]
                },
                SEND_TO_CLIENT: {
                    actions: ['sendParentToClient']
                },
                // CONNECTION_CLOSED: {
                //     actions: [
                //         'logClientDisconnected',
                //         'removeDisconnectedClient'
                //     ]
                // },
                // STREAM_ERROR: {
                //     actions: [
                //         'logStreamError'
                //     ]
                // }
            }
        },
        retry: {
            after: {
                3000: [
                    {
                        target: 'error',
                        cond: 'hasReachedMaxServerRetry'
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
            entry: 'logServerStartError',
            type: 'final'
        }
    }
}

export default config