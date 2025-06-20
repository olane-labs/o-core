import { oNode } from '../node';
import { oAddress } from '../core/o-address';
import { oRequest } from '../core/lib/o-request';

(async () => {
  // setup the root leader node

  // setup the host node
  const node = new oNode({
    address: new oAddress('o://node'),
  });

  await node.start();

  await new Promise((resolve) => setTimeout(resolve, 5_000));

  await node.stop();
})();
