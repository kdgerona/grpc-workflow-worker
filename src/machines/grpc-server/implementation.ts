import { MachineOptions, actions, assign, send, spawn, sendParent } from 'xstate'
import { loadPackageDefinition, Server, ServerCredentials, ServerDuplexStream } from 'grpc'
import { loadSync } from '@grpc/proto-loader'
import { IGrpcServerContext, IMessageEvent } from './interfaces'

const { log } = actions

const implementation: MachineOptions<IGrpcServerContext, any> = {
    actions: {
        logInitializingServer: log('*** GRPC Server Initializing ***'),
        logServerInitialized: log('*** GRPC Server Initialized ***'),
        logInitializationError: log((_, event) => event.data),
        retryingLog: log((context) => `*** Retrying GRPC Server ${context.retry_count}/${context.max_retry_count} ***`),
        logServerRunning: log('*** GRPC Server Running ***'),
        assignGrpcServerInstance: assign({
            grpc_server: (_, { data }) => data
        }),
        // spawnClientStream: assign({
        //     clients: (context, event) => {
        //         const {client_id, stream} = event.payload
                
        //         return {
        //             ...context.clients,
        //             [client_id]: spawn(clientStream.withContext({
        //                 client_id,
        //                 stream
        //             }), client_id)
        //         }
        //     }
        // }),
        logNewClientConnected: log((_,event) => `GRPC Client Connected: ${event.payload.client_id}`),
        // sendToClient: send((_, { payload }) => ({
        //     type: 'SEND_EVENT_TO_CLIENT',
        //     payload
        // }), { to: (_, { payload }) => payload.client_id}),
        // logClientDisconnected: log((_, event) => `GRPC Client Disconnected: ${event.payload.client_id}`),
        removeDisconnectedClient: assign({
            clients: (context, event) => {
                const { client_id } = event.payload
                const { [client_id]: client_stream, ...new_clients } = context.clients

                return {
                    ...new_clients
                }
            }
        }),
        // logStreamError: log((_, event) => `Stream Error: ${JSON.stringify(event.payload.error, null, 4)}`),
        incrementRetryCount: assign({
            retry_count: (context) => context.retry_count + 1
        }),
        resetRetryCount: assign<IGrpcServerContext>({
            retry_count: 0
        }),
        logServerStartError: log(`*** GRPC Server Start Error ***`),
        sendParentClientStream: sendParent((_, event) => event),
        sendParentToClient: sendParent((_, event) => event),
    },
    services: {
        initializeServer: (context) => async () => {
            const { host, port } = context

            const server = new Server()
            const server_binding = server.bind(`${host}:${port}`, ServerCredentials.createInsecure())

            if(server_binding <= 0 ){
                throw new Error(`Error binding on ${host}:${port}`)
            }

            return server
        },
        startServerService: (context) => (send) => {
            const { proto_path, grpc_server } = context

            // Connection Handler
            const sendMessage = ({ request }: any, callback: any) => {
                console.log('IM HERE@@#####', request)

                // send({
                //     type: 'SEND_TO_CLIENT',
                //     payload: {
                //         type: 'CONNECTED',
                //         client_id
                //     }
                // })
            }

            const package_definition = loadSync(
                proto_path,
                {
                    keepCase: true,
                    longs: String,
                    enums: String,
                    defaults: true,
                    oneofs: true
                }
            )

            const message_proto: any = loadPackageDefinition(package_definition).message

            grpc_server!.addService(message_proto['Message']['service'], {
                sendMessage: sendMessage
            })

            grpc_server!.start()

            return () => grpc_server!.forceShutdown()
        }
    },
    guards: {
        hasReachedMaxServerRetry: ({ retry_count, max_retry_count }) => retry_count >= max_retry_count,
    },
    activities: {},
    delays: {}
}

export default implementation