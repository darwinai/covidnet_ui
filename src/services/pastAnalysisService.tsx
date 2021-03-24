import { StudyInstanceWithSeries, ISeries } from "../context/reducers/analyseReducer";
import { DcmImage } from "../context/reducers/dicomImagesReducer";

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
        analysisCreated: "", 
          series: images.map((image: DcmImage): ISeries => ({
            covidnetPluginId: 0, 
            imageName: image.fname,
            imageId: "",
            geographic: null,
            opacity: null,
            classifications: new Map<string, number>(),
          }))
      });
    })

    return studyInstances;
  }
}

export default PastAnalysisService