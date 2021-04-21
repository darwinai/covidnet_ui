import { NotificationItem, NotificationItemVariant } from "../context/reducers/notificationReducer";
import { AnalyzedImageResult } from "./CreateAnalysisService";
import moment from 'moment';

class NotificationService {
  static failedAnalysisNotifications(analyzedImageResult: AnalyzedImageResult): NotificationItem {
    return ({
      variant: NotificationItemVariant.DANGER,
      title: `Analysis of image '${analyzedImageResult.image.fname.split('/').pop()}' failed`,
      message: `During the analysis, the following error was raised:
          ${analyzedImageResult.processedResults.plugin} ${analyzedImageResult.processedResults.error!.message}.`,
      timestamp: moment()
    });
  }
}

export default NotificationService;
