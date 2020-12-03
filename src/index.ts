import { interpret } from 'xstate'
import WorkerMachine from './machines/worker'

const workerService = interpret(WorkerMachine)
workerService.onTransition(({ value, event, context }) => {
    // console.log("@CURREN_EVENT: ", event);
    // console.log("@CURREN_EVENT PAYLOAD: ", event.payload?.payload, typeof event.payload?.payload);
    const { client_id, spawn_id } = context
    // if (event.type === 'CONNECTED') {
    //     setTimeout(() => {
    //         workerService.send({
    //             type: "RECEIVED_DATA",
    //             payload: {
    //                 "type": "TASK",
    //                 "payload": {
    //                     "type": "CREATE_USER",
    //                     client_id,
    //                     spawn_id,
    //                     "payload": {
    //                         "first_name": "Test First name",
    //                         "last_name": "Test Last name",
    //                         "email": "test@gmail.com"
    //                     }
    //                 }
    //             }
    //         })
    //     }, 1000)
    // }

    // if (event.type === 'PRODUCE_MESSAGE_TO_DOMAIN') {
    //     if (event.payload.type === 'CHECK_USER_EXIST') {
    //         setTimeout(() => {
    //             workerService.send({
    //                 type: "RECEIVED_DATA",
    //                 payload: {
    //                     "type": "DOMAIN_RESPONSE",
    //                     client_id,
    //                     spawn_id,
    //                     "payload": {
    //                         "type": "CREATE_NEW_USER",
    //                         "payload": {
    //                             "isUserExist": true
    //                         }
    //                     }
    //                 }
    //             })
    //         }, 1000)
    //     } else if (event.payload.type === 'CREATE_NEW_USER') {
    //         // setTimeout(() => {
    //         //     workerService.send({
    //         //         type: "RECEIVED_DATA",
    //         //         payload: {
    //         //             "type": "DOMAIN_RESPONSE",
    //         //             client_id,
    //         //             spawn_id,
    //         //             "payload": {
    //         //                 "type": "SEND_EMAIL",
    //         //                 "payload": {
    //         //                     "success": true,
    //         //                     "message": "USER SUCCESSFULLY CREATED!"
    //         //                 }
    //         //             }
    //         //         }
    //         //     })
    //         // }, 1000)
    //     }
    // }
})
workerService.start()