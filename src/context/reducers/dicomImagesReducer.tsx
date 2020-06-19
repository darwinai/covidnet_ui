import { ActionMap, DicomImagesTypes } from "../actions/types";


export interface DcmImage {
  id: number,
  creation_date: string,
  fname: string,
  PatientId: string
  PatientName: string,
  PatientBirthDate: string,
  PatientAge: number,
  PatientSex: string,
  StudyInstanceUID: string,
  StudyDescription: string,
  SeriesInstanceUID: string,
  SeriesDescription: string
}

export type IDcmImagesState = DcmImage[];

export const initialIDcmImagesState: IDcmImagesState = []

type IDcmImagesStatePayload = {
  [DicomImagesTypes.UpdateImages]: { images: DcmImage[] }
}

export type DicomImagesActions = ActionMap<IDcmImagesStatePayload>[
  keyof ActionMap<IDcmImagesStatePayload>
]


export const dicomImagesReducer = (
  state: IDcmImagesState,
  action: DicomImagesActions
) => {
  switch (action.type) {
    case DicomImagesTypes.UpdateImages:
      return action.payload.images
    default:
      return state;
  }
}