export interface IWorkerContext {
    client_id?: string
}

export interface IWorkerSchema {
    states: {
        start: {}
    }
}

export interface IWorkerEvents {
    type:
        | 'RECEIVED_DATA'
        | 'CONNECTED'
        | 'TASK'
}