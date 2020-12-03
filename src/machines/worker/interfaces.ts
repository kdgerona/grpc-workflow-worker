export interface IWorkerContext {
    client_id?: string,
    is_acknowledged: boolean,
    spawn_id: string,
    total_jobs_limit: number,
    total_jobs_taken: number
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
        | 'READY'
        | 'TASK_ACKNOWLEDGED'
        | 'WORK_PROGRESS'
        | 'TASK_DONE'
        | 'PRODUCE_MESSAGE_TO_DOMAIN'
        | 'DOMAIN_RESPONSE'
}