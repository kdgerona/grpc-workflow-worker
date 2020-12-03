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
        data_history: [],
        current_state: 'idle',
        topic: ''
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
                    target: 'get_user_by_email'
                    // target: 'success'
                }
            }
        },
        get_user_by_email: {
            entry: [
                'setCurrentStateGetUserByEmail',
                'requestToProduceMessageGetUserByEmailToDomain'
            ],
            on: {
                GET_USER_BY_EMAIL: [
                    {
                        cond: 'isEmailExist',
                        actions: [
                            'saveDataToContext',
                            'eventLogs',
                            'contextLogs'
                        ],
                        target: 'create_user'
                    },
                    {
                        actions: [
                            'eventLogs'
                        ],
                        target: 'success'
                    }
                ]
            }
        },
        create_user: {
            entry: [
                'setCurrentStateCreateUser',
                'requestToProduceMessageCreateUserToDomain'
            ],
            on: {
                SEND_EMAIL: {
                    actions: [
                        'saveDataToContext',
                        'eventLogs',
                        'contextLogs'
                    ],
                    target: 'send_email'
                }
            }
        },
        send_email: {
            entry: [
                'setCurrentStateSendEmail',
                'requestToProduceMessageSendEmailToDomain'
            ],
            on: {
                TASK_DONE: {
                    target: 'success'
                }
            }
        },
        success: {
            entry: 'notifyParentWorkSuccess',
            type: 'final'
        }
    }
}
export default config