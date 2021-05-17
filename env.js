export const {
  QUEUE_SERVER = 'localhost:5672',
  INPUT_QUEUE_NAME = 'test-in',
  OUTPUT_QUEUE_NAME = 'test-out',
  RECONNECT_TIMEOUT = 3000,           // Time to retry to connect to AMQP
  RECONNECT_MAX = 30,                 // Maximum attempts to reconnect
} = process.env
