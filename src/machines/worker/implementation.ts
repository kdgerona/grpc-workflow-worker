import { MachineOptions, actions } from 'xstate'
import GrpcClient from '../grpc-client'
import { IWorkerContext } from './interfaces'
const { log } = actions

const implementation: MachineOptions<IWorkerContext, any> = {
    actions: {
        logReceivedData: log((_:any, event: any) => `Received: ${JSON.stringify(event, null, 4)}`)
    },
    services: {
        initGrpcClient: GrpcClient
    },
    guards: {},
    activities: {},
    delays: {}
}

export default implementation