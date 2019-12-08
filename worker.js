'use strict';

/**
 * 
 */
const child = require('child_process');

// AMQP
const amqp = require('amqplib');
const amqp_url = process.env.CLOUDAMQP_URL || "amqp://localhost";
const open = amqp.connect(amqp_url);

/**
 * 
 */
function start() {
  //
  open.then( con => {
    return con.createChannel();
  }).then( channel => {
    const topic = process.env.MSG_QUEUE_TOPIC_EXEC_TALEND;

    return channel.assertQueue(topic).then( ok => {
      return channel.consume(topic, async (msg) => {
        if (msg !== null) {
          const data = JSON.parse(msg.content.toString('utf8'));
          console.log(data);

          await exec_job(data);
    
          channel.ack(msg);
        }
      })
    })
  });
}

/**
 * 
 */
function exec_job (data) {
  return new Promise((resolve, reject) => {
    let res;
    let spawned = child.spawn('/app/custom_notification/custom_notification_run.sh', [data.message])
      .on('close', (code) => {
        if (code === 0) {
          console.log('--------------------- success');
          resolve(res);
        } else {
          console.log('--------------------- failed');
          reject(res);
        }
      });
    
  });

}

//
start();
