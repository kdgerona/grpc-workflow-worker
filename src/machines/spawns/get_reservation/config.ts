import {
    MachineConfig
} from 'xstate'

import {
    IMachineContext,
    IMachineSchema,
    IMachineEvent
} from './dataTypes'

const config: MachineConfig < IMachineContext, IMachineSchema, IMachineEvent > = {
    id: 'get_reservation',
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
                    target: 'get_reservation'
                    // target: 'send_email'
                }
            }
        },
        get_reservation: {
            entry: [
                'setCurrentStateGetReservation',
                'requestToProduceMessageGetReservationToDomain',
                //'notifyParentForCurrentState'
            ],
            on: {
                TASK_DONE: {
                    actions: [
                        'saveDataToContext',
                        'eventLogs',
                        'contextLogs'
                    ],
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