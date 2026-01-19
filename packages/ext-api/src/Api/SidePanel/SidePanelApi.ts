import { AbstractApi } from "../../AbstractApi";
import type { PanelBehaviour } from "./types";

export class SidePanelApi extends AbstractApi {
  public static setPanelBehaviour(behaviour: PanelBehaviour): Promise<void> {
    return this.getBrowserApi().sidePanel.setPanelBehavior(behaviour);
  }
}
