import { PatientPersonalInfo, SelectedStudies } from "../context/reducers/createAnalysisReducer";
import { DcmImage } from "../context/reducers/dicomImagesReducer";
import { NotificationItem } from "../context/reducers/notificationReducer";
import ChrisIntegration, { BackendPollResult } from "./chris_integration";
import NotificationService from "./notificationService";

export interface StudyInstance {
  studyInstanceUID: string;
  studyDescription: string;
  modality: string;
  createdDate: string;
}

export interface AnalyzedImageResult {
  image: DcmImage,
  processedResults: BackendPollResult[];
}

class CreateAnalysisService {

  static formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getFullYear()} ${date.getMonth() + 1} ${date.getDate()}`
  }

  static formatGender(gender: string): string {
    return gender.includes('F') ? 'Female' : 'Male';
  }

  static extractPatientPersonalInfo(dcmImage: DcmImage): PatientPersonalInfo {
    return {
      patientName: dcmImage.PatientName,
      patientAge: dcmImage.PatientAge,
      patientBirthdate: this.formatDate(dcmImage.PatientBirthDate),
      patientGender: this.formatGender(dcmImage.PatientSex)
    }
  }

  static calculatePatientAge(patientDOB: string): number {
    const today = new Date();
    const dob = new Date(patientDOB);
    return today.getFullYear() - dob.getFullYear();
  }

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
          createdDate: this.formatDate(img.creation_date)
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

  static async analyzeImages(dcmImages: DcmImage[]): Promise<NotificationItem[]> {
    const promises = [];
    for (let img of dcmImages) {
      promises.push(ChrisIntegration.processOneImg(img));
    }
    const processedImages = await Promise.allSettled(promises);

    const results: AnalyzedImageResult[] = [];
    processedImages.forEach((processedImage, index) => {
      if (processedImage.status === "fulfilled") {
        results.push({
          image: dcmImages[index],
          processedResults: processedImage.value
        })
      }
    });

    const notifications = results.map(result => NotificationService.analyzedImageToNotification(result));

    return notifications;
  }
}

export default CreateAnalysisService;