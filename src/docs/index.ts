import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import Yaml from "yamljs";

const docRouter = Router();
const docs = Yaml.load("./src/docs/endpoints.yaml");

docRouter.use("/", swaggerUi.serve, swaggerUi.setup(docs));

export default docRouter;
