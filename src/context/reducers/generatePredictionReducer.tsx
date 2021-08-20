import { ActionMap, GeneratePredictionTypes } from "../actions/types";

export type IGeneratePredictionState = {
  patientID?: string;
  selectedStudyUIDs: SelectedStudies;
  currSelectedStudyUID: string;
}

export interface SelectedStudies {
  [uid: string]: {
    [SeriesInstanceUID: string]: string
  }
}

export const initialIGeneratePredictionState: IGeneratePredictionState = {
  patientID: '',
  currSelectedStudyUID: '',
  selectedStudyUIDs: {}
}

type GeneratePredictionPayload = {
  [GeneratePredictionTypes.Update_patient_ID]: { patientID: string },
  [GeneratePredictionTypes.Add_selected_studies_UID]: {
    studyUID: string;
    SeriesInstanceUID: string;
    fname: string;
  },
  [GeneratePredictionTypes.Remove_selected_studies_UID]: {
    studyUID: string;
    SeriesInstanceUID: string;
    fname: string;
  },
  [GeneratePredictionTypes.UpdateCurrSelectedStudyUID]: {
    studyUID: string;
  },
  [GeneratePredictionTypes.Clear_selected_studies_UID]: {}
}

export type GeneratePredictionActions = ActionMap<GeneratePredictionPayload>[
  keyof ActionMap<GeneratePredictionPayload>
]

export const generatePredictionReducer = (
  state: IGeneratePredictionState,
  action: GeneratePredictionActions
) => {
  switch (action.type) {
    case GeneratePredictionTypes.Update_patient_ID:
      return {
        ...state,
        patientID: action.payload.patientID,
        selectedStudyUIDs: {},
        currSelectedStudyUID: ""
      }
    case GeneratePredictionTypes.Add_selected_studies_UID:
      return {
        ...state,
        selectedStudyUIDs: {
          ...state.selectedStudyUIDs,
          [action.payload.studyUID]: {
            ...state.selectedStudyUIDs[action.payload.studyUID],
            [action.payload.SeriesInstanceUID]: action.payload.fname
          }
        }
      }
    case GeneratePredictionTypes.Remove_selected_studies_UID:
      const prevStudy = state.selectedStudyUIDs[action.payload.studyUID];
      const { [action.payload.SeriesInstanceUID]: deleted, ...studyWithFileRemoved } = prevStudy;
      const selectedFilesInNewStudy = Object.keys(studyWithFileRemoved).length;
      if (selectedFilesInNewStudy > 0) {
        return {
          ...state,
          selectedStudyUIDs: {
            ...state.selectedStudyUIDs,
            [action.payload.studyUID]: studyWithFileRemoved
          }
        }
      } else {
        const { [action.payload.studyUID]: deletedStudy, ...studyWithTargetStudyRemoved } = state.selectedStudyUIDs;
        return {
          ...state,
          selectedStudyUIDs: studyWithTargetStudyRemoved
        }
      }
    case GeneratePredictionTypes.Clear_selected_studies_UID:
      return {
        ...state,
        selectedStudyUIDs: {}
      }
    case GeneratePredictionTypes.UpdateCurrSelectedStudyUID:
      return {
        ...state,
        currSelectedStudyUID: action.payload.studyUID
      }
    default:
      return state;
  }
}