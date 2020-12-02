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
        eventLogs:  log((_:any, event: any) => `${event.type} event logs: ${JSON.stringify(event, null, 4)}`),
        contextLogs:  log((context:any) => `context logs: ${JSON.stringify(context, null, 4)}`),
        saveDataToContext: assign((ctx, {
            payload
        }) => ({
            ...ctx,
            ...payload,
            prev_payload: {
                ...ctx.payload
            },
            data_history: [
                ...ctx.data_history,
                ctx.payload
            ]
        })),
        produceMessageCreateNewUserToDomain: sendParent((ctx) => {
            const {
                payload
            } = ctx
            return {
                type: "PRODUCE_MESSAGE_TO_DOMAIN",
                payload: {
                    type: "CREATE_NEW_USER",
                    payload
                }
            }
        }),
        produceMessageSendEmailToDomain: sendParent((ctx) => {
            const {
                prev_payload: payload
            } = ctx
            return {
                type: "PRODUCE_MESSAGE_TO_DOMAIN",
                payload: {
                    type: "SEND_EMAIL",
                    payload
                }
            }
        }),
        notifyParentWorkSuccess: sendParent(({
            prev_payload,
            payload
        }) => ({
            type: "TASK_DONE",
            payload: {
                payload,
                prev_payload
            }
        }))
    },
    services: {},
    delays: {},
    activities: {},
    guards: {}
}
export default implementation