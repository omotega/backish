// // import { initializeTransactionError, InitFlwData } from "../utilities";
// // import { task } from "../core";
// // import config from "../config";
// // import axios from "axios";

// const initFlwTransaction = async (reference: string, data: InitFlwData) =>
//   task(async () => {
//     const { email, amount, callbackUrl } = data;

//     const res = await axios.post(
//       "https://api.flutterwave.com/v3/payments",
//       {
//         email,
//         amount: amount,
//         currency: "USD",
//         tx_ref: reference,
//         redirect_url: callbackUrl ?? `${config.CALLBACK_URL}&id=${reference}`,
//         customer: {
//           email: email,
//           phonenumber: data.phone,
//           name: data.fullname,
//         },
//         customizations: {
//           title: "Vuba Payments",
//           logo: "https://d1ebhd88wvb8ws.cloudfront.net/uploads/image/1678373903073-313307-vuba_logo.jpg",
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${config.FLW_SECRET_KEY}`,
//           "Accept-Encoding": "identity",
//         },
//       }
//     );

//     if (!res.data.status) return { error: initializeTransactionError };
//     const { link: paymentUrl } = res.data.data;

//     return {
//       data: {
//         paymentUrl,
//       },
//     };
//   });

// const chargeCard = async (amount: number, authCode: string) => {
//   console.log(amount, authCode);
// };

// const getTransaction = async (reference: string) => {
//   console.log(reference);
// };

// const verifyFlwTransaction = async (ref: string) => {
//   const res = await axios.get(
//     `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${ref}`,
//     // `https://api.flutterwave.com/v3/transactions/:${id}/verify`,
//     {
//       headers: {
//         Authorization: `Bearer ${config.FLW_SECRET_KEY}`,
//         "Accept-Encoding": "identity",
//       },
//     }
//   );
//   const data = res.data.data;
//   return {
//     data,
//   };
// };

// export const flw = {
//   initFlwTransaction,
//   chargeCard,
//   getTransaction,
//   verifyFlwTransaction,
// };
