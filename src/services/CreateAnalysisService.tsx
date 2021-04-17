import { SelectedStudies } from "../context/reducers/createAnalysisReducer";
import { DcmImage } from "../context/reducers/dicomImagesReducer";
import { NotificationItem } from "../context/reducers/notificationReducer";
import ChrisIntegration, { BackendPollResult } from "./chris_integration";
import NotificationService from "./notificationService";
import { formatDate } from "../shared/utils";

export interface StudyInstance {
  studyInstanceUID: string;
  studyDescription: string;
  modality: string;
  createdDate: string;
  setModelType?: (modality: string) => void;
}

export interface AnalyzedImageResult {
  image: DcmImage,
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
          createdDate: formatDate(img.creation_date)
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
   * Runs pl-med2img and the pl-covidnet/pl-ct-covidnet given the pl-dircopy instances and DcmImgages generated from copyFiles
   * @param XrayModel 
   * @param CTModel 
   * @returns 
   */
  static async analyzeImages(dcmImages: DcmImage[], XrayModel: string, CTModel: string): Promise<NotificationItem[]> {
    const processedImages = await Promise.allSettled(dcmImages.map(async (img: DcmImage) => {
      return await ChrisIntegration.processOneImg(img, XrayModel, CTModel)
    }));

    const results = await processedImages.flatMap((img: PromiseSettledResult<BackendPollResult>, index: number) => {
      if (img.status === "fulfilled" && img.value.error) {
        return {
          image: dcmImages[index],
          processedResults: img.value
        }
      } else {
        return [];
      }
    });

    return results.map(result => NotificationService.analyzedImageToNotification(result));
  }
}

export default CreateAnalysisService;
