// import { oNode } from '../node';
// import { oAddress } from '../core/o-address';
// import { oRequest } from '../core/lib/o-request';

// (async () => {
//   // setup the root leader node

//   // setup the host node
//   const node = new oNode({
//     address: new oAddress('o://node'),
//   });

//   await node.start();

//   const response = await node.use(
//     new oAddress('o://node'),
//     new oRequest({
//       address: new oAddress('o://node'),
//       params: {
//         type: 'handshake',
//       },
//     }),
//   );

//   // setup the client node
//   const client = new oNode({
//     address: new oAddress('o://client'),
//   });

//   await client.start();

//   const clientResponse = await client.use(
// })();
