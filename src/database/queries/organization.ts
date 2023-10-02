import { Iorganization } from "../../types/organization";
import Organization from "../model/organization";

async function createOrganization(payload: Iorganization) {
  return Organization.create(payload);
}

export default {
  createOrganization,
};
