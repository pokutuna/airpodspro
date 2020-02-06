import fetch from 'node-fetch';
import { URL } from 'url';

export interface StockInfo {
  product?: any;
  when?: string;
  productTitle?: string;
  partNumber?: string;
  storeName?: string;
  storeImageUrl?: string;
  available: boolean;
}

export async function checkStock(
  item: string,
  store: string
): Promise<StockInfo> {
  const url = new URL('https://www.apple.com/jp/shop/retail/pickup-message');
  url.searchParams.append('parts.0', item);
  url.searchParams.append('store', store);
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      const store = data.body?.stores?.[0];
      const product = store?.partsAvailability?.[item];
      const when = (product?.pickupSearchQuote || '').split('<br/>')[1]
      return {
        product,
        when,
        productTitle: product?.storePickupProductTitle,
        partNumber: product?.partNumber,
        storeName: store?.address?.address,
        storeImageUrl: store?.storeImageUrl,
        available: product?.pickupDisplay === 'available',
      };
    });
}
