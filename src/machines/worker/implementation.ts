import { actions } from 'xstate'
import GrpcClient from '../grpc-client'
const { log } = actions

const implementation = {
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