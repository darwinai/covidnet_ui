import ChrisIntegration from "./chris_integration";
import { StudyInstanceWithSeries } from "../context/reducers/analyseReducer";

class PastAnalysisService {

  static async groupIAnalysisToStudyGroups(page: number, perpage: number): Promise<StudyInstanceWithSeries[]> {
    const analysisList = await ChrisIntegration.getPastAnalaysis(page, perpage);
    return analysisList
  }
}

export default PastAnalysisService