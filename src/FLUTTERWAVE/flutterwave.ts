// import {
//   Controller,
//   unauthorizedError,
//   unknownEventError,
// } from "../../utilities";
// import { controller } from "../../core";
// import {
//   fetchTransaction,
//   fetchTransactions,
//   payWithFlw,
//   updateFlwTransaction,
// } from "../../services";
// import config from "../../config";
// import { paymentSchema } from "../../schemas";

// export const validateFlwWebhook: Controller = async (req, res) => {
//   const hash = config.FLW_SECRET_HASH;
//   if (hash !== req.headers["verif-hash"])
//     return res.status(401).json({ message: unauthorizedError });
//   const data = req.body;
//   if (data) {
//     return controller({
//       req,
//       res,
//       params: {
//         data,
//       },
//       service: updateFlwTransaction,
//     });
//   } else {
//     return res.status(400).json({ message: unknownEventError });
//   }
// };

// export const createFlwPayment: Controller = (req, res) =>
//   controller({
//     req,
//     res,
//     service: payWithFlw,
//     validation: { schema: paymentSchema },
//   });

// export const getTransactions: Controller = (req, res) =>
//   controller({
//     req,
//     res,
//     service: fetchTransactions,
//   });

// export const getTransaction: Controller = (req, res) =>
//   controller({
//     req,
//     res,
//     service: fetchTransaction,
//     params: { id: Number(req.params.id) },
//   });
