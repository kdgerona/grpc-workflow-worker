import { MachineOptions, actions, send, assign } from 'xstate'
import GrpcClient from '../grpc-client'
import { IWorkerContext } from './interfaces'
const { log } = actions

const implementation: MachineOptions<IWorkerContext, any> = {
    actions: {
        logReceivedData: log((_:any, event: any) => `Received: ${JSON.stringify(event, null, 4)}`),
        sendReceivedEvent: send((_, event) => event.payload),
        assignClientId: assign((_, { client_id }) => ({ client_id })),
        taskReceived: log('I received a task')
    },
    services: {
        initGrpcClient: GrpcClient
    },
    guards: {},
    activities: {},
    delays: {}
}

export default implementation