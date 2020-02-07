import { PubsubMessage } from '@google-cloud/pubsub/build/src/publisher';
import { TypeOfSchema } from '@susisu/type-of-schema';

import Ajv = require('ajv');
import { checkStock } from './stock';
import * as slack from './slack';

const request = {
  type: 'object',
  properties: {
    item: { type: 'string' },
    store: { type: 'string' },
    notify_not_today: { type: 'boolean' },
    slack: {
      type: 'object',
      properties: {
        webhook: { type: 'string' },
        channel: { type: 'string' },
      },
      required: ['webhook'],
    },
  },
  required: ['item', 'store', 'slack'],
} as const;

function validate(input: any): input is TypeOfSchema<typeof request> {
  const ajv = new Ajv();
  return ajv.compile(request)(input) as boolean;
}

export const check = async (message: PubsubMessage) => {
  const data: unknown = JSON.parse(
    Buffer.from((message.data || '').toString(), 'base64').toString()
  );
  if (!validate(data)) return;

  const stock = await checkStock(data.item, data.store);
  console.info(JSON.stringify(stock))

  if (typeof stock.product === 'undefined') {
    slack.notifyError(
      data.slack,
      `item not found: item: ${data.item}, store: ${data.store}`
    );
  }

  if (stock.available || data.notify_not_today) {
    await slack.notifyToSlack(data.slack, stock);
  }
};
