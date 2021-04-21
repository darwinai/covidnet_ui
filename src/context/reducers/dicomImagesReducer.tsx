import { ActionMap, DicomImagesTypes } from "../actions/types";

export interface DcmImage {
  id: number;
  creation_date: string;
  fname: string;
  PatientID: string;
  PatientName: string;
  PatientBirthDate: string;
  PatientAge: number;
  PatientSex: string;
  StudyInstanceUID: string;
  StudyDescription: string;
  SeriesInstanceUID: string;
  SeriesDescription: string;
  StudyDate: string;
  Modality: string;
  pacs_identifier: string;
}

export interface PACSResponseProperty {
  tag: number;
  value: string;
  label: string;
}

export interface PACSResponseNumericProperty {
  tag: number;
  value: number;
  label: string;
}

export interface PACSBaseResponse {
  uid: PACSResponseNumericProperty;
  SpecificCharacterSet: PACSResponseProperty;
  StudyDate: PACSResponseProperty;
  SeriesDate: PACSResponseProperty;
  AccessionNumber: PACSResponseProperty;
  QueryRetrieveLevel: PACSResponseProperty;
  RetrieveAETitle: PACSResponseProperty;
  Modality: PACSResponseProperty;
  ModalitiesInStudy: PACSResponseProperty;
  StudyDescription: PACSResponseProperty;
  SeriesDescription: PACSResponseProperty;
  PatientName: PACSResponseProperty;
  PatientID: PACSResponseProperty;
  PatientBirthDate: PACSResponseProperty;
  PatientSex: PACSResponseProperty;
  PatientAge: PACSResponseNumericProperty;
  StudyInstanceUID: PACSResponseProperty;
  SeriesInstanceUID: PACSResponseProperty;
  InstanceNumber: PACSResponseProperty;
  NumberOfSeriesRelatedInstances: PACSResponseProperty;
  PerformedStationAETitle: PACSResponseProperty;
}

export interface PACSSeries extends PACSBaseResponse {
  label: PACSResponseProperty;
  command: PACSResponseProperty;
  status: PACSResponseProperty;
}

export interface PACSMainResponse extends PACSBaseResponse {
  series: PACSSeries[];
}

export type IDcmImagesState = {
  allDcmImages: DcmImage[];
  filteredDcmImages: DcmImage[];
}

export interface PFDCMResponse {
  status: boolean;
  query?: {
    status: string;
    data: PACSMainResponse[];
    command: string;
    report: object;
}
  retrieve?: {
    status: string;
    data: any[];
    command: string;
    returncode: number;
  }
}

export const initialIDcmImagesState: IDcmImagesState = {
  allDcmImages: [],
  filteredDcmImages: []
}

type IDcmImagesStatePayload = {
  [DicomImagesTypes.Update_all_images]: { images: DcmImage[] },
  [DicomImagesTypes.Update_filtered_images]: { images: DcmImage[] }
}

export type DicomImagesActions = ActionMap<IDcmImagesStatePayload>[
  keyof ActionMap<IDcmImagesStatePayload>
]

export const dicomImagesReducer = (
  state: IDcmImagesState,
  action: DicomImagesActions
) => {
  switch (action.type) {
    case DicomImagesTypes.Update_all_images:
      return {
        ...state,
        allDcmImages: action.payload.images,
        filteredDcmImages: action.payload.images
      }
    case DicomImagesTypes.Update_filtered_images:
      return {
        ...state,
        filteredDcmImages: action.payload.images
      }
    default:
      return state;
  }
}
