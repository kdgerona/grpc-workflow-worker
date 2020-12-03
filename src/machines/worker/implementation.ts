import { MachineOptions, actions, send, assign, spawn } from 'xstate'
import GrpcClient from '../grpc-client'
import { IWorkerContext } from './interfaces'
const { log } = actions
const uuid = require('uuid')
import workers from '../spawns'
const implementation: MachineOptions<IWorkerContext, any> = {
    actions: {
        eventLogs:  log((_:any, event: any) => `${event.type} event logs: ${JSON.stringify(event, null, 4)}`),
        contextLogs:  log((context:any) => `context logs: ${JSON.stringify(context, null, 4)}`),
        // notifyWorkflowWorkerReady: send((_, event) => ({
        //     type: "STREAM_TO_SERVER",
        //     payload: {
        //         ...event.payload.payload,
        //         type: "READY",
        //     }
        // }), { to: 'grpc-client' }),
        workInProgress: send((_, event) => ({
            type: "WORK_PROGRESS"
        })),
        acknowledgeTask: send((_, event) => ({
            type: "TASK_ACK"
        })),
        sendReceivedEvent: send((_, event) => ({
            ...event.payload
        })),
        assignClientId: assign((ctx, { client_id }) => ({ 
            ...ctx, 
            client_id
        })),
        taskReceived: log('I received a task'),
        initSpawnRef: assign((context, event) => {
            const { client_id } = context
            const { payload: { type } } = event
            const spawn_id = `${client_id}-${uuid.v4()}`
            const list_of_workers: any = workers
            const worker_key = type.toLowerCase()
            return {
                ...context,
                spawn_id,
                [`${spawn_id}`]: spawn(list_of_workers[`${worker_key}`], spawn_id)
            }
        }),
        sendDataToSpawnWorker: send(({ spawn_id }, event) => ({
            type: "START_WORK",
            spawn_id,
            payload: event.payload
        }), { to: ({ spawn_id }) => spawn_id }),
        sendResponseDataToSpawnWorker: send(({ spawn_id, client_id }, event) => ({
            type: event.payload.type,
            spawn_id,
            client_id,
            payload: event.payload.payload
        }), { to: ({ spawn_id }) => spawn_id })
    },
    services: {
        initGrpcClient: GrpcClient
    },
    guards: {},
    activities: {},
    delays: {}
}

export default implementation