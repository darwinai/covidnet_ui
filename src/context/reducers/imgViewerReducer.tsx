import { ImageViewerTypes, ActionMap } from "../actions/types";

export enum ImagesViewerMods {
  ZOOM = 'ZOOM',
  PAN = 'PAN',
  WINDOW_LEVEL = 'WINDOW_LEVEL'
}

export type IimgViewerState = {
  mod: null | ImagesViewerMods;
  isBottomHided: boolean;
}

export const initialIimgViewer: IimgViewerState = {
  mod: null,
  isBottomHided: false
}

type IimgViewerPayload = {
  [ImageViewerTypes.Update_view_mod]: { mod: ImagesViewerMods }
  [ImageViewerTypes.Update_is_bottom_hidded]: { isBottomHided: boolean }
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
    default:
      return state;
  }
}