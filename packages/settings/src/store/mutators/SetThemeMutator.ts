import { AbstractMutator, Action } from "treeduxjs";
import { SettingsStore, type SettingsStoreInterface } from "../SettingsStore";
import type { ThemeId } from "../../themes";

type SetThemePayload = {
  themeId: ThemeId;
};

export class SetThemeMutator extends AbstractMutator<SettingsStoreInterface> {
  public getType(): string {
    return `${SettingsStore.KEY}/set_theme`;
  }

  public getAction(themeId: ThemeId): Action<SetThemePayload> {
    return Action.create(
      {
        type: this.getType(),
        payload: { themeId },
      },
      this.treedux
    );
  }

  public reduce(state: SettingsStoreInterface, action: Action<SetThemePayload>): void {
    state.theme = action.payload.themeId;
  }
}
