export interface IWorkerContext {}

export interface IWorkerSchema {
    states: {
        start: {}
    }
}

export interface IWorkerEvents {
    type:
        | 'RECEIVED_DATA'
}