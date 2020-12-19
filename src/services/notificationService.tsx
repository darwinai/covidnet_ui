import { NotificationItem, NotificationItemVariant } from "../context/reducers/notificationReducer";
import { AnalyzedImageResult } from "./CreateAnalysisService";
import moment from 'moment';

class NotificationService {
  static analyzedImageToNotification(analyzedImageResult: AnalyzedImageResult): NotificationItem {
    const hasError = analyzedImageResult.processedResults.some(result => !!result.error);
    if (hasError) {
      const pluginsWithError = analyzedImageResult.processedResults.filter(result => !!result.error);
      const formattedMessages = pluginsWithError.map(el => `plugin ${el.plugin} ${el.error!.message}`)
      return ({
        variant: NotificationItemVariant.DANGER,
        title: `Analysis of image '${analyzedImageResult.image.fname.split('/').pop()}' failed`,
        message: `During the analysis, the following error${pluginsWithError.length > 1 ? 's were' : ' was'} raised:
          ${formattedMessages.join(';')}.`,
        timestamp: moment()
      });
    }
    return ({
      variant: NotificationItemVariant.SUCCESS,
      title: `Analysis of image '${analyzedImageResult.image.fname.split('/').pop()}' finished`,
      message: `The image was processed successfully.`,
      timestamp: moment()
    })
  }
}

export default NotificationService;