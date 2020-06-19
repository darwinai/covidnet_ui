import { DcmImage } from "./dicomImagesReducer";
import { StagingDcmImagesTypes, ActionMap } from "../actions/types";

export type IStagingDcmImgs = DcmImage[];

export const initialIStagingDcmImgsState: IStagingDcmImgs = [];

type IStagingDcmImgsPayload = {
  [StagingDcmImagesTypes.UpdateStaging]: { imgs: DcmImage[] };
}

export type StagingDcmImgsActions = ActionMap<IStagingDcmImgsPayload>[
  keyof ActionMap<IStagingDcmImgsPayload>
]

export const stagingDcmImgsReducer = (
  state: IStagingDcmImgs,
  action: StagingDcmImgsActions
) => {
  switch (action.type) {
    case StagingDcmImagesTypes.UpdateStaging:
      return action.payload.imgs
    default: 
      return state;
  }
}