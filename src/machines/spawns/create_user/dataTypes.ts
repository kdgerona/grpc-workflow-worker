interface IPayload {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
    success?: boolean,
    type? : string,
    task_id? : string,
    to?: string,
    message?: string
}
interface IMachineContext {
    payload: IPayload,
    prev_payload: IPayload,
    data_history: Array<object>,
    current_state: string,
    topic: string
}

interface IMachineSchema {
    states: {
        idle: {},
        get_user_by_email: {},
        create_user: {},
        send_email: {},
        success: {}
    }
}

interface IMachineEvent {
    type: "EVENT"
    | "START_WORK"
    | "RESPONSE"
    | "REINITIALIZING"
    | "GET_USER_BY_EMAIL"
    | "CREATE_USER"
    | "SEND_EMAIL"
    | "TASK_DONE"
    payload?: IPayload
}

export {
    IMachineContext,
    IMachineSchema,
    IMachineEvent
}