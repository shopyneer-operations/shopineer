import { MedusaService } from "@medusajs/framework/utils";
import { Abandoned } from "./abandoned";
import { Lifetime } from "awilix";
import { EntityManager } from "@mikro-orm/knex";
import { Logger } from "@medusajs/medusa/types";
import { PluginOptions } from "../../../types/abandoned";

type InjectedDependencies = {
  logger: Logger;
  manager: EntityManager;
};

class AbandonedModuleService extends MedusaService({ Abandoned }) {
  static LIFE_TIME = Lifetime.SCOPED;
  protected logger_: Logger;
  protected options_: PluginOptions;
  protected manager_: EntityManager;

  constructor(container: InjectedDependencies, options: PluginOptions) {
    super(...arguments);
  }
}

export default AbandonedModuleService;
