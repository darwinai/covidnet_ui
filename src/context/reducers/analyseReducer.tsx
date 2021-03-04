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

export type StudyInstanceWithSeries = {
  dcmImage: DcmImage,
  analysisCreated: string, 
  series: ISeries[]
}

export type selectedImageType = {
  studyInstance: StudyInstanceWithSeries | null,
  index: number
}

export type IPrevAnalysesState = {
  listOfAnalysis: StudyInstanceWithSeries[];
  perpage: number;
  areNewImgsAvailable: boolean;
  selectedImage: selectedImageType;
}

export let initialIPrevAnalysesState: IPrevAnalysesState = {
  listOfAnalysis: [],
  perpage: 10,
  areNewImgsAvailable: false,
  selectedImage: {
    studyInstance: null,
    index: 0
  },
}

type AnalysesPayload = {
  [AnalysisTypes.Update_perpage]: { perpage: number },
  [AnalysisTypes.Update_list]: { list: StudyInstanceWithSeries[] }
  [AnalysisTypes.Update_are_new_imgs_available]: { isAvailable: boolean },
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
    case AnalysisTypes.Update_list:
      return {
        ...state,
        listOfAnalysis: action.payload.list
      }
    case AnalysisTypes.Update_are_new_imgs_available:
      return {
        ...state,
        areNewImgsAvailable: action.payload.isAvailable
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
