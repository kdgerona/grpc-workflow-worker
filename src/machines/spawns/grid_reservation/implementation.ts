import {
    sendParent,
    assign,
    MachineOptions,
    actions
} from 'xstate'
import {
    IMachineContext,
    IMachineEvent
} from './dataTypes'

const { log } = actions
const implementation: MachineOptions < IMachineContext, IMachineEvent > = {
    actions: {
        eventLogs:  log((_:any, event: any) => `${event.type} spawn-worker event logs: ${JSON.stringify(event, null, 4)}`),
        contextLogs:  log((context:any) => `spawn-worker context logs: ${JSON.stringify(context, null, 4)}`),
        setCurrentStateGridReservation: assign((ctx) => ({ 
            ...ctx,
            current_state: 'grid_reservation',
            topic: 'USER'
        })),
        saveDataToContext: assign((ctx, {
            payload,
            task_id
        }: any) => ({
            ...ctx,
            ...payload,
            prev_payload: {
                ...ctx.payload
            },
            data_history: [
                ...ctx.data_history,
                ctx.payload
            ],
            task_id
        })),
        requestToProduceMessageGridReservationToDomain: sendParent((ctx, { payload: evt_payload = {} }) => {
            const {
                payload,
                topic,
                task_id
            } = ctx
            return {
                type: "PRODUCE_MESSAGE_TO_DOMAIN",
                topic,
                task_id,
                payload: {
                    type: "GRID_RESERVATION",
                    data: payload
                }
            }
        }),
        notifyParentWorkSuccess: sendParent(({
            task_id
        }, { payload }: any) => {
            const parsed_payload = JSON.parse(payload)
            return {
                type: "TASK_COMPLETE",
                payload: {
                    type: "TASK_COMPLETE",
                    task_id,
                    payload: parsed_payload.result
                }
            }
        })
    },
    services: {},
    delays: {},
    activities: {},
    guards: {
        isEmailExist: (_, { payload = {} }: any) => {
            const parse_payload = JSON.parse(payload)
            return parse_payload.result.data.email
        }
    }
}
export default implementation