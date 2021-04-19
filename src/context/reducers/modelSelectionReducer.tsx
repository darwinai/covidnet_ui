import { ActionMap, UpdatingModelSelectionTypes } from "../actions/types";
import { PluginModels } from "../../api/app.config"

export type ModelSelection = {
   xrayModel: string,
   ctModel: string
  };

export const initialModelSelectionState: ModelSelection = {
    xrayModel: Object.keys(PluginModels.XrayModels)[0],
    ctModel: Object.keys(PluginModels.CTModels)[0]
};

type modelSelectionPayload = {
  [UpdatingModelSelectionTypes.XrayModelSelection]: { xrayModel: string };
  [UpdatingModelSelectionTypes.CTModelSelection]: { ctModel: string };
};

export type UpdatingModelSelectionActions = ActionMap<modelSelectionPayload>[
  keyof ActionMap<modelSelectionPayload>
];

export const updatingModelSelectionReducer = (
  state: ModelSelection,
  action: UpdatingModelSelectionActions
) => {
  switch (action.type) {
    case UpdatingModelSelectionTypes.XrayModelSelection:
      return { ...state, xrayModel: action.payload.xrayModel};
    case UpdatingModelSelectionTypes.CTModelSelection:
      return { ...state, ctModel: action.payload.ctModel};
    default:
      return state;
  }
};
