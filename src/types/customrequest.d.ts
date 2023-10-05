import { Iuser } from "./user";

export interface CustomRequest {
  User: Iuser;
  reference: string;
  file: object;
  params: object;
  query: object;
  path: object;
}
