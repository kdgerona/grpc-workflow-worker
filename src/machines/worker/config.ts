import { MachineConfig } from 'xstate'
import { IWorkerContext, IWorkerSchema, IWorkerEvents} from './interfaces'

const context: IWorkerContext = {
    client_id: undefined,
    is_acknowledged: false,
    spawn_id: '',
    total_jobs_limit: 2,
    total_jobs_taken: 0
}

const config: MachineConfig<IWorkerContext, IWorkerSchema, IWorkerEvents> = {
    id: 'worker',
    initial: 'start',
    context,
    states: {
        start: {
            // entry: "assignAllExistingWorker",
            invoke: [
                {
                    id: 'grpc-client',
                    src: 'initGrpcClient'
                }
            ],
            on: {
                // RECEIVED_DATA: {
                //     actions: [
                //         // 'eventLogs',
                //         'sendReceivedEvent'
                //     ]
                // },
                CONNECTED: {
                    actions: [
                        'assignClientId',
                        'eventLogs',
                        // 'notifyWorkflowWorkerReady'
                    ]
                },
                TASK: {
                    actions: [
                        'eventLogs',
                        'initSpawnRef',
                        'acknowledgeTask',
                        'workInProgress',
                        'sendDataToSpawnWorker'
                    ]
                },
                WORKING_IN_PROGRESS: {
                    actions: ['workInProgress']
                },
                TASK_DONE: {
                    actions: [
                        'contextLogs',
                        'eventLogs',
                        'sendResponseDataToSpawnWorker'
                    ]
                },
                PRODUCE_MESSAGE_TO_DOMAIN: {
                    actions: [
                        "eventLogs",
                        "produceMessage"
                    ]
                },
                TASK_COMPLETE: {
                    actions: [
                        'contextLogs',
                        'eventLogs',
                        'taskCompleted'
                    ]
                }
            }
        }
    }
}

export default config