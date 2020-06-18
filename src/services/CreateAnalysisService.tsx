import { DcmImage } from "../context/reducers/dicomImagesReducer";
import { PatientPersonalInfo } from "../context/reducers/createAnalysisReducer";

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

  static formatGender(gender:string): string {
    return gender.includes('F') ? 'Female': 'Male';
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
    const seenUID: {[uid: string]: boolean} = {}
    dcmImages.forEach((img: DcmImage) => {
      // met a new uid
      if (!seenUID[img.StudyInstanceUID]) {
        studyInstances.push({
          studyInstanceUID: img.StudyInstanceUID,
          studyDescription: img.StudyDescription,
          modality: 'XRAY',
          createdDate:this.formatDate(img.creation_date)
        })
        seenUID[img.StudyInstanceUID] = true;
      }
    })
    
    return studyInstances;
  }
}

export default CreateAnalysisService;