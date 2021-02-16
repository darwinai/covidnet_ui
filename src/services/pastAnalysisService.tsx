import { StudyInstanceWithSeries, ISeries } from "../context/reducers/analyseReducer";
import { DcmImage } from "../context/reducers/dicomImagesReducer";

export enum Processing {
  analysisAreProcessing = 'AnalysisAreProcessing'
}

class PastAnalysisService {

  static groupDcmImagesToStudyInstances(dcmImages: DcmImage[]) {
    const studyInstances: StudyInstanceWithSeries[] = []

    // Group DcmImages by their StudyInstanceUIDs
    const studyInstanceUIDMap = new Map<string, DcmImage[]>();
    dcmImages.forEach((img: DcmImage) => {
      const dcmImages = studyInstanceUIDMap.get(img.StudyInstanceUID);
      if (!dcmImages) {
        studyInstanceUIDMap.set(img.StudyInstanceUID, [img]);
      } else {
        dcmImages.push(img);
      }
    });

    // Create study instances with their series
    studyInstanceUIDMap.forEach((images: DcmImage[]) => {
      studyInstances.push({
        // Use first DcmImage as reference for accessing common properties such as StudyDescription, PatientID, etc.
        dcmImage: images?.[0],
        analysisCreated: Processing.analysisAreProcessing, 
          series: images.map((image: DcmImage): ISeries => ({
            imageName: image.fname
          }))
      });
    })

    return studyInstances;
  }
}

export default PastAnalysisService