import { MachineOptions, actions, send, assign } from 'xstate'
import GrpcClient from '../grpc-client'
import { IWorkerContext } from './interfaces'
const { log } = actions

const implementation: MachineOptions<IWorkerContext, any> = {
    actions: {
        logReceivedData: log((_:any, event: any) => `Received: ${JSON.stringify(event, null, 4)}`),
        sendReceivedEvent: send((_, event) => event.payload),
        assignClientId: assign((_, { client_id }) => ({ client_id })),
        sendReady: send(({client_id}) => ({
            type: 'STREAM_TO_SERVER',
            payload: {
                type: 'READY',
                client_id
            }
        }), { to: 'grpc-client' }),
        // taskReceived: log((_: any, event: any) => `I received a task!!!!!!!!!!!!! ${JSON.stringify(event)}`),
        taskReceived: (_: any, { payload }: any) => console.log(`I received a task!!!!!!!!!!!!!`, payload),
        sendReadyDelay: send(({client_id}) => ({
            type: 'STREAM_TO_SERVER',
            payload: {
                type: 'READY',
                client_id
            }
        }), { to: 'grpc-client', delay: 3000 }),
        sendDoneDelay: send(({client_id}) => ({
            type: 'STREAM_TO_SERVER',
            payload: {
                type: 'TASK_DONE',
                client_id
            }
        }), { to: 'grpc-client', delay: 3000 }),
    },
    services: {
        initGrpcClient: GrpcClient
    },
    guards: {},
    activities: {},
    delays: {}
}

export default implementation