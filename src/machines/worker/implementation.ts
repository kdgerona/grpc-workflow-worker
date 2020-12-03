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
        produceMessage: send(({ client_id }, event) => ({
            type: "STREAM_TO_SERVER",
            payload: {
                type: event.type,
                client_id,
                topic: event.topic,
                task_id: event.task_id,
                payload: {
                    ...event.payload
                }
            }
        }), { to: 'grpc-client' }),
        // TODO
        // add current_state in work PROGRESS
        workInProgress: send(({ client_id }, { task_id }) => ({
            type: "STREAM_TO_SERVER",
            payload: {
                type: "WORK_PROGRESS",
                client_id,
                task_id,
                payload: {
                    success: true,
                    message: 'working'
                }
            }
        }), { to: 'grpc-client' }),
        acknowledgeTask: send(({ client_id }, { task_id }) => ({
            type: "STREAM_TO_SERVER",
            payload: {
                type: "TASK_ACK",
                client_id,
                task_id,
                payload: {
                    success: true,
                    message: 'task acknowledge'
                }
            }
        }), { to: 'grpc-client' }),
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
            const { payload: { type }, task_id } = event
            const spawn_id = `${client_id}-${task_id}`
            const list_of_workers: any = workers
            const worker_key = type.toLowerCase()
            return {
                ...context,
                [`${spawn_id}`]: spawn(list_of_workers[`${worker_key}`], spawn_id)
            }
        }),
        sendDataToSpawnWorker: send(({ client_id }, event) => ({
            type: "START_WORK",
            client_id,
            task_id: event.task_id,
            payload: event.payload
        }), { to: ({ client_id }, { task_id }) => `${client_id}-${task_id}` }),
        sendResponseDataToSpawnWorker: send(({ client_id }, event) => ({
            type: event.payload.type,
            client_id,
            task_id: event.task_id,
            payload: event.payload.payload
        }), { to: ({ client_id }, { task_id }) => `${client_id}-${task_id}` })
    },
    services: {
        initGrpcClient: GrpcClient
    },
    guards: {},
    activities: {},
    delays: {}
}

export default implementation