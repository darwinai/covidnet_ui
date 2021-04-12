import { ActionMap, CreateAnalysisTypes } from "../actions/types";

export type ICreateAnalysisState = {
  patientID?: string;
  selectedStudyUIDs: SelectedStudies;
  currSelectedStudyUID: string;
}

export interface SelectedStudies {
  [uid: string]: {
    [SeriesInstanceUID: string]: string
  }
}

export const initialICreateAnalysisState: ICreateAnalysisState = {
  patientID: '',
  currSelectedStudyUID: '',
  selectedStudyUIDs: {}
}

type CreateAnalysisPayload = {
  [CreateAnalysisTypes.Update_patient_ID]: { patientID: string },
  [CreateAnalysisTypes.Add_selected_studies_UID]: {
    studyUID: string;
    SeriesInstanceUID: string;
    fname: string;
  },
  [CreateAnalysisTypes.Remove_selected_studies_UID]: {
    studyUID: string;
    SeriesInstanceUID: string;
    fname: string;
  },
  [CreateAnalysisTypes.UpdateCurrSelectedStudyUID]: {
    studyUID: string;
  },
  [CreateAnalysisTypes.Clear_selected_studies_UID]: {}
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
        patientID: action.payload.patientID,
        selectedStudyUIDs: {},
        currSelectedStudyUID: ""
      }
    case CreateAnalysisTypes.Add_selected_studies_UID:
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
    case CreateAnalysisTypes.Remove_selected_studies_UID:
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
    case CreateAnalysisTypes.Clear_selected_studies_UID:
      return {
        ...state,
        selectedStudyUIDs: {}
      }
    case CreateAnalysisTypes.UpdateCurrSelectedStudyUID:
      return {
        ...state,
        currSelectedStudyUID: action.payload.studyUID
      }
    default:
      return state;
  }
}