import { interpret } from 'xstate'
import WorkerMachine from './machines/worker'

const workerService = interpret(WorkerMachine)

workerService.start()