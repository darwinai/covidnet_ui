import { DcmImage } from "../context/reducers/dicomImagesReducer";
import { PatientPersonalInfo, SelectedStudies } from "../context/reducers/createAnalysisReducer";

export interface StudyInstance {
  studyInstanceUID: string;
  studyDescription: string;
  modality: string;
  createdDate: string;
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

  static extractStudyInstances(dcmImages: DcmImage[]): StudyInstance[] {
    const studyInstances: StudyInstance[] = [];
    const seenUID: { [uid: string]: boolean } = {}
    dcmImages.forEach((img: DcmImage) => {
      // met a new uid
      if (!seenUID[img.StudyInstanceUID]) {
        studyInstances.push({
          studyInstanceUID: img.StudyInstanceUID,
          studyDescription: img.StudyDescription,
          modality: 'XRAY',
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
}

export default CreateAnalysisService;