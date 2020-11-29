const config = {
    id: 'worker',
    initial: 'start',
    states: {
        start: {
            invoke: [
                {
                    id: 'grpc-client',
                    src: 'initGrpcClient'
                }
            ],
            on: {
                RECEIVED_DATA: {
                    actions: ['logReceivedData']
                }
            }
        }
    }
}

export default config