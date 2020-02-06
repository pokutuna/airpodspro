import fetch, { Response } from 'node-fetch';

import { StockInfo } from './stock';

export async function notifyToSlack(
  slack: { webhook: string; channel?: string },
  stock: StockInfo
): Promise<Response> {
  const payload = {
    username: 'えあぽ彦 Pro',
    icon_url: stock.storeImageUrl,
    attachments: [
      {
        title: stock.storeName,
        text: stock.available
          ? ':exclamation: 今あります :exclamation:'
          : '在庫ないです',
        fields: [
          {
            title: '受取日',
            value: stock.when,
            short: true,
          },
          {
            title: '商品',
            value: `${stock.productTitle} (${stock.partNumber})`,
            short: true,
          },
        ],
      },
    ],
  };
  return notify(slack.webhook, payload);
}

export async function notifyError(
  slack: { webhook: string; channel?: string },
  message: string
): Promise<Response> {
  return notify(slack.webhook, { text: message });
}

function notify(url: string, payload: any): Promise<Response> {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
