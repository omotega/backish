import { Iorganization } from "../../types/organization";
import Organization from "../model/organization";

async function createOrganization(payload: Iorganization) {
  return Organization.create(payload);
}

async function find(payload: any) {
  return await Organization.findOne(payload);
}


export default {
  createOrganization,
  find,
};
