import { MachineConfig } from 'xstate'
import { IWorkerContext, IWorkerSchema, IWorkerEvents} from './interfaces'

const config: MachineConfig<IWorkerContext, IWorkerSchema, IWorkerEvents> = {
    id: 'worker',
    initial: 'start',
    states: {
        start: {
            invoke: [
                {
                    id: 'grpc-client',
                    src: 'initGrpcClient'
                }
            ],
            on: {
                RECEIVED_DATA: {
                    actions: ['logReceivedData']
                }
            }
        }
    }
}

export default config