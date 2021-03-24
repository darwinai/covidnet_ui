import { NotificationItem, NotificationItemVariant } from "../context/reducers/notificationReducer";
import { AnalyzedImageResult } from "./CreateAnalysisService";
import moment from "moment";

class NotificationService {
  static analyzedImageToNotification(analyzedImageResult: AnalyzedImageResult): NotificationItem {
    const hasError = analyzedImageResult.processedResults.error;
    if (hasError) {
      return ({
        variant: NotificationItemVariant.DANGER,
        title: `Analysis of image '${analyzedImageResult.image.fname.split("/").pop()}' failed`,
        message: `During the analysis, the following error was raised:
          ${analyzedImageResult.processedResults.plugin} ${analyzedImageResult.processedResults.error!.message}.`,
        timestamp: moment()
      });
    }
    return ({
      variant: NotificationItemVariant.SUCCESS,
      title: `Analysis of image '${analyzedImageResult.image.fname.split("/").pop()}' finished`,
      message: `The image was processed successfully.`,
      timestamp: moment()
    })
  }
}

export default NotificationService;
