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
        setCurrentStateGetUserByEmail: assign((ctx) => ({ 
            ...ctx,
            current_state: 'get_user_by_email',
            topic: 'USER'
        })),
        setCurrentStateCreateUser: assign((ctx) => ({ 
            ...ctx,
            current_state: 'create_user',
            topic: 'USER'
        })),
        setCurrentStateSendEmail: assign((ctx) => ({ 
            ...ctx,
            current_state: 'send_email',
            topic: 'EMAIL'
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
        // notifyParentForCurrentState: sendParent((ctx, { payload: evt_payload = {} }) => {
        //     const {
        //         topic,
        //         task_id,
        //         client_id
        //     } = ctx
        //     return {
        //         type: "WORKING_IN_PROGRESS",
        //         topic,
        //         task_id,
        //         payload: {
        //             type: "STREAM_TO_SERVER",
        //             payload: {
        //                 client_id,
        //                 task_id,
        //                 payload: {
        //                     success: true,
        //                     message: 'still working'
        //                 }
        //             }
        //         }
        //     }
        // }),
        requestToProduceMessageGetUserByEmailToDomain: sendParent((ctx, { payload: evt_payload = {} }) => {
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
                    type: "GET_USER_BY_EMAIL",
                    data: payload
                }
            }
        }),
        requestToProduceMessageCreateUserToDomain: sendParent((ctx, { payload: evt_payload = {} }) => {
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
                    type: "CREATE_USER",
                    data: payload
                }
            }
        }),
        requestToProduceMessageSendEmailToDomain: sendParent((ctx, { payload: evt_payload = {} }) => {
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
                    type: "SEND_EMAIL",
                    data: payload
                }
            }
        }),
        notifyParentWorkSuccess: sendParent(({
            payload,
            task_id
        }) => ({
            type: "TASK_COMPLETE",
            payload: {
                type: "TASK_COMPLETE",
                task_id,
                payload
            }
        }))
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