import { ActionMap, AnalysisTypes } from "../actions/types";
import { DcmImage } from "./dicomImagesReducer";

export type riskStratifcation = {
  severity: number,
  extentScore: number
}

export type ISeries = {
  covidnetPluginId: number, 
  imageName: string,
  imageId: string,
  geographic: riskStratifcation | null,
  opacity: riskStratifcation | null,
  classifications: Map<string, number>, // Holding classification classes/values in map
  imageUrl?: string,
}

export type TPluginStatuses = {
  jobsDone: number,
  jobsRunning: number,
  jobsErrored: number
}

export type StudyInstanceWithSeries = {
  feedIds: number[],
  dcmImage: DcmImage,
  analysisCreated: string,
  series: ISeries[],
  pluginStatuses: TPluginStatuses
}

export type selectedImageType = {
  dcmImage?: DcmImage
  series?: ISeries
}

export type IPrevAnalysesState = {
  perpage: number;
  selectedImage: selectedImageType;
}

export let initialIPrevAnalysesState: IPrevAnalysesState = {
  perpage: 10,
  selectedImage: {},
}

type AnalysesPayload = {
  [AnalysisTypes.Update_perpage]: { perpage: number },
  [AnalysisTypes.Update_selected_image]: { selectedImage: selectedImageType }
}

export type AnalysisActions = ActionMap<AnalysesPayload>[
  keyof ActionMap<AnalysesPayload>
]

export const analysesReducer = (
  state: IPrevAnalysesState,
  action: AnalysisActions
) => {
  switch (action.type) {
    case AnalysisTypes.Update_perpage:
      console.log(action.payload.perpage)
      return {
        ...state,
        perpage: action.payload.perpage
      }
    case AnalysisTypes.Update_selected_image: 
      return {
        ...state,
        selectedImage: action.payload.selectedImage
      }
    default:
      return state;
  }
}
