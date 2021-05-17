import {
  QUEUE_SERVER,
  INPUT_QUEUE_NAME as qIn,
  OUTPUT_QUEUE_NAME as qOut,
  RECONNECT_TIMEOUT,
  RECONNECT_MAX,
} from './env.js';
import amqp from 'amqplib';
let retries = 0;

const asyncTimeout = time => new Promise(resolve => setTimeout(resolve, time))

async function getConnection() {
    try {
        return await amqp.connect(`amqp://${QUEUE_SERVER}`);
    }
    catch (err) {
        retries++;
        if (retries > RECONNECT_MAX) throw err
        console.warn(`Connection to ${QUEUE_SERVER} failed (attempt ${retries}). Retrying in ${RECONNECT_TIMEOUT / 1000} seconds...`)
        await asyncTimeout(RECONNECT_TIMEOUT);
        return await getConnection();
    }
}

async function main() {
  const connection = await getConnection();
  const ch = await connection.createChannel();
  await ch.assertQueue(qOut, { durable: true });
  await ch.assertQueue(qIn, { durable: true });

  console.log(`Waiting for messages in '${qIn}'. Output will be sended to '${qOut}'. To exit press CTRL+C`);

  ch.consume(qIn, async msg => {
    console.log("Running test");

    const args = JSON.parse(msg.content.toString());
    const backText = "There might be a problem in the text ";

    if (args.text instanceof String) {
      backText = args.text.split("").reverse().join("");
    }

    ch.sendToQueue(qOut, Buffer.from(JSON.stringify({
      ...args,
      'echo-image': args.image,
      'echo-video': args.video,
      'backwords-text': backText,
    })), { persistent: true });

    ch.ack(msg);
    console.log("Test completed");
  });
}

main();