import { MachineOptions, actions, send, assign, spawn } from 'xstate'
import GrpcClient from '../grpc-client'
import { IWorkerContext } from './interfaces'
const { log } = actions
const uuid = require('uuid')
import workers from '../spawns'
const implementation: MachineOptions<IWorkerContext, any> = {
    actions: {
        eventLogs:  log((_:any, event: any) => `${event.type} event logs: ${JSON.stringify(event, null, 4)}`),
        notifyWorkflowWorkerReady: send((_, event) => ({
            type: "STREAM_TO_SERVER",
            payload: {
                ...event.payload,
                type: "READY"
            }
        }), { to: 'grpc-client' }),
        sendReceivedEvent: send((context, event) => ({
            type: event.payload.type,
            payload: context
        })),
        assignClientId: assign((_, { client_id }) => ({ client_id })),
        taskReceived: log('I received a task'),
        initSpawnRef: assign((context, event) => {
            const { payload: { client_id = '', worker_id = '', type } } = event
            // const spawn_id = `${client_id || worker_id}-${uuid.v4()}`
            // testing
            const spawn_id = `test-spawn-id-1`
            const list_of_workers: any = workers
            const worker_key = type.toLowerCase()
            // TODO
            // if spawn worker does not exist notify workflow, no worker can handle the request
            return {
                ...context,
                spawn_id,
                [`${spawn_id}`]: spawn(list_of_workers[`${worker_key}`], spawn_id)
            }
        }),
        sendDataToSpawnWorker: send((_, event) => ({
            type: "START_WORK",
            payload: event.payload
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