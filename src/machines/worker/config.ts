import { MachineConfig } from 'xstate'
import { IWorkerContext, IWorkerSchema, IWorkerEvents} from './interfaces'

const context: IWorkerContext = {
    client_id: undefined
}

const config: MachineConfig<IWorkerContext, IWorkerSchema, IWorkerEvents> = {
    id: 'worker',
    initial: 'start',
    context,
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
                    actions: [
                        // 'logReceivedData',
                        'sendReceivedEvent'
                    ]
                },
                CONNECTED: {
                    actions: [
                        'assignClientId',
                        'sendReady'
                    ]
                },
                TASK: {
                    actions: [
                        'taskReceived',
                        'sendReadyDelay'
                    ]
                }
            }
        }
    }
}

export default config