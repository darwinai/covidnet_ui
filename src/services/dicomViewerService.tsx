import ChrisAPIClient from "../api/chrisapiclient";
import { windowLevelBounds } from "../services/renderService";

export enum windowLevelType {
  brightness,
  contrast
}

class DicomViewerService {

  static async fetchImageFile(imageId: string): Promise<Blob> {
    let client: any = await ChrisAPIClient.getClient();
    let imageData = await client.getFile(imageId);
    return (await imageData.getFileBlob());
  }

  static maxMinWindowLevel(newWindowLevel: number, type: windowLevelType) {
    const maxValue = (type === windowLevelType.brightness) ? windowLevelBounds.MAX_BRIGHTNESS: windowLevelBounds.MAX_CONTRAST;
    const minValue = (type === windowLevelType.brightness) ? windowLevelBounds.MIN_BRIGHTNESS: windowLevelBounds.MIN_CONTRAST;
    newWindowLevel = Math.max(newWindowLevel, minValue);
    newWindowLevel = Math.min(newWindowLevel, maxValue);
    return newWindowLevel;
  }
}

export default DicomViewerService;
