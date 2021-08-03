import { ActionMap, ImageViewerTypes } from "../actions/types";

export enum ImagesViewerMods {
  ZOOM = 'ZOOM',
  PAN = 'PAN',
  WINDOW_LEVEL = 'WINDOW_LEVEL'
}

export type IimgViewerState = {
  mod: ImagesViewerMods;
  isBottomHided: boolean;
  isImgInverted: boolean;
  isImgMaskApplied: boolean;
}

export const initialIimgViewer: IimgViewerState = {
  mod: ImagesViewerMods.ZOOM,
  isBottomHided: false,
  isImgInverted: false,
  isImgMaskApplied: false
}

type IimgViewerPayload = {
  [ImageViewerTypes.Update_view_mod]: { mod: ImagesViewerMods }
  [ImageViewerTypes.Update_is_bottom_hidded]: { isBottomHided: boolean }
  [ImageViewerTypes.Update_is_img_inverted]: { isImgInverted: boolean }
  [ImageViewerTypes.Update_is_img_mask_applied]: { isImgMaskApplied: boolean }
}

export type IimgViwerActions = ActionMap<IimgViewerPayload>[
  keyof ActionMap<IimgViewerPayload>
]

export const imgViewerReducer = (
  state: IimgViewerState,
  action: IimgViwerActions
) => {
  switch (action.type) {
    case ImageViewerTypes.Update_view_mod:
      return {
        ...state,
        mod: action.payload.mod
      }
    case ImageViewerTypes.Update_is_bottom_hidded:
      return {
        ...state,
        isBottomHided: action.payload.isBottomHided
      }
    case ImageViewerTypes.Update_is_img_inverted:
      return {
        ...state, 
        isImgInverted: action.payload.isImgInverted
      }
    case ImageViewerTypes.Update_is_img_mask_applied:
      return {
        ...state,
        isImgMaskApplied: action.payload.isImgMaskApplied
      }
    default:
      return state;
  }
}