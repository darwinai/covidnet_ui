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
  columnNames: string[],
  columnValues: number[],
  geographic: riskStratifcation | null,
  opacity: riskStratifcation | null
}

// change chrisIntegration to return this instead of Ianalysis
export type StudyInstanceWithSeries = {
  dcmImage: DcmImage,
  analysisCreated: string, 
  series: ISeries[] //ideally is 1. it DOES represent one individual thing, but why it holds multiple series (more than one) doesn't make sense.
}

export type selectedImageType = {
  studyInstance: StudyInstanceWithSeries | null,
  index: number
}

export type IPrevAnalysesState = {
  listOfAnalysis: StudyInstanceWithSeries[];
  page: number;
  perpage: number;
  totalResults: number;
  areNewImgsAvailable: boolean;
  selectedImage: selectedImageType;
}

export let initialIPrevAnalysesState: IPrevAnalysesState = {
  listOfAnalysis: [],
  page: 1,
  perpage: 10,
  totalResults: 50, // fake initial number
  areNewImgsAvailable: false,
  selectedImage: {
    studyInstance: null,
    index: 0
  },
}

type AnalysesPayload = {
  [AnalysisTypes.Update_page]: { page: number },
  [AnalysisTypes.Update_perpage]: { perpage: number },
  [AnalysisTypes.Update_list]: { list: StudyInstanceWithSeries[] }
  [AnalysisTypes.Update_total]: { total: number },
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
    case AnalysisTypes.Update_page:
      return {
        ...state,
        page: action.payload.page
      }
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
    case AnalysisTypes.Update_total:
      return {
        ...state,
        totalResults: action.payload.total
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