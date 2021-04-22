import { SelectedStudies } from "../context/reducers/createAnalysisReducer";
import { DcmImage } from "../context/reducers/dicomImagesReducer";
import { NotificationItem } from "../context/reducers/notificationReducer";
import ChrisIntegration, { BackendPollResult } from "./chris_integration";
import NotificationService from "./notificationService";
import { formatDate } from "../shared/utils";
import { PluginInstance } from "@fnndsc/chrisapi";

export interface StudyInstance {
  studyInstanceUID: string;
  studyDescription: string;
  modality: string;
  studyDate: string;
  setModelType?: (modality: string) => void;
}

export interface AnalyzedImageResult {
  image: DcmImage;
  processedResults: BackendPollResult;
}

class CreateAnalysisService {

  static extractStudyInstances(dcmImages: DcmImage[]): StudyInstance[] {
    const studyInstances: StudyInstance[] = [];
    const seenUID: { [uid: string]: boolean } = {}
    dcmImages.forEach((img: DcmImage) => {
      // met a new uid
      if (!seenUID[img.StudyInstanceUID]) {
        studyInstances.push({
          studyInstanceUID: img.StudyInstanceUID,
          studyDescription: img.StudyDescription,
          modality: img.Modality,
          studyDate: formatDate(img.StudyDate)
        })
        seenUID[img.StudyInstanceUID] = true;
      }
    })

    return studyInstances;
  }

  static returnAllImagesInOneStudy(dcmImages: DcmImage[], studyUID: string): DcmImage[] {
    return dcmImages.filter((dcmImage: DcmImage) => dcmImage.StudyInstanceUID === studyUID);
  }

  // finds total number of images in the selectedStudies
  static findTotalImages(selectedStudies: SelectedStudies): number {
    return Object.keys(selectedStudies)
      .map((key: string) => Object.keys(selectedStudies[key]).length)
      .reduce((total, ele) => total + ele, 0)
  }

  static isImgSelected(
    selectedStudyUIDs: SelectedStudies,
    { StudyInstanceUID, SeriesInstanceUID }: DcmImage
  ): boolean {
    const imagesSelectedInThisStudy = selectedStudyUIDs[StudyInstanceUID];
    return !!imagesSelectedInThisStudy && !!imagesSelectedInThisStudy[SeriesInstanceUID];
  }

  static pickImages(imgs: DcmImage[], selectedStudyUIDs: SelectedStudies): DcmImage[] {
    return imgs.filter((img: DcmImage) => this.isImgSelected(selectedStudyUIDs, img));
  }

  /**
   * Runs an analysis on each of the DcmImages
   * @param {DcmImage[]} dcmImages - The list of DICOM data to run analyses on
   * @param {string} XrayModel - The name of the COVID-Net model to use on x-ray images
   * @param {string} CTModel - The name of the COVID-Net model to use on the CT images
   * @returns {Promise<NotificationItem[]>} Notifications of any plugin failures that occur in processOneImg
   */
  static async analyzeImages(dcmImages: DcmImage[], XrayModel: string, CTModel: string): Promise<NotificationItem[]> {
    const timestamp = + new Date();
    const processedImages = await Promise.allSettled(dcmImages.map(async (img: DcmImage) => {
      return await ChrisIntegration.processOneImg(img, timestamp, XrayModel, CTModel)
    }));

    const results = await processedImages.flatMap((img: PromiseSettledResult<BackendPollResult>, index: number) => {
      if (img?.status === "fulfilled" && img?.value?.error) {
        return {
          image: dcmImages[index],
          processedResults: img.value
        };
      } else {
        return [];
      }
    });

    return results.map((result: AnalyzedImageResult) => NotificationService.failedAnalysisNotifications(result));
  }
}

export default CreateAnalysisService;
