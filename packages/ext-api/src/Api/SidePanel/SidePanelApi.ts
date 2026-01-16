import { AbstractApi } from "../../AbstractApi";
import { PanelBehaviour } from "./PanelBehaviour";

export class SidePanelApi extends AbstractApi
{
  public static setPanelBehaviour(behaviour: PanelBehaviour): Promise<void>
  {
    return this.getBrowserApi().sidePanel.setPanelBehavior(behaviour);
  }
}
