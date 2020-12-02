import {
    MachineConfig
} from 'xstate'

import {
    IMachineContext,
    IMachineSchema,
    IMachineEvent
} from './dataTypes'

const config: MachineConfig < IMachineContext, IMachineSchema, IMachineEvent > = {
    id: 'create_user',
    context: {
        payload: {
            first_name: '',
            last_name: '',
            email: '',
            success: false
        },
        prev_payload: {
            first_name: '',
            last_name: '',
            email: '',
            success: false
        },
        data_history: []
    },
    initial: 'idle',
    states: {
        idle: {
            on: {
                START_WORK: {
                    actions: [
                        'saveDataToContext',
                        'eventLogs',
                        'contextLogs'
                    ],
                    target: 'create_new_user'
                }
            }
        },
        create_new_user: {
            entry: 'produceMessageCreateNewUserToDomain',
            on: {
                // SEND_EMAIL: {
                //     actions: [
                //         'saveDataToContext',
                //         'eventLogs',
                //         'contextLogs'
                //     ],
                //     target: 'send_email'
                // }
                TASK_DONE: {
                    target: 'success'
                }
            }
        },
        // send_email: {
        //     entry: 'produceMessageSendEmailToDomain',
        //     on: {
        //         TASK_DONE: {
        //             target: 'success'
        //         }
        //     }
        // },
        success: {
            entry: 'notifyParentWorkSuccess',
            type: 'final'
        }
    }
}
export default config