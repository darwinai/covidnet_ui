import { StudyInstanceWithSeries } from "../context/reducers/analyseReducer";
import { DcmImage } from "../context/reducers/dicomImagesReducer";

export enum Processing {
  analysisAreProcessing = 'AnalysisAreProcessing'
}

class PastAnalysisService {

  static groupDcmImagesToStudyInstances(dcmImages: DcmImage[]) {
    const studyInstanceUIDMap: {[uid: string]: boolean} = {}
    const studyInstances: StudyInstanceWithSeries[] = []
    dcmImages.forEach((img: DcmImage) => {
      if (!studyInstanceUIDMap[img.StudyInstanceUID]) {
        studyInstances.push({
          dcmImage: img,
          analysisCreated: Processing.analysisAreProcessing, 
          series: []
        })
        studyInstanceUIDMap[img.StudyInstanceUID] = true
      }
    })
    return studyInstances;
  }
}

export default PastAnalysisService