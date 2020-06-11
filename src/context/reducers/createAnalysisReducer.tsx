import { ActionMap, CreateAnalysisTypes } from "../actions/types";


export type ICreateAnalysisState = {
  patientID: string;
}

export const initialICreateAnalysisState: ICreateAnalysisState = {
  patientID: ""
}


type CreateAnalysisPayload = {
  [CreateAnalysisTypes.Update_patient_ID]: { patientID: string }
}

export type CreateAnalysisActions = ActionMap<CreateAnalysisPayload>[
  keyof ActionMap<CreateAnalysisPayload>
]

export const createAnalysisReducer = (
  state: ICreateAnalysisState,
  action: CreateAnalysisActions
) => {
  switch (action.type) {
    case CreateAnalysisTypes.Update_patient_ID:
      return {
        ...state,
        patientID: action.payload.patientID
      }
    default:
      return state;
  }
}